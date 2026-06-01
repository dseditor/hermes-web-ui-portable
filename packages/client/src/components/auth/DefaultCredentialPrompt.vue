<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { NButton, NModal, useMessage } from "naive-ui";
import { fetchCurrentUser, changePassword } from "@/api/auth";
import { getApiKey } from "@/api/client";

const { t } = useI18n();
const route = useRoute();
const message = useMessage();

const show = ref(false);
const loading = ref(false);
const checkedToken = ref("");
const promptedUserId = ref<number | null>(null);

// Two-phase modal: 'prompt' (choose) -> 'result' (show the generated password once)
const phase = ref<"prompt" | "result">("prompt");
const generatedPassword = ref("");

const DEFAULT_PASSWORD = "123456";

function dismissalKey(userId: number): string {
  return `hermes_default_credentials_prompt_dismissed_${userId}`;
}

function isDesktopShell(): boolean {
  return (window as typeof window & { hermesDesktop?: { isDesktop?: boolean } }).hermesDesktop?.isDesktop === true;
}

// Strong 16-char password from upper/lower/digits (no ambiguous chars, no symbols
// so it stays easy to type / paste anywhere).
function generateStrongPassword(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

async function checkDefaultCredentials() {
  if (isDesktopShell()) {
    show.value = false;
    return;
  }
  if (route.meta.public === true || route.name === "login") {
    show.value = false;
    return;
  }

  const token = getApiKey();
  if (!token || token === checkedToken.value) return;
  checkedToken.value = token;

  loading.value = true;
  try {
    const user = await fetchCurrentUser();
    promptedUserId.value = user.id;
    const dismissed = sessionStorage.getItem(dismissalKey(user.id)) === "1";
    if (user.requiresCredentialChange && !dismissed) {
      phase.value = "prompt";
      generatedPassword.value = "";
      show.value = true;
    } else {
      show.value = false;
    }
  } catch {
    show.value = false;
  } finally {
    loading.value = false;
  }
}

function keepCurrent() {
  if (promptedUserId.value != null) {
    sessionStorage.setItem(dismissalKey(promptedUserId.value), "1");
  }
  show.value = false;
}

async function generateAndApply() {
  loading.value = true;
  try {
    const pw = generateStrongPassword();
    await changePassword(DEFAULT_PASSWORD, pw);
    generatedPassword.value = pw;
    phase.value = "result";
    // Don't re-prompt this session.
    if (promptedUserId.value != null) {
      sessionStorage.setItem(dismissalKey(promptedUserId.value), "1");
    }
  } catch (err: any) {
    message.error(err?.message || t("login.generateFailed"));
  } finally {
    loading.value = false;
  }
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(generatedPassword.value);
    message.success(t("login.copied"));
  } catch { /* ignore */ }
}

function closeResult() {
  show.value = false;
}

watch(() => route.fullPath, () => {
  void checkDefaultCredentials();
}, { immediate: true });
</script>

<template>
  <NModal
    v-model:show="show"
    preset="dialog"
    :title="phase === 'result' ? t('login.passwordGeneratedTitle') : t('login.defaultCredentialTitle')"
    :mask-closable="false"
    :closable="phase === 'result'"
  >
    <p v-if="phase === 'prompt'" class="credential-warning-text">{{ t("login.defaultCredentialMessage") }}</p>
    <template v-else>
      <p class="credential-warning-text">{{ t("login.passwordGeneratedHint") }}</p>
      <div class="password-row">
        <code class="password-value">{{ generatedPassword }}</code>
        <NButton size="small" secondary @click="copyPassword">{{ t("login.copy") }}</NButton>
      </div>
    </template>

    <template #action>
      <template v-if="phase === 'prompt'">
        <NButton :disabled="loading" @click="keepCurrent">
          {{ t("login.defaultCredentialKeep") }}
        </NButton>
        <NButton type="primary" :loading="loading" @click="generateAndApply">
          {{ t("login.defaultCredentialGenerate") }}
        </NButton>
      </template>
      <NButton v-else type="primary" @click="closeResult">
        {{ t("login.passwordSavedClose") }}
      </NButton>
    </template>
  </NModal>
</template>

<style scoped lang="scss">
.credential-warning-text {
  margin: 0 0 12px;
  line-height: 1.6;
}

.password-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.password-value {
  flex: 1;
  font-family: var(--font-code, monospace);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bg-secondary, #f0f0f0);
  word-break: break-all;
}
</style>
