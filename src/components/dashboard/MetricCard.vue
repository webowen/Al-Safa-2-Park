<template>
  <article
    class="metric-card"
    :class="{ interactive: Boolean(item.focusId) }"
    :role="item.focusId ? 'button' : undefined"
    :tabindex="item.focusId ? 0 : undefined"
    @click="item.focusId && emit('select')"
    @keydown.enter.prevent="item.focusId && emit('select')"
    @keydown.space.prevent="item.focusId && emit('select')"
  >
    <div class="metric-main">
      <AppIcon :name="item.icon" :class="`tone-${item.tone}`" />
      <strong>{{ item.value }}</strong>
    </div>
    <div class="metric-label">{{ item.label }}</div>
    <div class="metric-status">
      <StatusDot :tone="item.statusTone" /><span>{{ item.status }}</span>
      <span v-if="item.chart" class="mini-chart" aria-hidden="true"><i v-for="height in chartBars" :key="height" :style="{ height: `${height}px` }"></i></span>
    </div>
  </article>
</template>
<script setup lang="ts">
import type { MetricItem } from "../../types/dashboard";
import { computed } from "vue";
import { useDashboardStore } from "../../stores/dashboard";
import AppIcon from "../ui/AppIcon.vue";
import StatusDot from "../ui/StatusDot.vue";
defineProps<{ item: MetricItem }>();
const emit = defineEmits<{ select: [] }>();
const store = useDashboardStore();
const chartBars = computed(() => [6, 11, 16, 20].map((base, index) => Math.max(4, base + Math.round(Math.sin(store.liveTick * 1.4 + index) * 4))));
</script>
<style scoped>
.metric-card {
  min-height: 104px;
  padding: 15px 14px 13px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, .72);
  border: 1px solid rgba(7, 38, 87, .09);
  border-radius: 11px;
  box-shadow: 0 3px 12px rgba(18, 32, 51, .05);
  box-sizing: border-box;
}

.metric-card.interactive {
  cursor: pointer;
}

.metric-card.interactive:hover {
  box-shadow: 0 8px 18px rgba(17, 37, 61, .1);
  transform: translateY(-2px);
}

.metric-main {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.metric-main .app-icon {
  flex: 0 0 auto;
  font-size: 27px;
}

.metric-main strong {
  min-width: 0;
  font-size: 24px;
  line-height: 1.05;
  color: #09285b;
  overflow-wrap: anywhere;
}

.metric-label {
  margin: 8px 0 6px 38px;
  font-size: 13px;
  line-height: 1.25;
  color: #53667e;
}

.metric-status {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  margin-left: 0;
  font-size: 12.5px;
  line-height: 1.25;
  color: #29496f;
}

.metric-status span:not(.mini-chart):not(.status-dot) {
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}

.mini-chart {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  gap: 3px;
  height: 22px;
  margin-left: auto;
}

.mini-chart i {
  display: block;
  width: 5px;
  background: #aeb3ba;
}

.tone-gold {
  color: #cf8816;
}

.tone-blue {
  color: #2687ed;
}

.tone-green {
  color: #2b913f;
}

.tone-red {
  color: #d83b38;
}

@media (max-height: 780px) {
  .metric-card {
    min-height: 94px;
    padding: 12px;
  }

  .metric-main .app-icon {
    font-size: 24px;
  }

  .metric-main strong {
    font-size: 22px;
  }

  .metric-label {
    margin-left: 35px;
  }
}
</style>
