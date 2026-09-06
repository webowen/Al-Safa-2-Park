<template>
  <div v-if="legendRows.length" class="mode-legend" aria-label="Map legend">
    <div v-for="(row, rowIndex) in legendRows" :key="rowIndex" class="legend-row">
      <span v-for="chip in row.chips" :key="chip.label" class="legend-chip" :class="`tone-${chip.tone}`">
        <AppIcon :name="chip.icon" />
        <span>{{ chip.label }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "../../stores/dashboard";
import { getDashboardModeConfig } from "../../data/dashboardModes";
import AppIcon from "../ui/AppIcon.vue";

const store = useDashboardStore();
const legendRows = computed(() => getDashboardModeConfig(store.activeMode).legend ?? []);
</script>

<style scoped>
.mode-legend {
  pointer-events: auto;
  display: grid;
  gap: 6px;
  width: 100%;
  max-width: 820px;
}

.legend-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, .96);
  border: 1px solid rgba(7, 38, 87, .09);
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(16, 31, 49, .1);
}

.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(243, 246, 250, .95);
  color: #0b2a5d;
  font-size: 11px;
  font-weight: 650;
  line-height: 1;
  white-space: nowrap;
}

.legend-chip .app-icon {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  font-size: 15px;
}

.tone-gold { color: #c98517; }
.tone-green { color: #2f8d3a; }
.tone-blue { color: #2b7fe8; }
.tone-red { color: #d83b38; }
.tone-orange { color: #d18b16; }
.tone-navy { color: #17376b; }

@media (max-width: 900px) {
  .mode-legend {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .mode-legend {
    width: calc(100vw - 20px);
  }

  .legend-row {
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .legend-row::-webkit-scrollbar {
    display: none;
  }
}
</style>
