<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { NAlert, NButton, NEmpty, NInput, NSelect, NSpin, NTag, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  fetchPlugins,
  fetchCapabilityConfig,
  saveCapabilityConfig,
  type HermesPluginInfo,
  type HermesPluginsMetadata,
  type CapabilityConfig,
} from '@/api/hermes/plugins'
import { useProfilesStore } from '@/stores/hermes/profiles'

const { t, te } = useI18n()
const message = useMessage()
const profilesStore = useProfilesStore()

const plugins = ref<HermesPluginInfo[]>([])
const warnings = ref<string[]>([])
const metadata = ref<HermesPluginsMetadata | null>(null)
const loading = ref(false)
const error = ref('')

const capability = ref<CapabilityConfig | null>(null)
// Per-capability selected provider (for capabilities that route via "<cap>.provider")
const capProvider = reactive<Record<string, string>>({})
// Shared env-var input buffer, keyed by env var name (e.g. FAL_KEY).
const envInputs = reactive<Record<string, string>>({})
const savingKey = ref('')

// Categories that already have their own dedicated section elsewhere in the UI
// (model-providers -> Models, platforms -> Channels) or are internal dashboard
// infrastructure — they are intentionally NOT shown on this "extensions" page.
const EXCLUDE_KINDS = new Set(['model-provider', 'platform'])
const EXCLUDE_CATEGORIES = new Set(['dashboard_auth', 'example-dashboard', 'kanban', 'hermes-achievements'])
// Capabilities whose active backend is chosen via "<cap>.provider" in config.yaml.
const CAP_PROVIDER = ['image_gen', 'video_gen']
// Display order for capability categories (others fall to the end alphabetically).
const CATEGORY_ORDER = [
  'image_gen', 'video_gen', 'web', 'browser', 'memory',
  'observability', 'context_engine', 'security-guidance',
  'disk-cleanup', 'spotify', 'google_meet', 'teams_pipeline',
]

function categoryOf(plugin: HermesPluginInfo): string {
  const m = String(plugin.path || '').replace(/\\/g, '/').match(/\/plugins\/([^/]+)/)
  return m ? m[1] : 'other'
}

function categoryLabel(cat: string): string {
  const key = `plugins.category.${cat}`
  return te(key) ? t(key) : cat
}

function categoryDesc(cat: string): string {
  const key = `plugins.categoryDesc.${cat}`
  return te(key) ? t(key) : ''
}

interface EnvField { name: string; description: string; password: boolean }

function envFields(plugin: HermesPluginInfo): EnvField[] {
  return (plugin.requiresEnv || []).map((entry) => {
    if (typeof entry === 'string') return { name: entry, description: '', password: /key|token|secret|password/i.test(entry) }
    const obj = entry as Record<string, unknown>
    const name = String(obj.name || '')
    return {
      name,
      description: String(obj.description || ''),
      password: obj.password === true || /key|token|secret|password/i.test(name),
    }
  }).filter(f => f.name)
}

function envIsSet(name: string): boolean {
  return !!capability.value?.envKeys?.includes(name)
}

// Plugins that belong on this page, grouped by category and ordered.
const categories = computed(() => {
  const groups = new Map<string, HermesPluginInfo[]>()
  for (const p of plugins.value) {
    if (EXCLUDE_KINDS.has(p.kind)) continue
    const cat = categoryOf(p)
    if (EXCLUDE_CATEGORIES.has(cat)) continue
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(p)
  }
  return Array.from(groups.entries())
    .map(([cat, items]) => ({
      cat,
      label: categoryLabel(cat),
      desc: categoryDesc(cat),
      hasProvider: CAP_PROVIDER.includes(cat),
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.cat)
      const ib = CATEGORY_ORDER.indexOf(b.cat)
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
      return a.cat.localeCompare(b.cat)
    })
})

// Provider <select> options for a capability category (value = plugin name,
// which is exactly what "<cap>.provider" matches against in config.yaml).
function providerOptions(items: HermesPluginInfo[]) {
  return items.map(p => ({ label: p.name, value: p.name }))
}

// The env fields the currently-selected provider of a capability needs.
function selectedProviderEnvFields(cat: string, items: HermesPluginInfo[]): EnvField[] {
  const chosen = capProvider[cat]
  const plugin = items.find(p => p.name === chosen)
  return plugin ? envFields(plugin) : []
}

function statusLabel(plugin: HermesPluginInfo) {
  const key = `plugins.statusLabel.${plugin.effectiveStatus}`
  return te(key) ? t(key) : plugin.effectiveStatus
}

function statusTagType(plugin: HermesPluginInfo): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (plugin.effectiveStatus) {
    case 'enabled':
    case 'auto-active':
      return 'success'
    case 'disabled':
      return 'error'
    case 'provider-managed':
      return 'info'
    case 'inactive':
      return 'warning'
    default:
      return 'default'
  }
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    if (!profilesStore.activeProfileName || profilesStore.profiles.length === 0) {
      await profilesStore.fetchProfiles()
    }
    const [data, cap] = await Promise.all([fetchPlugins(), fetchCapabilityConfig()])
    plugins.value = data.plugins ?? []
    warnings.value = data.warnings ?? []
    metadata.value = data.metadata ?? null
    capability.value = cap
    for (const k of Object.keys(capProvider)) delete capProvider[k]
    Object.assign(capProvider, cap.providers || {})
  } catch (err: any) {
    error.value = err?.message || t('plugins.loadFailed')
  } finally {
    loading.value = false
  }
}

// Save a capability's chosen provider + the provider's env keys.
async function saveCapability(cat: string, items: HermesPluginInfo[]) {
  savingKey.value = cat
  try {
    const fields = selectedProviderEnvFields(cat, items)
    const env: Record<string, string> = {}
    for (const f of fields) {
      const v = (envInputs[f.name] ?? '').trim()
      if (v) env[f.name] = v
    }
    await saveCapabilityConfig({ capability: cat, provider: capProvider[cat] || '', env })
    message.success(t('plugins.saved'))
    for (const f of fields) delete envInputs[f.name]
    await loadAll()
  } catch (err: any) {
    message.error(err?.message || t('plugins.saveFailed'))
  } finally {
    savingKey.value = ''
  }
}

// Save just the env keys for a single (non-provider) plugin.
async function savePluginEnv(plugin: HermesPluginInfo) {
  savingKey.value = plugin.key
  try {
    const env: Record<string, string> = {}
    for (const f of envFields(plugin)) {
      const v = (envInputs[f.name] ?? '').trim()
      if (v) env[f.name] = v
    }
    if (Object.keys(env).length === 0) {
      message.warning(t('plugins.nothingToSave'))
      return
    }
    await saveCapabilityConfig({ env })
    message.success(t('plugins.saved'))
    for (const f of envFields(plugin)) delete envInputs[f.name]
    await loadAll()
  } catch (err: any) {
    message.error(err?.message || t('plugins.saveFailed'))
  } finally {
    savingKey.value = ''
  }
}

watch(() => profilesStore.activeProfileName || 'default', () => {
  plugins.value = []
  warnings.value = []
  metadata.value = null
  void loadAll()
}, { immediate: true })
</script>

<template>
  <div class="plugins-view">
    <header class="page-header">
      <h2 class="header-title">{{ t('plugins.title') }}</h2>
      <NButton size="small" quaternary :loading="loading" @click="loadAll">
        {{ t('plugins.refresh') }}
      </NButton>
    </header>

    <div class="plugins-content">
      <NAlert type="info" :bordered="false" class="plugins-notice">
        {{ t('plugins.notice') }}
      </NAlert>

      <NAlert v-if="error" type="error" class="plugins-notice">{{ error }}</NAlert>
      <NAlert v-for="warning in warnings" :key="warning" type="warning" class="plugins-notice">
        {{ warning }}
      </NAlert>

      <NSpin :show="loading && plugins.length === 0">
        <div v-if="categories.length" class="category-list">
          <section v-for="group in categories" :key="group.cat" class="category">
            <div class="category-head">
              <h3 class="category-title">{{ group.label }}</h3>
              <p v-if="group.desc" class="category-desc">{{ group.desc }}</p>
            </div>

            <!-- Capability with a selectable provider (image_gen / video_gen) -->
            <div v-if="group.hasProvider" class="provider-card">
              <div class="provider-row">
                <label class="field-label">{{ t('plugins.providerLabel') }}</label>
                <NSelect
                  v-model:value="capProvider[group.cat]"
                  :options="providerOptions(group.items)"
                  :placeholder="t('plugins.selectProvider')"
                  clearable
                  style="max-width: 320px"
                />
              </div>
              <div
                v-for="field in selectedProviderEnvFields(group.cat, group.items)"
                :key="field.name"
                class="env-row"
              >
                <label class="field-label">
                  {{ field.name }}
                  <NTag v-if="envIsSet(field.name)" size="tiny" type="success" round>{{ t('plugins.envSet') }}</NTag>
                </label>
                <NInput
                  v-model:value="envInputs[field.name]"
                  :type="field.password ? 'password' : 'text'"
                  show-password-on="click"
                  :placeholder="field.description || (envIsSet(field.name) ? t('plugins.envKeepPlaceholder') : t('plugins.envPlaceholder'))"
                  style="max-width: 480px"
                />
              </div>
              <div class="provider-hint">{{ t('plugins.providerHint') }}</div>
              <NButton
                type="primary"
                size="small"
                :loading="savingKey === group.cat"
                @click="saveCapability(group.cat, group.items)"
              >
                {{ t('plugins.save') }}
              </NButton>
            </div>

            <!-- Regular capability plugins: status + description + optional env keys -->
            <div v-else class="plugin-cards">
              <div v-for="plugin in group.items" :key="plugin.key" class="plugin-card">
                <div class="plugin-card-head">
                  <strong>{{ plugin.name }}</strong>
                  <NTag size="small" :type="statusTagType(plugin)">{{ statusLabel(plugin) }}</NTag>
                </div>
                <div v-if="plugin.description" class="description">{{ plugin.description }}</div>
                <template v-if="envFields(plugin).length">
                  <div v-for="field in envFields(plugin)" :key="field.name" class="env-row">
                    <label class="field-label">
                      {{ field.name }}
                      <NTag v-if="envIsSet(field.name)" size="tiny" type="success" round>{{ t('plugins.envSet') }}</NTag>
                    </label>
                    <NInput
                      v-model:value="envInputs[field.name]"
                      :type="field.password ? 'password' : 'text'"
                      show-password-on="click"
                      :placeholder="field.description || (envIsSet(field.name) ? t('plugins.envKeepPlaceholder') : t('plugins.envPlaceholder'))"
                      style="max-width: 480px"
                    />
                  </div>
                  <NButton
                    size="tiny"
                    secondary
                    :loading="savingKey === plugin.key"
                    @click="savePluginEnv(plugin)"
                  >
                    {{ t('plugins.save') }}
                  </NButton>
                </template>
              </div>
            </div>
          </section>
        </div>
        <NEmpty v-else-if="!loading" :description="t('plugins.noMatch')" />
      </NSpin>

      <div v-if="metadata" class="metadata-panel">
        <span>{{ t('plugins.metadata.agentRoot') }}: <code>{{ metadata.hermesAgentRoot }}</code></span>
        <span>{{ t('plugins.metadata.python') }}: <code>{{ metadata.pythonExecutable }}</code></span>
        <span>{{ t('plugins.metadata.projectPlugins') }}: <code>{{ metadata.projectPluginsEnabled ? t('plugins.enabled') : t('plugins.disabled') }}</code></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.plugins-view {
  height: calc(100 * var(--vh));
  display: flex;
  flex-direction: column;
}

.plugins-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.plugins-notice {
  margin-bottom: 14px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-head {
  margin-bottom: 10px;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.category-desc {
  font-size: 13px;
  color: $text-muted;
  margin: 4px 0 0;
}

.provider-card,
.plugin-card {
  background-color: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 16px;
}

.provider-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.plugin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.plugin-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.description {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 10px;
}

.provider-row,
.env-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  display: flex;
  align-items: center;
  gap: 6px;
}

.provider-hint {
  font-size: 12px;
  color: $text-muted;
}

.metadata-panel {
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: $text-muted;

  code {
    font-family: $font-code;
    color: $text-secondary;
  }
}
</style>
