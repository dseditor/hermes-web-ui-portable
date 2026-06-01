<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton, NSpin } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { request } from '@/api/client'

interface FolderEntry {
  name: string
  path: string
}

interface FolderListResponse {
  base: string
  current: string
  name: string
  parent: string
  drives: string[]
  folders: FolderEntry[]
}

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { t } = useI18n()

const loading = ref(false)
const current = ref('')
const parent = ref('')
const drives = ref<string[]>([])
const folders = ref<FolderEntry[]>([])
const selectedPath = ref(props.modelValue || '')

async function load(path = '') {
  loading.value = true
  try {
    const query = path ? `?path=${encodeURIComponent(path)}` : ''
    const res = await request<FolderListResponse>(`/api/hermes/workspace/folders${query}`)
    current.value = res.current
    parent.value = res.parent
    drives.value = res.drives || []
    folders.value = res.folders || []
  } catch {
    folders.value = []
  } finally {
    loading.value = false
  }
}

function selectCurrent() {
  selectedPath.value = current.value
  emit('update:modelValue', current.value)
}

onMounted(() => {
  // Open at the currently-selected folder if any, otherwise the default start.
  void load(props.modelValue || '')
})
</script>

<template>
  <div class="folder-picker">
    <!-- Current path + up -->
    <div class="folder-bar">
      <NButton size="tiny" :disabled="!parent || loading" @click="load(parent)">↑ {{ t('folderPicker.up') }}</NButton>
      <code class="current-path">{{ current || '/' }}</code>
    </div>

    <!-- Drive shortcuts -->
    <div v-if="drives.length > 1" class="drive-row">
      <NButton
        v-for="d in drives"
        :key="d"
        size="tiny"
        tertiary
        :type="current === d ? 'primary' : 'default'"
        @click="load(d)"
      >{{ d }}</NButton>
    </div>

    <div v-if="loading" class="folder-picker-loading"><NSpin size="small" /></div>
    <div v-else class="folder-list">
      <div
        v-for="folder in folders"
        :key="folder.path"
        class="folder-item"
        :class="{ selected: selectedPath === folder.path }"
        @click="load(folder.path)"
      >
        <span class="folder-icon">📁</span>
        <span class="folder-name">{{ folder.name }}</span>
        <span class="folder-enter">›</span>
      </div>
      <div v-if="folders.length === 0" class="folder-empty">{{ t('folderPicker.empty') }}</div>
    </div>

    <!-- Select the current folder -->
    <div class="folder-select-bar">
      <NButton type="primary" size="small" block :disabled="!current" @click="selectCurrent">
        {{ t('folderPicker.selectThis') }}
      </NButton>
    </div>

    <div v-if="selectedPath" class="folder-selected">
      <span class="folder-selected-label">{{ t('folderPicker.selected') }}</span>
      <code class="folder-selected-path">{{ selectedPath }}</code>
    </div>
  </div>
</template>

<style scoped lang="scss">
.folder-picker {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.folder-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.current-path {
  font-family: monospace;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.drive-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.folder-picker-loading {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.folder-list {
  max-height: 300px;
  overflow-y: auto;
  font-size: 13px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &.selected {
    background: rgba(64, 158, 255, 0.15);
    outline: 1px solid rgba(64, 158, 255, 0.4);
  }
}

.folder-icon { flex-shrink: 0; }

.folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-enter { opacity: 0.4; flex-shrink: 0; }

.folder-empty {
  text-align: center;
  padding: 16px;
  opacity: 0.5;
}

.folder-select-bar {
  margin-top: 8px;
}

.folder-selected {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(64, 158, 255, 0.08);
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.folder-selected-label { opacity: 0.6; flex-shrink: 0; }

.folder-selected-path {
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
