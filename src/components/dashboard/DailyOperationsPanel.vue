<template>
  <GlassPanel class="operations-panel">
    <Transition name="heading-fade" mode="out-in">
      <button :key="store.activeMode" class="panel-heading" @click="collapsed = !collapsed" :aria-expanded="!collapsed">
        <span>
          <AppIcon :name="modeConfig.primary.headerIcon" />
          {{ modeConfig.primary.title }}
        </span>
        <AppIcon name="chevron-up" :class="{ rotated: collapsed }" />
      </button>
    </Transition>

    <Transition name="panel-fade" mode="out-in">
      <div v-if="!collapsed" :key="store.activeMode" class="panel-content" :class="modeConfig.primary.kind">
        <template v-if="modeConfig.primary.kind === 'operations'">
          <div class="metric-grid">
            <MetricCard
              v-for="item in modeConfig.primary.metrics"
              :key="item.label"
              :item="liveMetric(item)"
              @select="focus(item.focusId)"
            />
          </div>

          <div class="section-heading">
            <span>
              <AppIcon name="activity" />
              {{ sectionTitle }}
            </span>
            <span class="active-state">
              <StatusDot :tone="modeConfig.primary.statusTone ?? 'green'" />
              {{ modeConfig.primary.statusLabel }}
            </span>
          </div>

          <div class="systems">
            <SystemStatusRow
              v-for="item in modeConfig.primary.systems"
              :key="item.label"
              :item="liveSystem(item)"
            />
          </div>

          <button class="panel-footer" @click="focus(modeConfig.defaultFocusId)">
            {{ modeConfig.primary.footerLabel }}
            <AppIcon name="arrow-right" />
          </button>
        </template>

        <template v-else>
          <div class="asset-list">
            <AssetHealthCard
              v-for="item in modeConfig.primary.assets"
              :key="item.label"
              :item="liveAsset(item)"
              @select="focus(item.focusId)"
            />
          </div>

          <button class="panel-footer" @click="focus(modeConfig.defaultFocusId)">
            {{ modeConfig.primary.footerLabel }}
            <AppIcon name="arrow-right" />
          </button>
        </template>
      </div>
    </Transition>
  </GlassPanel>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useDashboardStore } from "../../stores/dashboard";
import { getDashboardModeConfig } from "../../data/dashboardModes";
import AppIcon from "../ui/AppIcon.vue";
import GlassPanel from "../ui/GlassPanel.vue";
import StatusDot from "../ui/StatusDot.vue";
import MetricCard from "./MetricCard.vue";
import SystemStatusRow from "./SystemStatusRow.vue";
import AssetHealthCard from "./AssetHealthCard.vue";

const store = useDashboardStore();
const collapsed = ref(false);
const modeConfig = computed(() => getDashboardModeConfig(store.activeMode));
const sectionTitle = computed(() => (store.activeMode === "events" ? "Live Event Operations" : "Live Operations"));
const wobble = (seed: string, amount: number) => Math.round((Math.sin(store.liveTick * 1.7 + seed.length * 3.1) * 0.5 + 0.5) * amount);
function liveMetric(item: any) {
  if (item.label === "Temperature") return { ...item, value: `${27 + wobble(item.label, 5)}°C` };
  if (item.label.includes("Visitors") || item.label.includes("Attendance")) return { ...item, value: (390 + wobble(item.label, 100)).toLocaleString() };
  if (item.label === "Open Issues" || item.label === "Open Tasks") return { ...item, value: String(2 + wobble(item.label, 3)) };
  return item;
}
function liveSystem(item: any) {
  if (item.label.includes("Lighting")) return { ...item, value: `${96 + wobble(item.label, 4)}%` };
  return item;
}
function liveAsset(item: any) {
  if (!item.value.includes("%")) return item;
  const progress = Math.max(1, Math.min(99, item.progress + wobble(item.label, 3) - 1));
  return { ...item, value: `${progress}%`, progress, stats: item.stats.map((stat: any, index: number) => index === 0 ? { ...stat, value: `${progress}%` } : stat) };
}

function focus(focusId?: string) {
  if (!focusId) return;
  store.sceneController?.focus(focusId);
}
</script>

<style scoped>
.operations-panel {
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.panel-heading {
  width: 100%;
  height: 58px;
  flex: 0 0 58px;
  padding: 0 18px;
  border: 0;
  background: transparent;
  color: #0a2a5e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: 700 15px inherit;
  cursor: pointer;
}

.panel-heading span,
.section-heading span {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.panel-heading span .app-icon,
.section-heading > span:first-child .app-icon {
  flex: 0 0 auto;
  font-size: 22px;
  color: #c98517;
}

.panel-heading > .app-icon {
  flex: 0 0 auto;
  font-size: 16px;
  transition: transform .2s;
}

.panel-heading > .rotated {
  transform: rotate(180deg);
}

.panel-content {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 43, 99, .38) transparent;
  padding: 0 12px 12px;
  box-sizing: border-box;
}

.panel-content.operations {
  display: grid;
  grid-template-rows: auto auto minmax(150px, 1fr) auto;
  gap: 10px;
}

.panel-content.assets {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(8, 43, 99, .32);
  border-radius: 999px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.section-heading {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
}

.active-state {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: #27833a;
  font-weight: 650;
  white-space: nowrap;
}

.systems {
  min-height: 150px;
  border: 1px solid rgba(7, 38, 87, .08);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, .5);
  display: grid;
  grid-template-rows: repeat(5, minmax(36px, 1fr));
}

.systems :deep(.system-row) {
  height: auto;
}

.asset-list {
  display: grid;
  grid-auto-rows: 126px;
  gap: 8px;
  align-content: start;
}

.panel-footer {
  width: 100%;
  height: 48px;
  min-height: 48px;
  flex: 0 0 48px;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  color: #082b63;
  font: 700 13px inherit;
  cursor: pointer;
}

.panel-footer .app-icon {
  flex: 0 0 auto;
  font-size: 17px;
}

@media (max-height: 780px) {
  .asset-list {
    grid-auto-rows: 116px;
  }

  .panel-heading {
    height: 50px;
    flex-basis: 50px;
  }

  .panel-content.operations {
    grid-template-rows: auto auto minmax(126px, 1fr) auto;
    gap: 8px;
    padding-bottom: 10px;
  }

  .section-heading {
    min-height: 40px;
  }

  .systems {
    min-height: 126px;
  }

  .panel-footer {
    height: 44px;
    flex-basis: 44px;
    min-height: 44px;
  }
}

@media (max-width: 620px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity .28s ease, transform .28s ease;
}

.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.heading-fade-enter-active,
.heading-fade-leave-active {
  transition: opacity .22s ease, transform .22s ease;
}

.heading-fade-enter-from,
.heading-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
