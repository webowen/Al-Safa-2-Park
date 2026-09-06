<template>
  <header class="top-header" aria-label="Park dashboard header">
    <div class="brand">
      <div class="palm-mark" aria-hidden="true">
        <svg viewBox="0 0 72 72"><path d="M35 67V30"/><path d="M34 33C25 22 14 22 7 27c10 0 18 4 25 12M37 31c8-11 20-12 28-7-11 1-19 6-27 15M35 27C30 15 23 10 14 9c8 6 13 13 18 23M38 27C43 14 51 9 60 10c-9 5-15 12-20 22M36 24c-1-12 2-19 8-23 1 10-1 18-6 27M33 24C31 12 27 6 20 3c3 10 7 17 14 25"/></svg>
      </div>
      <span class="brand-divider"></span>
      <div class="brand-copy">
        <h1>AI Safa 2 Smart Park</h1>
        <p>Dubai, United Arab Emirates</p>
      </div>
    </div>

    <div class="header-meta">
      <div class="weather meta-block">
        <AppIcon name="sun" />
        <div><strong>34°C</strong><span>Sunny</span></div>
      </div>
      <span class="meta-divider"></span>
      <div class="clock meta-block">
        <div><strong>{{ currentTime }}</strong><span>{{ currentDate }}</span></div>
      </div>
      <span class="meta-divider"></span>
      <button class="icon-button notification" aria-label="Notifications">
        <AppIcon name="bell" /><span class="badge">2</span>
      </button>
      <button class="icon-button" aria-label="Open menu"><AppIcon name="menu" /></button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import AppIcon from "../ui/AppIcon.vue";

const now = ref(new Date());
const timer = window.setInterval(() => { now.value = new Date(); }, 30_000);
onBeforeUnmount(() => window.clearInterval(timer));

const currentTime = computed(() => now.value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
const currentDate = computed(() => now.value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
</script>

<style scoped>
.top-header{pointer-events:auto;position:absolute;z-index:20;inset:0 0 auto;height:108px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:rgba(255,255,255,.96);border:1px solid rgba(7,38,87,.11);border-radius:0 0 20px 20px;box-shadow:0 8px 28px rgba(14,26,43,.12);color:#072657;box-sizing:border-box}
.brand,.header-meta,.meta-block{display:flex;align-items:center}.brand{height:100%;gap:18px}.palm-mark{width:64px;height:70px;color:#c48a25}.palm-mark svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.brand-divider,.meta-divider{width:1px;background:rgba(7,38,87,.18)}.brand-divider{height:64px}.brand-copy h1{font-family:Georgia,"Times New Roman",serif;font-size:35px;line-height:1;margin:0 0 8px;font-weight:700;letter-spacing:-.8px}.brand-copy p{margin:0;font-size:16px;letter-spacing:.1px;color:#304d72}.header-meta{gap:22px;height:100%}.meta-block{gap:14px}.meta-block .app-icon{font-size:38px;color:#c58a20}.meta-block div{display:grid;gap:5px;text-align:left}.meta-block strong{font-size:17px;line-height:1;font-weight:750}.meta-block span{font-size:13px;color:#304d72}.clock div{text-align:center}.meta-divider{height:48px}.icon-button{position:relative;border:0;background:transparent;color:#082b63;font-size:27px;width:38px;height:42px;padding:7px;display:grid;place-items:center;border-radius:10px;cursor:pointer}.icon-button:hover,.icon-button:focus-visible{background:#eef3f8;outline:2px solid rgba(9,54,115,.28);outline-offset:1px}.badge{position:absolute;top:0;right:-2px;display:grid;place-items:center;min-width:17px;height:17px;padding:0 3px;border-radius:9px;background:#c98a1e;color:white;font-size:10px;font-weight:800;box-sizing:border-box}
@media(max-width:1100px){.top-header{height:88px;padding:0 18px}.palm-mark{width:48px;height:56px}.brand{gap:12px}.brand-divider{height:48px}.brand-copy h1{font-size:26px}.brand-copy p{font-size:13px}.header-meta{gap:11px}.meta-divider{display:none}.meta-block .app-icon{font-size:30px}.weather span,.clock span{display:none}}
@media(max-width:760px){.brand-copy h1{font-size:20px}.brand-copy p,.weather div,.clock{display:none}.palm-mark{width:40px}.brand-divider{display:none}.header-meta{gap:5px}}
</style>
