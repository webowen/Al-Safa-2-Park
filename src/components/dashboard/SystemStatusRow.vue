<template><div class="system-row"><AppIcon :name="item.icon" :class="`tone-${item.tone}`"/><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div></template>
<script setup lang="ts">import type { SystemStatusItem } from "../../types/dashboard";import AppIcon from "../ui/AppIcon.vue";defineProps<{item:SystemStatusItem}>();</script>
<style scoped>
.system-row {
  min-height: 43px;
  display: grid;
  grid-template-columns: 27px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 0 15px;
  border-bottom: 1px solid rgba(7, 38, 87, .08);
  font-size: 13px;
}

.system-row:last-child {
  border-bottom: 0;
}

.system-row .app-icon {
  font-size: 21px;
}

.system-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 650;
  color: #102e5e;
}

.system-row strong {
  font-size: 12px;
  color: #287a37;
  font-weight: 650;
  white-space: nowrap;
}

.tone-gold {
  color: #d28b15;
}

.tone-green {
  color: #278b3a;
}

.tone-gray {
  color: #6f7986;
}

@media (max-height: 780px) {
  .system-row {
    min-height: 38px;
  }
}
</style>
