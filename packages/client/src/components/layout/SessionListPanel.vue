<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, useMessage } from 'naive-ui'
import { useChatStore, type Session } from '@/stores/hermes/chat'
import { useSessionBrowserPrefsStore } from '@/stores/hermes/session-browser-prefs'
import SessionListItem from '@/components/hermes/chat/SessionListItem.vue'

// Compact, "Claude Desktop"-style session list that lives in the global
// sidebar. Day-to-day actions only — new chat, switch, pin, delete. Advanced
// management (batch delete, export, set workspace, per-session model) stays in
// the chat page's expandable panel so this stays clean and low-risk.

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const chatStore = useChatStore()
const prefs = useSessionBrowserPrefsStore()

function byRecent(items: Session[]): Session[] {
  return [...items].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

const pinnedSessions = computed(() =>
  byRecent(chatStore.sessions.filter(s => prefs.isPinned(s.id))),
)
const unpinnedSessions = computed(() =>
  byRecent(chatStore.sessions.filter(s => !prefs.isPinned(s.id))),
)

function sessionHref(sessionId: string) {
  return router.resolve({ name: 'hermes.session', params: { sessionId } }).href
}

async function openSession(sessionId: string) {
  await router.push({ name: 'hermes.session', params: { sessionId } })
}

async function startNewChat() {
  const session = chatStore.newChat()
  await router.push({ name: 'hermes.session', params: { sessionId: session.id } })
}

function deleteSession(id: string) {
  prefs.removePinned(id)
  chatStore.deleteSession(id)
  message.success(t('chat.sessionDeleted'))
}

function togglePin(id: string) {
  prefs.togglePinned(id)
}
</script>

<template>
  <div class="session-panel">
    <div class="session-panel-header">
      <span class="session-panel-title">{{ t('sidebar.sessions') }}</span>
      <NButton quaternary size="tiny" circle :title="t('chat.newChat')" @click="startNewChat">
        <template #icon>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </template>
      </NButton>
    </div>

    <div class="session-panel-items">
      <div v-if="chatStore.isLoadingSessions && chatStore.sessions.length === 0" class="session-panel-hint">
        {{ t('common.loading') }}
      </div>
      <div v-else-if="chatStore.sessions.length === 0" class="session-panel-hint">
        {{ t('chat.noSessions') }}
      </div>

      <template v-if="pinnedSessions.length > 0">
        <div class="session-panel-group-label">{{ t('chat.pinned') }}</div>
        <SessionListItem
          v-for="s in pinnedSessions"
          :key="`pinned-${s.id}`"
          :session="s"
          :active="s.id === chatStore.activeSessionId"
          :pinned="true"
          :can-delete="s.id !== chatStore.activeSessionId || chatStore.sessions.length > 1"
          :streaming="chatStore.isSessionLive(s.id)"
          :show-profile="false"
          minimal
          :to="sessionHref(s.id)"
          @select="openSession(s.id)"
          @delete="deleteSession(s.id)"
          @toggle-pin="togglePin(s.id)"
        />
      </template>

      <SessionListItem
        v-for="s in unpinnedSessions"
        :key="s.id"
        :session="s"
        :active="s.id === chatStore.activeSessionId"
        :pinned="false"
        :can-delete="s.id !== chatStore.activeSessionId || chatStore.sessions.length > 1"
        :streaming="chatStore.isSessionLive(s.id)"
        :show-profile="false"
        minimal
        :to="sessionHref(s.id)"
        @select="openSession(s.id)"
        @delete="deleteSession(s.id)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.session-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.session-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 8px;
  flex-shrink: 0;
}

.session-panel-title {
  font-size: 11px;
  font-weight: 600;
  color: $sidebar-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.session-panel-items {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
}

.session-panel-group-label {
  font-size: 10px;
  font-weight: 600;
  color: $sidebar-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 8px 4px;
}

.session-panel-hint {
  padding: 14px 8px;
  font-size: 12px;
  color: $sidebar-text-muted;
  text-align: center;
}

// Clean, prominent session rows (Claude Desktop feel).
:deep(.session-item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: none;
  border-radius: $radius-sm;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  color: $sidebar-text;
  margin-bottom: 2px;
  transition: background-color $transition-fast, color $transition-fast;

  &:hover {
    background: $sidebar-hover-bg;

    .session-item-delete,
    .session-item-pin-btn {
      opacity: 1;
    }
  }

  &.active {
    background: $sidebar-active-bg;
  }
}

:deep(.session-item-pin-btn) {
  flex-shrink: 0;
  opacity: 0;
  padding: 2px;
  border: none;
  background: none;
  color: $sidebar-text-muted;
  cursor: pointer;
  border-radius: 3px;
  transition: all $transition-fast;

  &:hover {
    color: $accent-primary;
    background: rgba(var(--accent-primary-rgb), 0.14);
  }

  // Pinned sessions keep the pin lit so the state is always visible.
  &.pinned {
    opacity: 1;
    color: $accent-primary;
  }
}

:deep(.session-item.minimal .session-item-title) {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  color: $sidebar-text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.session-item.active .session-item-title) {
  color: $sidebar-active-text;
  font-weight: 600;
}

:deep(.session-item-content) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

:deep(.session-item-title-row) {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

:deep(.session-item-pin) {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: $accent-primary;
}

:deep(.session-item-streaming) {
  flex-shrink: 0;
  color: $accent-primary;
  animation: spin 1.2s linear infinite;
}

:deep(.session-item-delete) {
  flex-shrink: 0;
  opacity: 0;
  padding: 2px;
  border: none;
  background: none;
  color: $sidebar-text-muted;
  cursor: pointer;
  border-radius: 3px;
  transition: all $transition-fast;

  &:hover {
    color: $error;
    background: rgba(var(--error-rgb, 239, 68, 68), 0.12);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
