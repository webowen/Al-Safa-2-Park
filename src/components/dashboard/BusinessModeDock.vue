<template><nav class="mode-dock" aria-label="Business modes"><button v-for="mode in store.modes" :key="mode.id" class="mode-button" :class="{active:store.activeMode===mode.id}" @click="store.activeMode=mode.id"><span class="mode-icon" :class="`tone-${mode.tone}`"><AppIcon :name="mode.icon"/></span><span class="mode-copy"><strong>{{mode.title}}</strong><small>{{mode.description}}</small></span><AppIcon name="chevron-right" class="chevron"/></button></nav></template>
<script setup lang="ts">import {useDashboardStore} from "../../stores/dashboard";import AppIcon from "../ui/AppIcon.vue";const store=useDashboardStore();</script>
<style scoped>
.mode-dock {
  pointer-events: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1.08fr;
  width: min(860px, 100%);
  min-width: 0;
  height: 84px;
  padding: 5px;
  background: rgba(255, 255, 255, .95);
  border: 1px solid rgba(7, 38, 87, .12);
  border-radius: 8px;
  box-shadow: 0 12px 34px rgba(17, 31, 48, .17);
  backdrop-filter: blur(16px);
  box-sizing: border-box;
}

.mode-button {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  padding: 8px 11px;
  border: 0;
  border-right: 1px solid rgba(7, 38, 87, .1);
  background: transparent;
  color: #0b2a5d;
  text-align: left;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: color .24s ease, transform .24s ease;
  isolation: isolate;
}

.mode-button::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 3px;
  border-radius: 9px;
  background: linear-gradient(135deg, #0a3979, #052657);
  box-shadow: 0 6px 18px rgba(5, 38, 87, .25);
  opacity: 0;
  transition: opacity .24s ease;
}

.mode-button:last-child {
  border-right: 0;
}

.mode-button:hover {
  background: rgba(235, 241, 247, .8);
}

.mode-button.active {
  color: white;
}

.mode-button.active::before {
  opacity: 1;
}

.mode-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(209, 139, 22, .1);
  font-size: 28px;
}

.mode-button.active .mode-icon {
  background: transparent;
}

.tone-gold {
  color: #d18b16;
}

.tone-green {
  color: #3a913f;
}

.mode-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.mode-copy strong {
  font-size: 13px;
  line-height: 1.15;
  white-space: nowrap;
}

.mode-copy small {
  font-size: 11.5px;
  line-height: 1.35;
  color: #4b607c;
}

.mode-button.active small {
  color: rgba(255, 255, 255, .86);
}

.chevron {
  font-size: 17px;
}

@media (max-width: 1350px) {
  .mode-dock {
    width: 100%;
    min-width: 0;
  }

  .mode-button {
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 6px;
    padding: 7px 8px;
  }

  .mode-icon {
    width: 30px;
    height: 30px;
    font-size: 18px;
  }

  .mode-copy strong {
    font-size: 11.5px;
  }

  .mode-copy small {
    display: none;
  }

  .chevron {
    display: none;
  }
}

@media (max-width: 1250px) {
  .mode-dock {
    width: 100%;
    min-width: 0;
  }
}
</style>
