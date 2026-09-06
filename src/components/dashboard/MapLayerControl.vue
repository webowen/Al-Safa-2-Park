<template><GlassPanel class="layer-control"><h2><AppIcon name="layers"/>Map Layers</h2><div class="layer-tabs"><button v-for="layer in store.layers" :key="layer.id" :class="{active:store.activeLayer===layer.id}" @click="store.activeLayer=layer.id"><AppIcon :name="layer.icon"/><span>{{layer.label}}</span></button></div></GlassPanel></template>
<script setup lang="ts">import {useDashboardStore} from "../../stores/dashboard";import AppIcon from "../ui/AppIcon.vue";import GlassPanel from "../ui/GlassPanel.vue";const store=useDashboardStore();</script>
<style scoped>
.layer-control {
  pointer-events: auto;
  width: 100%;
  height: 96px;
  padding: 12px;
  box-sizing: border-box;
}

.layer-control h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 3px 8px;
  font-size: 12px;
  line-height: 1.2;
}

.layer-control h2 .app-icon {
  font-size: 19px;
  color: #49627e;
}

.layer-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 56px;
  border: 1px solid rgba(7, 38, 87, .09);
  border-radius: 11px;
  overflow: hidden;
}

.layer-tabs button {
  border: 0;
  background: rgba(255, 255, 255, .58);
  color: #284568;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  font: 12px inherit;
  cursor: pointer;
}

.layer-tabs button .app-icon {
  font-size: 18px;
}

.layer-tabs button.active {
  background: #082f68;
  color: white;
}

.layer-tabs button:focus-visible {
  outline: 2px solid #d18b16;
  outline-offset: -3px;
}

@media (max-width: 1350px) {
  .layer-control {
    width: 100%;
  }
}
</style>
