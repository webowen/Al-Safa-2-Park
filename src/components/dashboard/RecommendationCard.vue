<template>
  <article
    class="recommendation-card"
    :class="{ interactive: Boolean(item.focusId) }"
    :role="item.focusId ? 'button' : undefined"
    :tabindex="item.focusId ? 0 : undefined"
    @click="item.focusId && emit('select')"
    @keydown.enter.prevent="item.focusId && emit('select')"
    @keydown.space.prevent="item.focusId && emit('select')"
  >
    <AppIcon :name="item.icon" :class="`tone-${item.tone}`"/>
    <div class="recommendation-copy">
      <h3>{{item.title}}</h3>
      <p>{{item.description}}</p>
    </div>
    <AppIcon name="chevron-right" class="chevron"/>
  </article>
</template>
<script setup lang="ts">
import type { RecommendationItem } from "../../types/dashboard";
import AppIcon from "../ui/AppIcon.vue";
defineProps<{item:RecommendationItem}>();
const emit = defineEmits<{ select: [] }>();
</script>
<style scoped>
.recommendation-card {
  height: 84px;
  min-height: 84px;
  padding: 12px;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 14px;
  gap: 10px;
  align-items: start;
  background: rgba(255, 255, 255, .72);
  border: 1px solid rgba(7, 38, 87, .08);
  border-radius: 8px;
  box-sizing: border-box;
  transition: transform .18s, box-shadow .18s;
}

.recommendation-card.interactive {
  cursor: pointer;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(17, 37, 61, .1);
}

.recommendation-card > .app-icon {
  flex: 0 0 auto;
  font-size: 27px;
}

.recommendation-copy {
  min-width: 0;
}

.recommendation-copy h3 {
  font-size: 13px;
  line-height: 1.2;
  margin: 1px 0 6px;
  color: #08285b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommendation-copy p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 11px;
  line-height: 1.35;
  margin: 0;
  color: #435c7e;
}

.chevron {
  font-size: 16px;
  color: #163968;
  align-self: center;
}

.tone-gold {
  color: #d18b16;
}

.tone-green {
  color: #2d8e3a;
}

.tone-blue {
  color: #2585e9;
}

@media (max-height: 780px) {
  .recommendation-card {
    height: 78px;
    min-height: 78px;
    padding: 10px 12px;
  }
}
</style>
