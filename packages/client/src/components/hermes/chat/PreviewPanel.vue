<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NInput } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Live preview of a locally-served web page (e.g. a dev server the agent
// started). The iframe loads the URL directly, so the dev server's own
// hot-reload (HMR) pushes updates straight into this pane — no extra wiring.
const url = ref('http://localhost:3000')
const liveUrl = ref('')
const iframeKey = ref(0)

function go() {
  let u = url.value.trim()
  if (!u) return
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`
  url.value = u
  liveUrl.value = u
  iframeKey.value++
}

function refresh() {
  if (!liveUrl.value) { go(); return }
  iframeKey.value++
}

function openExternal() {
  if (liveUrl.value) window.open(liveUrl.value, '_blank', 'noopener')
}

const quickPorts = [3000, 5173, 8080, 4321, 8000]
function openPort(port: number) {
  url.value = `http://localhost:${port}`
  go()
}
</script>

<template>
  <div class="preview-panel">
    <div class="preview-bar">
      <NButton size="small" quaternary :disabled="!liveUrl" @click="refresh" :title="t('preview.refresh')">⟳</NButton>
      <NInput
        v-model:value="url"
        :placeholder="t('preview.urlPlaceholder')"
        size="small"
        class="preview-url"
        @keyup.enter="go"
      />
      <NButton size="small" type="primary" @click="go">{{ t('preview.go') }}</NButton>
      <NButton size="small" quaternary :disabled="!liveUrl" @click="openExternal" :title="t('preview.openExternal')">↗</NButton>
    </div>
    <div class="preview-ports">
      <span class="ports-label">{{ t('preview.quick') }}</span>
      <NButton v-for="p in quickPorts" :key="p" size="tiny" tertiary @click="openPort(p)">{{ p }}</NButton>
    </div>

    <div class="preview-frame-wrap">
      <iframe
        v-if="liveUrl"
        :key="iframeKey"
        :src="liveUrl"
        class="preview-frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
      <div v-else class="preview-empty">
        <p>{{ t('preview.emptyTitle') }}</p>
        <p class="preview-hint">{{ t('preview.emptyHint') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.preview-url {
  flex: 1;
}

.preview-ports {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.ports-label {
  font-size: 12px;
  color: $text-muted;
}

.preview-frame-wrap {
  flex: 1;
  min-height: 0;
  position: relative;
  background: #ffffff;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.preview-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: $text-muted;
  text-align: center;
  padding: 24px;
}

.preview-hint {
  font-size: 12px;
}
</style>
