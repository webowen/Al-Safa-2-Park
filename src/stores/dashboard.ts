import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { businessModes, mapLayers } from "../data/dailyOperations";
import type { DashboardSceneController, DashboardSceneView, MapLayerId } from "../types/dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
  const activeMode = ref<"daily" | "events" | "maintenance">("daily");
  const activeLayer = ref<MapLayerId>("base");
  const sceneViewMode = ref<DashboardSceneView>("3D");
  const sceneController = ref<DashboardSceneController | null>(null);
  const simulationHour = ref(14);
  const clockMultiplier = ref(120);
  const clockAnimating = ref(false);
  const rainEnabled = ref(false);
  const modes = computed(() => businessModes);
  const layers = computed(() => mapLayers);

  function toggleSceneViewMode() {
    sceneViewMode.value = sceneViewMode.value === "3D" ? "2D" : "3D";
  }

  function setSimulationTime(hour: number) {
    simulationHour.value = hour;
    sceneController.value?.setSimulationTime(hour);
  }

  function syncSimulationTime(hour: number) {
    simulationHour.value = hour;
  }

  function setClockMultiplier(multiplier: number) {
    clockMultiplier.value = multiplier;
    sceneController.value?.setClockMultiplier(multiplier);
  }

  function setClockAnimating(isAnimating: boolean) {
    clockAnimating.value = isAnimating;
    sceneController.value?.setClockAnimating(isAnimating);
  }

  function setRain(enabled: boolean) {
    rainEnabled.value = enabled;
    sceneController.value?.setRain(enabled);
  }

  return {
    activeMode,
    activeLayer,
    sceneViewMode,
    sceneController,
    simulationHour,
    clockMultiplier,
    clockAnimating,
    rainEnabled,
    modes,
    layers,
    toggleSceneViewMode,
    setSimulationTime,
    syncSimulationTime,
    setClockMultiplier,
    setClockAnimating,
    setRain,
  };
});
