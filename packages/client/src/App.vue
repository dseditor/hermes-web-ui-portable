<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { darkTheme, NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { getThemeOverrides } from '@/styles/theme'
import { useTheme } from '@/composables/useTheme'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useAppStore } from '@/stores/hermes/app'
import SessionSearchModal from '@/components/hermes/chat/SessionSearchModal.vue'
import AuthEventListener from '@/components/auth/AuthEventListener.vue'
import DefaultCredentialPrompt from '@/components/auth/DefaultCredentialPrompt.vue'
import NoModelPrompt from '@/components/hermes/NoModelPrompt.vue'

const { isDark, isComic } = useTheme()
const { t } = useI18n()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const ready = ref(false)

const themeOverrides = computed(() => getThemeOverrides(isDark.value, isComic.value))
const naiveTheme = computed(() => isDark.value ? darkTheme : null)

// Public pages (login, external pairing) render without the app chrome and must
// NOT fire authenticated requests on mount — on /pair there is no token yet, so
// loadModels() would 401 and bounce the device straight back to login.
const isLoginPage = computed(() => route.meta.public === true || route.name === 'login')

// Primary destinations kept in the slim sidebar. Every other authenticated
// hermes.* page is a "feature" opened from Settings, so it shows a back bar
// to return there — without each view having to implement its own.
const PRIMARY_ROUTES = new Set([
  'hermes.chat',
  'hermes.session',
  'hermes.models',
  'hermes.skills',
  'hermes.plugins',
  'hermes.settings',
])
const showBackToSettings = computed(() => {
  if (isLoginPage.value) return false
  const name = typeof route.name === 'string' ? route.name : ''
  return name.startsWith('hermes.') && !PRIMARY_ROUTES.has(name)
})
function backToSettings() {
  router.push({ name: 'hermes.settings' })
}

const nodeVersionLow = computed(() => {
  const v = appStore.nodeVersion
  const major = parseInt(v.split('.')[0], 10)
  return !isNaN(major) && major < 23
})

// Close mobile sidebar on route change
watch(() => route.path, () => {
  appStore.closeSidebar()
})

// Wait for router to resolve before rendering layout
router.isReady().then(() => {
  ready.value = true
})

onMounted(() => {
  if (!isLoginPage.value) {
    appStore.loadModels()
    appStore.startHealthPolling()
  }
})

onUnmounted(() => {
  appStore.stopHealthPolling()
})

useKeyboard()
</script>

<template>
  <NConfigProvider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <AuthEventListener />
      <NDialogProvider>
        <NNotificationProvider>
          <div v-if="nodeVersionLow && ready" class="node-warning-bar">
            {{ t('sidebar.nodeVersionWarning', { version: appStore.nodeVersion }) }}
          </div>
          <div v-if="ready" class="app-layout" :class="{ 'no-sidebar': isLoginPage }">
            <button v-if="!isLoginPage" class="hamburger-btn" @click="appStore.toggleSidebar">
              <img src="/logo.png" alt="Menu" style="width: 24px; height: 24px;" />
            </button>
            <div v-if="!isLoginPage && appStore.sidebarOpen" class="mobile-backdrop" @click="appStore.closeSidebar" />
            <AppSidebar v-if="!isLoginPage" />
            <main class="app-main">
              <button v-if="showBackToSettings" class="back-to-settings-bar" @click="backToSettings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>{{ t('settings.backToSettings') }}</span>
              </button>
              <router-view />
            </main>
          </div>
          <SessionSearchModal />
          <DefaultCredentialPrompt />
          <NoModelPrompt />
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app-layout {
  display: flex;
  height: calc(100 * var(--vh));
  width: 100vw;
  overflow: hidden;

  &.no-sidebar {
    display: block;
  }
}

.app-main {
  flex: 1;
  overflow-y: auto;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .no-sidebar & {
    height: calc(100 * var(--vh));
  }

  > :deep(*) {
    flex: 1;
    min-height: 0;
  }
}

.back-to-settings-bar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 18px;
  border: none;
  border-bottom: 1px solid $border-color;
  background-color: $bg-secondary;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color $transition-fast, background-color $transition-fast;

  &:hover {
    color: $text-primary;
    background-color: $bg-card-hover;
  }
}

.node-warning-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 4px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #b45309;
  background-color: #fef3c7;
  border-bottom: 1px solid #fde68a;
  text-align: center;
  line-height: 1.4;
}
</style>
