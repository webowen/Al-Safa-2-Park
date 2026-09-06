<template>
  <div class="map-tools" aria-label="Map controls">
    <button title="Recenter map" aria-label="Recenter map" @click="recenter">
      <span class="target-icon"><i></i></span>
    </button>
    <button class="text-tool" :title="viewToggleTitle" :aria-label="viewToggleTitle" @click="toggleView">
      {{ viewToggleLabel }}
    </button>
    <button title="Reset north" aria-label="Reset north" @click="resetNorth">
      <span class="compass"><i></i></span>
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "../../stores/dashboard";

const store = useDashboardStore();

const viewToggleLabel = computed(() => (store.sceneViewMode === "3D" ? "2D" : "3D"));
const viewToggleTitle = computed(() => `Switch to ${viewToggleLabel.value}`);

function toggleView() {
  store.toggleSceneViewMode();
}

function recenter() {
  store.sceneController?.recenter();
}

function resetNorth() {
  store.sceneController?.resetNorth();
}
</script>
<style scoped>
.map-tools{pointer-events:auto;display:flex;gap:13px}.map-tools button{width:55px;height:55px;border:1px solid rgba(7,38,87,.1);border-radius:50%;background:rgba(255,255,255,.95);color:#082b63;box-shadow:0 8px 22px rgba(16,31,49,.16);display:grid;place-items:center;cursor:pointer}.map-tools button:hover{transform:translateY(-2px)}.text-tool{font:750 15px Georgia,serif}.target-icon{width:20px;height:20px;border:2px solid currentColor;border-radius:50%;position:relative}.target-icon:before,.target-icon:after{content:"";position:absolute;background:currentColor}.target-icon:before{left:8px;top:-5px;width:2px;height:26px}.target-icon:after{top:8px;left:-5px;height:2px;width:26px}.target-icon i{position:absolute;width:5px;height:5px;border-radius:50%;background:currentColor;left:6px;top:6px}.compass{width:22px;height:30px;position:relative;transform:rotate(25deg)}.compass:before,.compass:after{content:"";position:absolute;left:5px;border-left:6px solid transparent;border-right:6px solid transparent}.compass:before{top:0;border-bottom:14px solid #d83b38}.compass:after{bottom:0;border-top:14px solid #b9c0c8}.compass i{position:absolute;z-index:2;width:4px;height:4px;border-radius:50%;background:white;left:9px;top:13px}
</style>
