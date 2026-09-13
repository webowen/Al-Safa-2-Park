<template>
  <div class="dashboard-hud">
    <TopHeader />
    <DailyOperationsPanel class="left-panel" />
    <RecommendationsPanel class="right-panel" />
    <div class="bottom-rail">
      <MapLayerControl class="layer-panel" />
      <div class="bottom-center">
        <Transition name="legend-fade" mode="out-in">
          <ModeLegendBar :key="store.activeMode" class="legend-panel" />
        </Transition>
        <BusinessModeDock class="mode-panel" />
      </div>
      <div class="bottom-right">
        <EnvironmentControls class="environment-panel" />
        <MapTools class="tools-panel" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">import { useDashboardStore } from "../../stores/dashboard";import TopHeader from "./TopHeader.vue";import DailyOperationsPanel from "./DailyOperationsPanel.vue";import RecommendationsPanel from "./RecommendationsPanel.vue";import MapLayerControl from "./MapLayerControl.vue";import ModeLegendBar from "./ModeLegendBar.vue";import BusinessModeDock from "./BusinessModeDock.vue";import EnvironmentControls from "./EnvironmentControls.vue";import MapTools from "./MapTools.vue";const store=useDashboardStore();</script>
<style scoped>
.dashboard-hud {
  --side-top: 126px;
  --left-side-bottom: 190px;
  --right-side-bottom: 248px;
  --bottom-rail-gap: 14px;

  position: absolute;
  z-index: 10;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  color: #08285b;
}

.left-panel,
.right-panel,
.bottom-rail {
  position: absolute;
}

.dashboard-hud > .left-panel,
.dashboard-hud > .right-panel {
  top: var(--side-top);
  min-height: 0;
  overflow: hidden;
  pointer-events: auto;
  width: clamp(354px, 20vw, 404px);
  box-sizing: border-box;
  contain: layout paint;
}

.dashboard-hud > .right-panel {
  contain: layout paint;
}

.dashboard-hud > .left-panel {
  height: calc(100svh - var(--side-top) - var(--left-side-bottom));
}

.left-panel {
  left: 28px;
}

.right-panel {
  right: 28px;
}

.dashboard-hud > .right-panel {
  height: calc(100svh - var(--side-top) - var(--right-side-bottom));
}

.dashboard-hud > .right-panel {
  width: clamp(340px, 19vw, 390px);
}

.bottom-rail {
  left: 28px;
  right: 28px;
  bottom: 28px;
  display: grid;
  grid-template-columns: clamp(354px, 20vw, 404px) minmax(0, 1fr) clamp(326px, 26vw, 360px);
  align-items: end;
  gap: var(--bottom-rail-gap);
  pointer-events: none;
}

.bottom-center,
.bottom-right {
  display: grid;
  gap: 10px;
  min-width: 0;
  pointer-events: none;
}

.bottom-center {
  justify-items: center;
}

.bottom-right {
  justify-items: end;
  align-content: end;
}

.layer-panel,
.legend-panel,
.mode-panel,
.environment-panel,
.tools-panel {
  position: relative;
}

.layer-panel,
.legend-panel,
.mode-panel,
.environment-panel,
.tools-panel {
  pointer-events: auto;
  animation: hud-in .55s ease-out both;
}

.right-panel { animation-delay: .08s; }
.mode-panel { animation-delay: .14s; }
.legend-panel { animation-delay: .18s; }
.environment-panel { animation-delay: .22s; }

.legend-fade-enter-active,
.legend-fade-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}

.legend-fade-enter-from,
.legend-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes hud-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1250px) {
  .dashboard-hud {
    --side-top: 104px;
    --left-side-bottom: 178px;
    --right-side-bottom: 238px;
    --bottom-rail-gap: 10px;
  }

  .dashboard-hud > .left-panel,
  .dashboard-hud > .right-panel {
    width: 320px;
  }

  .dashboard-hud > .left-panel {
    height: calc(100svh - var(--side-top) - var(--left-side-bottom));
  }

  .dashboard-hud > .right-panel {
    height: calc(100svh - var(--side-top) - var(--right-side-bottom));
  }

  .left-panel {
    left: 18px;
  }

  .right-panel {
    right: 18px;
  }

  .bottom-rail {
    left: 18px;
    right: 18px;
    bottom: 18px;
    grid-template-columns: clamp(220px, 17vw, 260px) minmax(0, 1fr) clamp(300px, 28vw, 350px);
  }

  .dashboard-hud > .right-panel {
    width: 320px;
  }
}

@media (max-width: 900px) {
  .dashboard-hud {
    --side-top: 100px;
    --left-side-bottom: 158px;
    --right-side-bottom: 214px;
  }

  .dashboard-hud > .left-panel,
  .dashboard-hud > .right-panel {
    width: min(300px, calc(50vw - 24px));
  }

  .dashboard-hud > .left-panel {
    height: calc(100svh - var(--side-top) - var(--left-side-bottom));
  }

  .dashboard-hud > .right-panel {
    height: calc(100svh - var(--side-top) - var(--right-side-bottom));
  }

  .bottom-rail {
    grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
    row-gap: 10px;
  }

  .bottom-right {
    grid-column: 2;
  }

  .mode-panel {
    display: none;
  }
}

@media (max-width: 620px) {
  .dashboard-hud {
    --side-top: 96px;
    --left-side-bottom: 86px;
    --right-side-bottom: 86px;

    overflow-y: auto;
    padding: 96px 10px 88px;
    box-sizing: border-box;
    pointer-events: auto;
  }

  .dashboard-hud > .left-panel,
  .dashboard-hud > .right-panel,
  .dashboard-hud > .bottom-rail,
  .bottom-rail > * {
    position: relative;
    inset: auto;
    width: 100%;
  }

  .dashboard-hud > .left-panel,
  .dashboard-hud > .right-panel {
    height: min(460px, calc(100svh - 154px));
    max-height: min(460px, calc(100svh - 154px));
  }

  .dashboard-hud > .right-panel,
  .dashboard-hud > .bottom-rail {
    margin-top: 12px;
  }

  .dashboard-hud > .bottom-rail {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .bottom-center,
  .bottom-right {
    width: 100%;
    grid-column: 1;
  }

  .dashboard-hud > .bottom-rail :deep(.layer-control),
  .dashboard-hud > .bottom-rail :deep(.mode-dock),
  .dashboard-hud > .bottom-rail :deep(.mode-legend),
  .dashboard-hud > .bottom-rail :deep(.environment-controls),
  .dashboard-hud > .bottom-rail :deep(.map-tools) {
    width: 100%;
  }

  .tools-panel :deep(.map-tools) {
    gap: 6px;
  }

  .tools-panel :deep(.map-tools button) {
    width: 44px;
    height: 44px;
  }
}

@media (max-height: 820px) and (min-width: 901px) {
  .dashboard-hud {
    --side-top: 112px;
    --left-side-bottom: 228px;
    --right-side-bottom: 260px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-hud * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
