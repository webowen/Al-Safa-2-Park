<template>
  <main class="app-shell">
    <div class="cesium-stage-wrap">
      <CesiumScene />
    </div>
    <DashboardHud />
  </main>
</template>

<script setup lang="ts">
import CesiumScene from "./components/CesiumScene.vue";
import DashboardHud from "./components/dashboard/DashboardHud.vue";
</script>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #07100f;
}

.cesium-stage-wrap {
  width: 100%;
  height: 100%;
}
</style>
