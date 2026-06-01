<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { setApiKey } from '@/api/client'
import { claimPairing } from '@/api/hermes/pairing'

const { t } = useI18n()
const router = useRouter()

type State = 'idle' | 'claiming' | 'error'
const state = ref<State>('idle')
const code = ref('')
const errorMsg = ref('')

function readCodeFromHash(): string {
  const hash = String(window.location.hash || '')
  const m = hash.match(/code=([A-Za-z0-9]+)/)
  return m ? m[1] : ''
}

async function pair(rawCode: string) {
  const value = String(rawCode || '').trim().toUpperCase()
  if (!value) {
    errorMsg.value = t('pair.codeRequired')
    state.value = 'error'
    return
  }
  state.value = 'claiming'
  errorMsg.value = ''
  try {
    const { token } = await claimPairing(value)
    setApiKey(token)
    router.replace('/hermes/chat')
  } catch (err: any) {
    errorMsg.value = err?.message || t('pair.failed')
    state.value = 'error'
  }
}

onMounted(() => {
  const fromHash = readCodeFromHash()
  if (fromHash) {
    code.value = fromHash
    void pair(fromHash)
  }
})
</script>

<template>
  <div class="pair-view">
    <div class="pair-card">
      <h1 class="pair-title">{{ t('pair.title') }}</h1>
      <p class="pair-subtitle">{{ t('pair.subtitle') }}</p>

      <div v-if="state === 'claiming'" class="pair-status">{{ t('pair.connecting') }}</div>

      <template v-else>
        <NInput
          v-model:value="code"
          :placeholder="t('pair.codePlaceholder')"
          size="large"
          class="pair-input"
          @keyup.enter="pair(code)"
        />
        <p v-if="state === 'error'" class="pair-error">{{ errorMsg }}</p>
        <NButton type="primary" size="large" block class="pair-btn" @click="pair(code)">
          {{ t('pair.connect') }}
        </NButton>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pair-view {
  min-height: calc(100 * var(--vh, 1vh));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-secondary, #f0f0f0);
}

.pair-card {
  width: 100%;
  max-width: 360px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.pair-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
}

.pair-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin: 0 0 24px;
}

.pair-input {
  margin-bottom: 14px;
  text-align: center;
}

.pair-status {
  font-size: 15px;
  color: var(--text-secondary, #666);
  padding: 16px 0;
}

.pair-error {
  color: var(--error, #ef4444);
  font-size: 13px;
  margin: 0 0 12px;
}

.pair-btn {
  margin-top: 4px;
}
</style>
