<script setup lang="ts">
import { computed } from 'vue'
import type { ProfileAvatar } from '@/api/hermes/profiles'

const props = withDefaults(defineProps<{
  name: string
  avatar?: ProfileAvatar | null
  size?: number
}>(), {
  size: 24,
})

// Clean, friendly emoji pool used to tell profiles apart at a glance.
// We deliberately dropped the old multiavatar SVG "face" look in favour of
// simple emoji badges (star / moon / sun ...).
const EMOJI_POOL = [
  '🌟', '🌙', '☀️', '🌸', '🍀', '🔮', '🌊', '🔥',
  '🌈', '🍎', '🐬', '🦊', '🌷', '⭐', '🌻', '🎈',
]

// Deterministic name → emoji mapping so the same profile always shows the
// same badge across sessions, with zero per-profile configuration.
function emojiFor(seed: string): string {
  let hash = 0
  const key = seed || 'default'
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return EMOJI_POOL[hash % EMOJI_POOL.length]
}

const emoji = computed(() => emojiFor(props.name))
const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  flexBasis: `${props.size}px`,
}))
const emojiStyle = computed(() => ({
  fontSize: `${Math.round(props.size * 0.62)}px`,
  lineHeight: `${props.size}px`,
}))
</script>

<template>
  <span class="profile-avatar-view" :style="style">
    <img
      v-if="avatar?.type === 'image' && avatar.dataUrl"
      class="profile-avatar-image"
      :src="avatar.dataUrl"
      alt=""
      draggable="false"
    >
    <span v-else class="profile-avatar-emoji" :style="emojiStyle">{{ emoji }}</span>
  </span>
</template>

<style scoped>
.profile-avatar-view {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-secondary);
}

.profile-avatar-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.profile-avatar-emoji {
  display: block;
  text-align: center;
  user-select: none;
}
</style>
