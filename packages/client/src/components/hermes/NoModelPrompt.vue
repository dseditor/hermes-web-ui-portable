<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NModal } from 'naive-ui'
import { useAppStore } from '@/stores/hermes/app'
import { hasApiKey } from '@/api/client'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const show = ref(false)
const dismissed = ref(false)

async function checkModelConfigured() {
  // Don't nag on public pages, when signed out, on the Models page itself,
  // or after the user dismissed it this session.
  if (route.meta.public === true || !hasApiKey() || route.name === 'hermes.models' || dismissed.value) {
    show.value = false
    return
  }
  try {
    await appStore.loadModels()
  } catch { /* ignore */ }
  show.value = !appStore.selectedModel
}

function later() {
  dismissed.value = true
  show.value = false
}

function goToModels() {
  show.value = false
  router.push({ name: 'hermes.models' })
}

watch(() => route.fullPath, () => {
  void checkModelConfigured()
}, { immediate: true })
</script>

<template>
  <NModal
    v-model:show="show"
    preset="dialog"
    :title="t('modelPrompt.title')"
    :mask-closable="false"
  >
    <p class="model-prompt-text">{{ t('modelPrompt.message') }}</p>
    <template #action>
      <NButton @click="later">{{ t('modelPrompt.later') }}</NButton>
      <NButton type="primary" @click="goToModels">{{ t('modelPrompt.go') }}</NButton>
    </template>
  </NModal>
</template>

<style scoped lang="scss">
.model-prompt-text {
  margin: 0;
  line-height: 1.6;
}
</style>
