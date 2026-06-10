<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NButton, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/hermes/settings'
import { launchBrowser } from '@/api/hermes/browser'
import SettingRow from './SettingRow.vue'

const settingsStore = useSettingsStore()
const message = useMessage()
const { t } = useI18n()

const cdpUrl = ref<string>(settingsStore.browser.cdp_url || 'http://127.0.0.1:9222')
const chromePath = ref<string>(settingsStore.browser.chrome_path || '')
const launching = ref(false)

const port = computed(() => {
  const m = cdpUrl.value.match(/:(\d{2,5})(?:\/|$)/)
  return m ? Number(m[1]) : 9222
})

async function saveCdpUrl() {
  try {
    await settingsStore.saveSection('browser', { cdp_url: cdpUrl.value.trim() })
    message.success(t('settings.saved'))
  } catch {
    message.error(t('settings.saveFailed'))
  }
}

async function saveChromePath() {
  try {
    await settingsStore.saveSection('browser', { chrome_path: chromePath.value.trim() })
    message.success(t('settings.saved'))
  } catch {
    message.error(t('settings.saveFailed'))
  }
}

async function handleLaunch() {
  launching.value = true
  try {
    // Persist current values first so config + agent are consistent.
    await settingsStore.saveSection('browser', {
      cdp_url: cdpUrl.value.trim(),
      chrome_path: chromePath.value.trim(),
    })
    await launchBrowser(port.value, chromePath.value.trim() || undefined)
    message.success(t('settings.browser.launchStarted', { port: port.value }))
  } catch (err: any) {
    message.error(err?.message || t('settings.browser.launchFailed'))
  } finally {
    launching.value = false
  }
}
</script>

<template>
  <section class="settings-section">
    <p class="browser-intro">{{ t('settings.browser.intro') }}</p>

    <SettingRow :label="t('settings.browser.cdpUrl')" :hint="t('settings.browser.cdpUrlHint')">
      <NInput v-model:value="cdpUrl" size="small" class="input-md" placeholder="http://127.0.0.1:9222" @blur="saveCdpUrl" />
    </SettingRow>

    <SettingRow :label="t('settings.browser.chromePath')" :hint="t('settings.browser.chromePathHint')">
      <NInput v-model:value="chromePath" size="small" class="input-md" :placeholder="t('settings.browser.chromePathPlaceholder')" @blur="saveChromePath" />
    </SettingRow>

    <SettingRow :label="t('settings.browser.launch')" :hint="t('settings.browser.launchHint')">
      <NButton type="primary" size="small" :loading="launching" @click="handleLaunch">
        {{ t('settings.browser.launchButton') }}
      </NButton>
    </SettingRow>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.settings-section {
  margin-top: 16px;
}
.browser-intro {
  margin: 0 0 12px;
  font-size: 13px;
  opacity: 0.75;
  line-height: 1.6;
}
.input-md {
  width: 320px;
  max-width: 100%;
}
</style>
