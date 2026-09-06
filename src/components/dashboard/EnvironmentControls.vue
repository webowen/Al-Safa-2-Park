<template>
  <GlassPanel class="environment-controls">
    <div class="environment-heading">
      <span class="environment-title">
        <AppIcon name="sun" />
        Daylight Analysis
      </span>
      <strong>{{ formattedHour }}</strong>
    </div>

    <div class="time-control">
      <input
        v-model.number="timeValue"
        class="time-slider"
        type="range"
        min="0"
        max="24"
        step="0.25"
        aria-label="Simulation time"
        @input="updateTime"
      />
      <div class="time-scale" aria-hidden="true">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>

    <div class="environment-actions">
      <button
        class="icon-action"
        :title="store.clockAnimating ? 'Pause daylight analysis' : 'Play daylight analysis'"
        :aria-label="store.clockAnimating ? 'Pause daylight analysis' : 'Play daylight analysis'"
        @click="toggleAnimation"
      >
        <AppIcon :name="store.clockAnimating ? 'pause' : 'play'" />
      </button>

      <label class="speed-control">
        <span>Speed</span>
        <select v-model.number="speedValue" aria-label="Daylight analysis speed" @change="updateSpeed">
          <option :value="30">30×</option>
          <option :value="120">120×</option>
          <option :value="360">360×</option>
          <option :value="900">900×</option>
        </select>
      </label>

      <button class="preset-button" :class="{ active: isDayPreset }" @click="applyPreset(14)">
        <AppIcon name="sun" />
        Day
      </button>
      <button class="preset-button" :class="{ active: isNightPreset }" @click="applyPreset(22)">
        <AppIcon name="moon" />
        Night
      </button>
      <button class="rain-button" :class="{ active: store.rainEnabled }" @click="store.setRain(!store.rainEnabled)">
        <AppIcon name="cloud-rain" />
        Rain
      </button>
    </div>
  </GlassPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDashboardStore } from "../../stores/dashboard";
import AppIcon from "../ui/AppIcon.vue";
import GlassPanel from "../ui/GlassPanel.vue";

const store = useDashboardStore();
const timeValue = ref(store.simulationHour);
const speedValue = ref(store.clockMultiplier);

const formattedHour = computed(() => {
  const totalMinutes = Math.round(timeValue.value * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const isDayPreset = computed(() => Math.abs(timeValue.value - 14) < 0.01);
const isNightPreset = computed(() => Math.abs(timeValue.value - 22) < 0.01);

watch(
  () => store.simulationHour,
  (hour) => {
    timeValue.value = hour;
  },
);

watch(
  () => store.clockMultiplier,
  (multiplier) => {
    speedValue.value = multiplier;
  },
);

function updateTime() {
  store.setSimulationTime(timeValue.value);
}

function updateSpeed() {
  store.setClockMultiplier(speedValue.value);
}

function toggleAnimation() {
  store.setClockAnimating(!store.clockAnimating);
}

function applyPreset(hour: number) {
  timeValue.value = hour;
  store.setSimulationTime(hour);
}
</script>

<style scoped>
.environment-controls {
  width: 100%;
  max-width: 360px;
  height: 106px;
  padding: 11px 12px 10px;
  box-sizing: border-box;
  pointer-events: auto;
}

.environment-heading,
.environment-actions,
.time-scale {
  display: flex;
  align-items: center;
}

.environment-heading {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.environment-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #08285b;
  font-size: 12px;
  font-weight: 750;
}

.environment-title .app-icon {
  color: #c98517;
  font-size: 18px;
}

.environment-heading strong {
  color: #17376b;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.time-control {
  display: grid;
  gap: 4px;
}

.time-slider {
  width: 100%;
  height: 5px;
  margin: 0;
  accent-color: #c98517;
  cursor: pointer;
}

.time-scale {
  justify-content: space-between;
  color: #64758b;
  font-size: 8px;
  font-variant-numeric: tabular-nums;
}

.environment-actions {
  gap: 5px;
  margin-top: 8px;
  flex-wrap: nowrap;
}

.environment-actions button,
.speed-control {
  height: 30px;
  border: 1px solid rgba(7, 38, 87, .1);
  border-radius: 7px;
  box-sizing: border-box;
  background: rgba(246, 249, 252, .94);
  color: #17376b;
  font: 650 10px inherit;
}

.environment-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 8px;
  cursor: pointer;
  white-space: nowrap;
}

.environment-actions button:hover,
.environment-actions button:focus-visible {
  border-color: rgba(7, 47, 104, .28);
  background: #eef4f9;
  outline: none;
}

.icon-action {
  width: 32px;
  padding: 0 !important;
}

.icon-action .app-icon {
  font-size: 14px;
}

.speed-control {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
}

.speed-control span {
  color: #667991;
  font-size: 9px;
}

.speed-control select {
  border: 0;
  background: transparent;
  color: #17376b;
  font: inherit;
  outline: 0;
  cursor: pointer;
}

.preset-button.active,
.rain-button.active {
  background: #082f68;
  border-color: #082f68;
  color: white;
}

.preset-button .app-icon,
.rain-button .app-icon {
  font-size: 14px;
}

.rain-button {
  margin-left: auto;
}

@media (max-width: 620px) {
  .environment-controls {
    max-width: 100%;
  }

  .environment-actions {
    flex-wrap: wrap;
  }

  .rain-button {
    margin-left: 0;
  }
}
</style>
