<template>
  <div class="cesium-scene">
    <div ref="containerRef" class="cesium-host"></div>
    <aside v-if="selectedPoi" class="poi-info" role="status">
      <button class="poi-close" aria-label="Close device details" @click="selectedPoi = null">×</button>
      <div class="poi-kicker">LIVE DEVICE</div>
      <h3>{{ selectedPoi.name }}</h3>
      <p>{{ selectedPoi.label }}</p>
      <div class="poi-grid"><span>Signal<strong>{{ selectedPoi.signal }}%</strong></span><span>Load<strong>{{ selectedPoi.load }}%</strong></span><span>Updated<strong>{{ selectedPoi.updated }}</strong></span></div>
    </aside>
    <div v-if="!ready" class="cesium-loading" role="status" aria-live="polite">
      <div class="cesium-loading__spinner" aria-hidden="true"></div>
      <p>{{ errorMessage || "Loading digital twin…" }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDashboardStore } from "../stores/dashboard";
import { createCesiumParkScene } from "../gis/cesiumParkScene";

const containerRef = ref<HTMLElement | null>(null);
const ready = ref(false);
const errorMessage = ref("");
const selectedPoi = ref<{ name: string; label: string; signal: number; load: number; updated: string } | null>(null);
const store = useDashboardStore();
let scene: Awaited<ReturnType<typeof createCesiumParkScene>> | null = null;
let stopSimulationTimeSync: (() => void) | null = null;

onMounted(async () => {
  if (!containerRef.value) return;
  try {
    scene = markRaw(await createCesiumParkScene(containerRef.value));
    store.sceneController = scene;
    ready.value = true;
  } catch (error) {
    console.error("Failed to initialize Cesium scene", error);
    errorMessage.value = "地图加载失败，请刷新重试";
    return;
  }
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
  const stopPoi = scene.onPoiSelect((poi) => {
    selectedPoi.value = { ...poi, signal: 94 + Math.floor(Math.random() * 6), load: 35 + Math.floor(Math.random() * 40), updated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) };
  });
  const originalUnmount = stopSimulationTimeSync;
  stopSimulationTimeSync = () => { originalUnmount?.(); stopPoi(); };
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

.cesium-scene {
  position: relative;
  width: 100%;
  height: 100%;
}

.cesium-loading {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  color: #dfeaf2;
  background: #07100f;
  pointer-events: none;
}

.cesium-loading p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.cesium-loading__spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(223, 234, 242, .22);
  border-top-color: #58d6bd;
  border-radius: 50%;
  animation: cesium-spin .8s linear infinite;
}

.poi-info { position:absolute; z-index:6; left:50%; top:118px; transform:translateX(-50%); width:260px; padding:16px 18px; border:1px solid rgba(7,38,87,.14); border-radius:10px; background:rgba(255,255,255,.96); box-shadow:0 12px 28px rgba(15,36,62,.2); color:#123461; pointer-events:auto; }
.poi-close { position:absolute; top:6px; right:8px; border:0; background:none; color:#5d6c7f; font-size:22px; cursor:pointer; }
.poi-kicker { color:#c48618; font-size:10px; font-weight:800; letter-spacing:.12em; }
.poi-info h3 { margin:5px 0 2px; font-size:16px; }
.poi-info p { margin:0 0 12px; color:#63758d; font-size:12px; }
.poi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.poi-grid span { display:grid; gap:3px; color:#63758d; font-size:10px; }
.poi-grid strong { color:#123461; font-size:13px; }

@keyframes cesium-spin {
  to { transform: rotate(360deg); }
}
</style>
