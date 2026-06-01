<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NAlert, NButton, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { fetchPairingStatus, startPairing, stopPairing, type PairingStartResult } from '@/api/hermes/pairing'

const { t } = useI18n()
const message = useMessage()

const loading = ref(false)
const busy = ref(false)
const configured = ref(true)
const running = ref(false)
const url = ref('')
const code = ref('')
const qr = ref('')
const expiresAt = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined

const remaining = computed(() => {
  if (!expiresAt.value) return 0
  return Math.max(0, Math.floor((expiresAt.value - now.value) / 1000))
})
const remainingText = computed(() => {
  const s = remaining.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
})

function apply(res: PairingStartResult) {
  url.value = res.url
  code.value = res.code
  qr.value = res.qr
  expiresAt.value = res.expiresAt
  running.value = true
}

async function load() {
  loading.value = true
  try {
    const s = await fetchPairingStatus()
    configured.value = s.configured
    running.value = s.running
    url.value = s.url
    code.value = s.code
    expiresAt.value = s.expiresAt
  } catch (err: any) {
    message.error(err?.message || t('pairing.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function start() {
  busy.value = true
  try {
    apply(await startPairing())
    message.success(t('pairing.started'))
  } catch (err: any) {
    message.error(err?.message || t('pairing.startFailed'))
  } finally {
    busy.value = false
  }
}

async function stop() {
  busy.value = true
  try {
    await stopPairing()
    running.value = false
    url.value = ''
    code.value = ''
    qr.value = ''
    expiresAt.value = 0
    message.success(t('pairing.stopped'))
  } catch (err: any) {
    message.error(err?.message || t('pairing.stopFailed'))
  } finally {
    busy.value = false
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    message.success(t('pairing.copied'))
  } catch { /* ignore */ }
}

onMounted(() => {
  void load()
  ticker = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => { if (ticker) clearInterval(ticker) })
</script>

<template>
  <div class="pairing-view">
    <header class="page-header">
      <h2 class="header-title">{{ t('pairing.title') }}</h2>
    </header>

    <div class="pairing-content">
      <NAlert type="info" :bordered="false" class="notice">{{ t('pairing.notice') }}</NAlert>

      <NAlert v-if="!configured" type="warning" class="notice">{{ t('pairing.notConfigured') }}</NAlert>

      <NSpin :show="loading">
        <div class="panel">
          <template v-if="!running">
            <p class="hint">{{ t('pairing.idleHint') }}</p>
            <NButton type="primary" size="large" :loading="busy" :disabled="!configured" @click="start">
              {{ t('pairing.start') }}
            </NButton>
          </template>

          <template v-else>
            <div class="qr-wrap">
              <img v-if="qr" :src="qr" alt="QR" class="qr-img" />
              <p v-else class="hint">{{ t('pairing.qrUnavailable') }}</p>
            </div>

            <div class="field">
              <span class="field-label">{{ t('pairing.code') }}</span>
              <div class="field-row">
                <code class="code-value">{{ code || '—' }}</code>
                <NButton size="tiny" secondary @click="copy(code)">{{ t('pairing.copy') }}</NButton>
              </div>
              <span v-if="remaining > 0" class="countdown">{{ t('pairing.expiresIn', { time: remainingText }) }}</span>
              <span v-else class="countdown expired">{{ t('pairing.expired') }}</span>
            </div>

            <div class="field">
              <span class="field-label">{{ t('pairing.url') }}</span>
              <div class="field-row">
                <code class="url-value">{{ url }}</code>
                <NButton size="tiny" secondary @click="copy(url)">{{ t('pairing.copy') }}</NButton>
              </div>
            </div>

            <div class="actions">
              <NButton :loading="busy" @click="start">{{ t('pairing.regenerate') }}</NButton>
              <NButton type="error" ghost :loading="busy" @click="stop">{{ t('pairing.stop') }}</NButton>
            </div>
          </template>
        </div>
      </NSpin>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.pairing-view {
  height: calc(100 * var(--vh));
  display: flex;
  flex-direction: column;
}

.pairing-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-width: 560px;
}

.notice {
  margin-bottom: 14px;
}

.panel {
  background-color: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
}

.hint {
  font-size: 14px;
  color: $text-secondary;
  margin: 0;
}

.qr-wrap {
  align-self: center;
}

.qr-img {
  width: 240px;
  height: 240px;
  border-radius: $radius-sm;
  background: #fff;
  padding: 8px;
}

.field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-value {
  font-family: $font-code;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  color: $accent-primary;
}

.url-value {
  font-family: $font-code;
  font-size: 13px;
  color: $text-secondary;
  word-break: break-all;
}

.countdown {
  font-size: 12px;
  color: $text-muted;

  &.expired {
    color: $error;
  }
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
</style>
