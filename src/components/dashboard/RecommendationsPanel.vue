<template>
  <GlassPanel class="recommendations-panel">
    <Transition name="heading-fade" mode="out-in">
      <div :key="store.activeMode" class="recommendations-heading">
        <span>
          <AppIcon name="sparkles" />
          {{ modeConfig.recommendations.title }}
        </span>
        <small>{{ modeConfig.recommendations.subtitle }}</small>
      </div>
    </Transition>

    <Transition name="panel-fade" mode="out-in">
      <div :key="store.activeMode" class="recommendation-content">
        <div class="recommendation-list">
          <RecommendationCard
            v-for="item in modeConfig.recommendations.items"
            :key="item.title"
            :item="item"
            @select="focus(item.focusId)"
          />
        </div>

        <button class="panel-footer" @click="focus(modeConfig.defaultFocusId)">
          {{ modeConfig.recommendations.footerLabel }}
          <AppIcon name="arrow-right" />
        </button>
      </div>
    </Transition>
  </GlassPanel>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "../../stores/dashboard";
import { getDashboardModeConfig } from "../../data/dashboardModes";
import AppIcon from "../ui/AppIcon.vue";
import GlassPanel from "../ui/GlassPanel.vue";
import RecommendationCard from "./RecommendationCard.vue";

const store = useDashboardStore();
const modeConfig = computed(() => getDashboardModeConfig(store.activeMode));

function focus(focusId?: string) {
  if (!focusId) return;
  store.sceneController?.focus(focusId);
}
</script>

<style scoped>
.recommendations-panel {
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  padding-top: 21px;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  pointer-events: auto;
}

.recommendations-heading {
  height: 64px;
  flex: 0 0 64px;
  padding: 0 18px 12px;
  box-sizing: border-box;
}

.recommendations-heading > span {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 750;
  color: #08285b;
}

.recommendations-heading .app-icon {
  flex: 0 0 auto;
  font-size: 20px;
  color: #d18b16;
}

.recommendations-heading small {
  display: block;
  margin: 5px 0 0 30px;
  font-size: 11px;
  line-height: 1.35;
  color: #536780;
}

.recommendation-list {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-auto-rows: 84px;
  gap: 8px;
  padding: 0 12px 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 43, 99, .38) transparent;
}

.recommendation-content {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-list::-webkit-scrollbar {
  width: 8px;
}

.recommendation-list::-webkit-scrollbar-thumb {
  background: rgba(8, 43, 99, .32);
  border-radius: 999px;
}

.panel-footer {
  flex: 0 0 42px;
  height: 42px;
  min-height: 42px;
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 22px;
  color: #082b63;
  font: 700 13px inherit;
  cursor: pointer;
}

.panel-footer .app-icon {
  flex: 0 0 auto;
  font-size: 17px;
}

@media (max-height: 780px) {
  .recommendation-list {
    grid-auto-rows: 78px;
  }

  .recommendations-panel {
    padding-top: 14px;
  }

  .recommendations-heading {
    height: 56px;
    flex-basis: 56px;
    padding-bottom: 10px;
  }

  .panel-footer {
    flex-basis: 40px;
    height: 40px;
    min-height: 40px;
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
