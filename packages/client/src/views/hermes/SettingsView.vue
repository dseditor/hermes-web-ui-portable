<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NTabs,
  NTabPane,
  NSpin,
} from "naive-ui";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/hermes/settings";
import DisplaySettings from "@/components/hermes/settings/DisplaySettings.vue";
import AgentSettings from "@/components/hermes/settings/AgentSettings.vue";
import MemorySettings from "@/components/hermes/settings/MemorySettings.vue";
import CompressionSettings from "@/components/hermes/settings/CompressionSettings.vue";
import SessionSettings from "@/components/hermes/settings/SessionSettings.vue";
import PrivacySettings from "@/components/hermes/settings/PrivacySettings.vue";
import ModelSettings from "@/components/hermes/settings/ModelSettings.vue";
import AccountSettings from "@/components/hermes/settings/AccountSettings.vue";
import UserManagementSettings from "@/components/hermes/settings/UserManagementSettings.vue";
import VoiceSettings from "@/components/hermes/settings/VoiceSettings.vue";
import { isStoredSuperAdmin } from "@/api/client";
import { useProfilesStore } from "@/stores/hermes/profiles";

const settingsStore = useSettingsStore();
const profilesStore = useProfilesStore();
const { t } = useI18n();
const canManageUsers = isStoredSuperAdmin();
const isSuperAdmin = isStoredSuperAdmin();
const route = useRoute();
const router = useRouter();
const activeTab = ref("features");

const validTabs = computed(() => new Set([
  "features",
  "account",
  ...(canManageUsers ? ["users"] : []),
  "display",
  "agent",
  "memory",
  "compression",
  "session",
  "privacy",
  "models",
  "voice",
]));

function normalizeTab(value: unknown): string {
  const tab = typeof value === "string" ? value : "";
  return validTabs.value.has(tab) ? tab : "features";
}

// "Feature shortcuts" hub — every page that used to live in the sidebar now
// opens from here. Each card simply navigates to its existing route, so no
// feature page logic changes; those pages show a back bar to return here.
type FeatureLink = { name: string; labelKey: string; superAdmin?: boolean };
const featureLinks: FeatureLink[] = [
  { name: "hermes.history", labelKey: "sidebar.history" },
  { name: "hermes.groupChat", labelKey: "sidebar.groupChat" },
  { name: "hermes.jobs", labelKey: "sidebar.jobs" },
  { name: "hermes.kanban", labelKey: "sidebar.kanban" },
  { name: "hermes.channels", labelKey: "sidebar.channels" },
  { name: "hermes.mcp", labelKey: "sidebar.mcp", superAdmin: true },
  { name: "hermes.memory", labelKey: "sidebar.memory" },
  { name: "hermes.logs", labelKey: "sidebar.logs" },
  { name: "hermes.usage", labelKey: "sidebar.usage" },
  { name: "hermes.performance", labelKey: "sidebar.performance", superAdmin: true },
  { name: "hermes.skillsUsage", labelKey: "sidebar.skillsUsage" },
  { name: "hermes.codingAgents", labelKey: "sidebar.codingAgents" },
  { name: "hermes.terminal", labelKey: "sidebar.terminal" },
  { name: "hermes.files", labelKey: "sidebar.files" },
  { name: "hermes.profiles", labelKey: "sidebar.profiles", superAdmin: true },
  { name: "hermes.pairing", labelKey: "sidebar.pairing", superAdmin: true },
];
const visibleFeatures = computed(() => featureLinks.filter(link =>
  router.hasRoute(link.name) && (!link.superAdmin || isSuperAdmin),
));

function openFeature(name: string) {
  router.push({ name });
}

function backToChat() {
  router.push({ name: "hermes.chat" });
}

function handleTabUpdate(tab: string) {
  activeTab.value = normalizeTab(tab);
  router.replace({
    query: {
      ...route.query,
      tab: activeTab.value === "account" ? undefined : activeTab.value,
    },
  });
}

watch(() => route.query.tab, (tab) => {
  activeTab.value = normalizeTab(tab);
}, { immediate: true });

async function loadSettingsForProfile() {
  if (!profilesStore.activeProfileName || profilesStore.profiles.length === 0) {
    await profilesStore.fetchProfiles();
  }
  await settingsStore.fetchSettings();
}

onMounted(() => {
  void loadSettingsForProfile();
});
</script>

<template>
  <div class="settings-view">
    <header class="page-header">
      <button class="back-to-chat" type="button" @click="backToChat">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>{{ t("settings.backToChat") }}</span>
      </button>
      <h2 class="header-title">{{ t("settings.title") }}</h2>
    </header>

    <div class="settings-content">
      <NSpin
        :show="settingsStore.loading || settingsStore.saving"
        size="large"
        :description="t('common.loading')"
      >
        <NTabs v-model:value="activeTab" type="line" animated @update:value="handleTabUpdate">
          <NTabPane name="features" :tab="t('settings.tabs.features')">
            <div class="features-hub">
              <p class="features-hint">{{ t("settings.featuresHint") }}</p>
              <div class="features-grid">
                <button
                  v-for="link in visibleFeatures"
                  :key="link.name"
                  class="feature-card"
                  type="button"
                  @click="openFeature(link.name)"
                >
                  <span class="feature-card-label">{{ t(link.labelKey) }}</span>
                  <svg class="feature-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </NTabPane>
          <NTabPane name="account" :tab="t('settings.tabs.account')">
            <AccountSettings />
          </NTabPane>
          <NTabPane v-if="canManageUsers" name="users" :tab="t('settings.tabs.users')">
            <UserManagementSettings />
          </NTabPane>
          <NTabPane name="display" :tab="t('settings.tabs.display')">
            <DisplaySettings />
          </NTabPane>
          <NTabPane name="agent" :tab="t('settings.tabs.agent')">
            <AgentSettings />
          </NTabPane>
          <NTabPane name="memory" :tab="t('settings.tabs.memory')">
            <MemorySettings />
          </NTabPane>
          <NTabPane name="compression" :tab="t('settings.tabs.compression')">
            <CompressionSettings />
          </NTabPane>
          <NTabPane name="session" :tab="t('settings.tabs.session')">
            <SessionSettings />
          </NTabPane>
          <NTabPane name="privacy" :tab="t('settings.tabs.privacy')">
            <PrivacySettings />
          </NTabPane>
          <NTabPane name="models" :tab="t('settings.tabs.models')">
            <ModelSettings />
          </NTabPane>
          <NTabPane name="voice" :tab="t('settings.tabs.voice')">
            <VoiceSettings />
          </NTabPane>
        </NTabs>
      </NSpin>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.settings-view {
  height: calc(100 * var(--vh));
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid $border-color;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.back-to-chat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-secondary;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    color: $text-primary;
    background: $bg-card-hover;
  }
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.features-hub {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.features-hint {
  margin: 0;
  font-size: 13px;
  color: $text-muted;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.feature-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $bg-card;
  color: $text-primary;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all $transition-fast;

  &:hover {
    border-color: $accent-muted;
    background: $bg-card-hover;
    transform: translateY(-1px);
  }

  .feature-card-arrow {
    color: $text-muted;
    flex-shrink: 0;
  }
}
</style>
