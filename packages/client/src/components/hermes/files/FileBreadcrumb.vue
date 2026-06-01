<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NBreadcrumb, NBreadcrumbItem, NButton } from 'naive-ui'
import { useFilesStore } from '@/stores/hermes/files'

const { t } = useI18n()
const filesStore = useFilesStore()

// Rebuild an absolute path from the breadcrumb segments, cross-platform.
// On Windows the first segment is a drive ("F:") and must become "F:\".
function pathFromSegments(count: number): string {
  const segs = filesStore.pathSegments.slice(0, count)
  if (segs.length === 0) return ''
  if (/^[A-Za-z]:$/.test(segs[0])) {
    return segs.length === 1 ? `${segs[0]}\\` : `${segs[0]}\\${segs.slice(1).join('\\')}`
  }
  return `/${segs.join('/')}`
}

function handleClick(index: number) {
  if (index < 0) {
    filesStore.navigateTo('')
  } else {
    filesStore.navigateTo(pathFromSegments(index + 1))
  }
}
</script>

<template>
  <div class="file-breadcrumb">
    <div class="nav-row">
      <NButton size="tiny" :disabled="!filesStore.parent" @click="filesStore.navigateUp()">
        ↑ {{ t('folderPicker.up') }}
      </NButton>
      <NButton
        v-for="d in filesStore.drives"
        :key="d"
        size="tiny"
        tertiary
        :type="filesStore.currentPath === d ? 'primary' : 'default'"
        @click="filesStore.navigateTo(d)"
      >{{ d }}</NButton>
    </div>
    <NBreadcrumb>
      <NBreadcrumbItem @click="handleClick(-1)">
        {{ t('files.breadcrumbRoot') }}
      </NBreadcrumbItem>
      <NBreadcrumbItem
        v-for="(segment, index) in filesStore.pathSegments"
        :key="index"
        @click="handleClick(index)"
      >
        {{ segment }}
      </NBreadcrumbItem>
    </NBreadcrumb>
  </div>
</template>

<style scoped lang="scss">
.file-breadcrumb {
  padding: 6px 16px;
}

.nav-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}
</style>
