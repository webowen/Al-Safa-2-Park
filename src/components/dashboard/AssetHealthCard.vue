<template>
  <article
    class="asset-card"
    :class="`tone-${item.tone}`"
    :style="{ '--progress': String(item.progress) }"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
    role="button"
    tabindex="0"
  >
    <div class="asset-head">
      <div class="asset-title">
        <AppIcon :name="item.icon" class="asset-icon" />
        <div class="asset-copy">
          <h3>{{ item.label }}</h3>
          <p>{{ item.detail }}</p>
        </div>
      </div>
      <AppIcon name="chevron-right" class="chevron" />
    </div>

    <div class="asset-body">
      <div class="asset-ring">
        <strong>{{ item.value }}</strong>
      </div>

      <div class="asset-summary">
        <strong class="asset-status">{{ item.status }}</strong>
        <div v-for="stat in item.stats" :key="stat.label" class="asset-stat">
          <span>{{ stat.label }}</span>
          <strong :class="`tone-${stat.tone}`">{{ stat.value }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AssetHealthItem } from "../../types/dashboard";
import AppIcon from "../ui/AppIcon.vue";

defineProps<{ item: AssetHealthItem }>();
const emit = defineEmits<{ select: [] }>();
</script>

<style scoped>
.asset-card {
  height: 126px;
  min-height: 126px;
  padding: 12px 13px;
  display: grid;
  grid-template-rows: 34px minmax(0, 1fr);
  gap: 5px;
  background: rgba(255, 255, 255, .72);
  border: 1px solid rgba(7, 38, 87, .08);
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;
  transition: transform .18s, box-shadow .18s, border-color .18s;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(17, 37, 61, .1);
  border-color: rgba(7, 38, 87, .14);
}

.asset-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  min-height: 0;
}

.asset-title {
  min-width: 0;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 11px;
  align-items: start;
}

.asset-icon {
  font-size: 18px;
  margin-top: 2px;
}

.asset-copy {
  min-width: 0;
}

.asset-copy h3 {
  margin: 0;
  font-size: 13px;
  line-height: 1.25;
  color: #0a2a5e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-copy p {
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.25;
  color: #5a6e87;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex: 0 0 auto;
  margin-top: 2px;
  font-size: 16px;
  color: #163968;
}

.asset-body {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  min-height: 0;
}

.asset-ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 60px;
  aspect-ratio: 1;
  color: currentColor;
}

.asset-ring::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, .98) 0 59%, transparent 60%),
    conic-gradient(currentColor 0 calc(var(--progress) * 1%), rgba(148, 162, 182, .22) 0);
}

.asset-ring::after {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .98);
  box-shadow: inset 0 0 0 1px rgba(7, 38, 87, .05);
}

.asset-ring strong {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 18px;
  line-height: 1;
  color: #0a2a5e;
}

.asset-summary {
  display: grid;
  grid-template-rows: 15px repeat(3, 13px);
  gap: 1px;
  min-width: 0;
}

.asset-status {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 15px;
  color: #51647e;
}

.asset-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  font-size: 10px;
  line-height: 1.2;
  color: #5b6d85;
}

.asset-stat strong {
  font-size: 11px;
  font-weight: 700;
}

.tone-gold {
  color: #c98517;
}

.tone-green {
  color: #2f8d3a;
}

.tone-blue {
  color: #2b7fe8;
}

.tone-red {
  color: #d83b38;
}

.tone-orange {
  color: #d18b16;
}

.tone-navy {
  color: #17376b;
}

@media (max-height: 780px) {
  .asset-card {
    height: 116px;
    min-height: 116px;
    padding: 10px 12px;
  }

  .asset-body {
    grid-template-columns: 70px minmax(0, 1fr);
  }

  .asset-ring {
    width: 64px;
  }
}
</style>
