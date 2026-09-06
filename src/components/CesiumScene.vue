<template>
  <div ref="containerRef" class="cesium-host"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDashboardStore } from "../stores/dashboard";
import { createCesiumParkScene } from "../gis/cesiumParkScene";

const containerRef = ref<HTMLElement | null>(null);
const store = useDashboardStore();
let scene: Awaited<ReturnType<typeof createCesiumParkScene>> | null = null;
let stopSimulationTimeSync: (() => void) | null = null;

onMounted(async () => {
  if (!containerRef.value) return;
  scene = await createCesiumParkScene(containerRef.value);
  store.sceneController = scene;
  scene.setMode(store.activeMode);
  scene.setLayer(store.activeLayer);
  scene.setViewMode(store.sceneViewMode);
  scene.setSimulationTime(store.simulationHour);
  scene.setClockMultiplier(store.clockMultiplier);
  scene.setClockAnimating(store.clockAnimating);
  scene.setRain(store.rainEnabled);
  stopSimulationTimeSync = scene.onSimulationTimeChange((hour) => {
    store.syncSimulationTime(hour);
  });
});

watch(
  () => store.activeMode,
  (mode) => {
    scene?.setMode(mode);
  },
);

watch(
  () => store.activeLayer,
  (layer) => {
    scene?.setLayer(layer);
  },
);

watch(
  () => store.sceneViewMode,
  (viewMode) => {
    scene?.setViewMode(viewMode);
  },
  { immediate: true },
);

watch(
  () => store.clockMultiplier,
  (multiplier) => {
    scene?.setClockMultiplier(multiplier);
  },
);

watch(
  () => store.clockAnimating,
  (isAnimating) => {
    scene?.setClockAnimating(isAnimating);
  },
);

watch(
  () => store.rainEnabled,
  (enabled) => {
    scene?.setRain(enabled);
  },
);

onBeforeUnmount(() => {
  store.sceneController = null;
  stopSimulationTimeSync?.();
  stopSimulationTimeSync = null;
  scene?.destroy();
  scene = null;
});
</script>

<style scoped>
.cesium-host {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>
