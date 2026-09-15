<template>
  <main class="explore-shell">
    <div class="explore-stage"><CesiumScene /></div>

    <header class="explore-header" aria-label="Park visitor view header">
      <div class="brand">
        <div class="palm-mark" aria-hidden="true">
          <svg viewBox="0 0 72 72"><path d="M35 67V30"/><path d="M34 33C25 22 14 22 7 27c10 0 18 4 25 12M37 31c8-11 20-12 28-7-11 1-19 6-27 15M35 27C30 15 23 10 14 9c8 6 13 13 18 23M38 27C43 14 51 9 60 10c-9 5-15 12-20 22M36 24c-1-12 2-19 8-23 1 10-1 18-6 27M33 24C31 12 27 6 20 3c3 10 7 17 14 25"/></svg>
        </div>
        <div class="brand-copy"><strong>AI Safa 2 Smart Park</strong><small>Dubai, United Arab Emirates</small></div>
      </div>
      <span class="live-pill"><i /> LIVE DEMO</span>
    </header>

    <section class="explore-intro" aria-labelledby="explore-heading">
      <span class="eyebrow">VISITOR VIEW / {{ modeLabel }}</span>
      <h1 id="explore-heading">{{ heading }}</h1>
      <p>{{ subheading }}</p>
    </section>

    <section class="summary-panel" aria-label="Live park summary">
      <div class="summary-heading"><span><AppIcon name="activity" /> Live park summary</span><em>DEMO DATA</em></div>
      <div class="summary-grid">
        <button v-for="item in summaryItems" :key="item.label" class="summary-item" :class="{ interactive: Boolean(item.focusId) }" type="button" @click="focus(item.focusId)">
          <AppIcon :name="item.icon" class="summary-icon" :class="`tone-${item.tone}`" />
          <span class="summary-copy"><strong>{{ item.value }}</strong><small>{{ item.label }}</small></span>
          <span class="summary-status"><StatusDot :tone="item.statusTone" />{{ item.status }}</span>
        </button>
      </div>
    </section>

    <nav class="mode-nav" aria-label="Park views">
      <button v-for="mode in modes" :key="mode.id" type="button" :class="{ active: store.activeMode === mode.id }" @click="selectMode(mode.id)">
        <AppIcon :name="mode.icon" class="mode-icon" /><span>{{ mode.short }}</span>
      </button>
    </nav>

    <button class="sheet-handle" type="button" :aria-expanded="sheetOpen" @click="sheetOpen = !sheetOpen">
      <span class="handle-line"></span><b>{{ sheetOpen ? "Hide AI insight" : "Explore live insight" }}</b><AppIcon name="chevron-up" :class="{ rotated: sheetOpen }" />
    </button>

    <aside class="insight-sheet" :class="{ open: sheetOpen }" aria-label="AI insight">
      <div class="sheet-top"><div><span class="eyebrow">AI PREVIEW</span><h2>{{ insight.title }}</h2></div><span class="confidence">{{ insight.confidence }}% demo confidence</span></div>
      <p>{{ insight.body }}</p>
      <div class="insight-stats"><div><strong>{{ insight.stat }}</strong><span>{{ insight.statLabel }}</span></div><div><strong>{{ insight.status }}</strong><span>system status</span></div></div>
      <button class="hint-button" type="button" @click="focus(insight.focusId)">View this zone <AppIcon name="arrow-right" /></button>
    </aside>

    <div class="touch-tip">Drag to orbit · Pinch to zoom · Tap a highlighted zone</div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import CesiumScene from "./CesiumScene.vue";
import AppIcon from "./ui/AppIcon.vue";
import StatusDot from "./ui/StatusDot.vue";
import { getDashboardModeConfig } from "../data/dashboardModes";
import { getLiveAsset, getLiveMetric } from "../data/dashboardLive";
import { useDashboardStore } from "../stores/dashboard";
import type { AccentTone, AssetHealthItem, DashboardModeId, MetricItem } from "../types/dashboard";

interface ExploreMode { id: DashboardModeId; short: string; icon: string; title: string; sub: string }
interface SummaryItem { label: string; value: string; icon: string; tone: AccentTone; status: string; statusTone: AccentTone; focusId?: string }

const store = useDashboardStore();
const sheetOpen = ref(false);
const modes: readonly ExploreMode[] = [
  { id: "daily", short: "Overview", icon: "activity", title: "Park Overview", sub: "A living view of Dubai's AI-powered public realm." },
  { id: "events", short: "Events", icon: "calendar", title: "Event Operations", sub: "See crowd flow, access and event readiness in real time." },
  { id: "maintenance", short: "Green + Care", icon: "leaf", title: "Green + Care", sub: "Explore landscape health, water and asset performance." },
];
const modeConfig = computed(() => getDashboardModeConfig(store.activeMode));
const activeMode = computed(() => modes.find((mode) => mode.id === store.activeMode) ?? modes[0]);
const modeLabel = computed(() => activeMode.value.short);
const heading = computed(() => activeMode.value.title);
const subheading = computed(() => activeMode.value.sub);

const summaryItems = computed<SummaryItem[]>(() => {
  const primary = modeConfig.value.primary;
  if (primary.kind === "operations") {
    return (primary.metrics ?? []).map((item: MetricItem) => {
      const live = getLiveMetric(item, store.liveTick);
      return { label: live.label, value: live.value, icon: live.icon, tone: live.tone, status: live.status, statusTone: live.statusTone, focusId: live.focusId };
    });
  }
  const preferred = ["Vegetation Health", "Irrigation Status", "Lighting Health", "Maintenance Tickets"];
  return (primary.assets ?? []).filter((item: AssetHealthItem) => preferred.includes(item.label)).map((item: AssetHealthItem) => {
    const live = getLiveAsset(item, store.liveTick);
    return { label: live.label, value: live.value, icon: live.icon, tone: live.tone, status: live.status, statusTone: live.tone, focusId: live.focusId };
  });
});

const insight = computed(() => {
  const recommendation = modeConfig.value.recommendations.items[0];
  const first = summaryItems.value[0];
  return { title: recommendation?.title ?? "Park signal ready", body: recommendation?.description ?? "The latest park signals are available in the visitor view.", confidence: store.activeMode === "daily" ? 94 : store.activeMode === "events" ? 91 : 88, stat: first?.value ?? "—", statLabel: first?.label.toLowerCase() ?? "live signal", status: first?.status ?? "Active", focusId: recommendation?.focusId ?? modeConfig.value.defaultFocusId };
});

function selectMode(mode: DashboardModeId) { store.activeMode = mode; sheetOpen.value = false; }
function focus(focusId?: string) { if (!focusId) return; store.sceneController?.focus(focusId); sheetOpen.value = false; }
</script>

<style scoped>
.explore-shell{position:relative;width:100vw;height:100dvh;overflow:hidden;background:#07100f;color:#f5f7f2;font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif}.explore-stage{position:absolute;inset:0}.explore-stage :deep(.cesium-scene),.explore-stage :deep(.cesium-host){height:100%;min-height:100%}.explore-stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,20,34,.52),transparent 32%,transparent 59%,rgba(5,20,34,.72))}.explore-header,.explore-intro,.summary-panel,.mode-nav,.sheet-handle,.insight-sheet,.touch-tip{position:absolute;z-index:8}.explore-header{top:0;left:0;right:0;min-height:76px;display:flex;justify-content:space-between;align-items:center;padding:12px 16px 11px calc(16px + env(safe-area-inset-left));padding-right:calc(16px + env(safe-area-inset-right));box-sizing:border-box;background:rgba(255,255,255,.95);border:1px solid rgba(7,38,87,.12);border-radius:0 0 18px 18px;box-shadow:0 8px 24px rgba(14,26,43,.18);color:#072657}.brand{display:flex;align-items:center;gap:10px;min-width:0}.palm-mark{width:40px;height:46px;flex:0 0 auto;color:#c48a25}.palm-mark svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.brand-copy{min-width:0}.brand-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:Georgia,"Times New Roman",serif;font-size:clamp(15px,4.6vw,23px);line-height:1.05;letter-spacing:-.2px}.brand-copy small{display:block;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#304d72;font-size:10px;letter-spacing:.02em}.live-pill{display:flex;align-items:center;gap:7px;flex:0 0 auto;color:#082b63;font-size:9px;font-weight:800;letter-spacing:.1em}.live-pill i{width:7px;height:7px;border-radius:50%;background:#269443;box-shadow:0 0 0 4px rgba(38,148,67,.14)}.explore-intro{top:90px;left:14px;right:14px;padding:14px 16px 15px;background:rgba(8,43,99,.9);border:1px solid rgba(255,255,255,.28);border-radius:15px;box-shadow:0 10px 26px rgba(7,25,49,.2)}.eyebrow{color:#c48a25;font-size:9px;letter-spacing:.15em;font-weight:800}.explore-intro h1{margin:6px 0 4px;color:#fff;font-family:Georgia,"Times New Roman",serif;font-size:clamp(24px,7vw,38px);line-height:1.03}.explore-intro p{max-width:390px;margin:0;color:#e1eaf3;font-size:11px;line-height:1.45}.summary-panel{top:195px;left:14px;right:14px;padding:0;background:rgba(255,255,255,.94);border:1px solid rgba(7,38,87,.14);border-radius:15px;box-shadow:0 12px 32px rgba(11,29,49,.2);color:#08285b;overflow:hidden}.summary-heading{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 13px;border-bottom:1px solid rgba(7,38,87,.11);font-size:11px;font-weight:800}.summary-heading>span{display:flex;align-items:center;gap:8px}.summary-heading .app-icon{font-size:16px;color:#c48a25}.summary-heading em{font-style:normal;color:#6a7a8f;font-size:8px;letter-spacing:.1em}.summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.summary-item{min-width:0;min-height:72px;display:grid;grid-template-columns:24px minmax(0,1fr);grid-template-rows:1fr auto;column-gap:8px;padding:10px 10px 9px;border:0;border-right:1px solid rgba(7,38,87,.1);border-bottom:1px solid rgba(7,38,87,.1);background:rgba(255,255,255,.55);color:#08285b;text-align:left}.summary-item:nth-child(2n){border-right:0}.summary-item:nth-last-child(-n+2){border-bottom:0}.summary-item.interactive{cursor:pointer}.summary-item.interactive:hover,.summary-item.interactive:focus-visible{background:#eef3f8;outline:none}.summary-icon{grid-row:1 / span 2;align-self:start;margin-top:2px;font-size:20px}.summary-copy{min-width:0;display:grid;align-content:start;gap:2px}.summary-copy strong{font-size:20px;line-height:1.1;overflow-wrap:anywhere}.summary-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#5b6e86;font-size:9px}.summary-status{grid-column:2;display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#365478;font-size:9px}.tone-gold{color:#c98517}.tone-blue{color:#2687ed}.tone-green{color:#2b913f}.tone-red{color:#d83b38}.tone-orange{color:#d18b16}.mode-nav{left:14px;right:14px;bottom:106px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding:5px;background:rgba(255,255,255,.94);border:1px solid rgba(7,38,87,.14);border-radius:15px;box-shadow:0 9px 24px rgba(11,29,49,.2)}.mode-nav button{min-height:51px;display:grid;place-items:center;gap:3px;border:0;border-radius:10px;background:transparent;color:#29496f;font-size:10px;font-weight:800}.mode-nav button.active{background:#082b63;color:#fff;box-shadow:0 4px 10px rgba(8,43,99,.23)}.mode-icon{font-size:17px;color:#c48a25}.mode-nav button.active .mode-icon{color:#f0bd54}.sheet-handle{left:14px;right:14px;bottom:57px;height:42px;display:flex;align-items:center;gap:10px;padding:0 13px;background:rgba(255,255,255,.96);border:1px solid rgba(7,38,87,.14);border-radius:13px;box-shadow:0 8px 22px rgba(11,29,49,.2);color:#08285b;text-align:left}.handle-line{width:22px;height:3px;flex:0 0 auto;background:#c48a25}.sheet-handle b{font-size:10px;letter-spacing:.05em}.sheet-handle>.app-icon{width:17px;height:17px;margin-left:auto;color:#c48a25;transition:transform .2s}.sheet-handle>.rotated{transform:rotate(180deg)}.insight-sheet{left:14px;right:14px;bottom:-290px;padding:17px 15px 15px;background:rgba(255,255,255,.98);border:1px solid rgba(7,38,87,.14);border-radius:15px;box-shadow:0 -12px 36px rgba(8,31,57,.26);color:#08285b;transition:bottom .28s ease}.insight-sheet.open{bottom:105px}.sheet-top{display:flex;justify-content:space-between;gap:12px}.sheet-top h2{margin:5px 0 0;font-family:Georgia,"Times New Roman",serif;font-size:18px;line-height:1.15}.confidence{color:#2b913f;font-size:9px;white-space:nowrap}.insight-sheet p{margin:12px 0;color:#536a84;font-size:11px;line-height:1.5}.insight-stats{display:flex;gap:28px;padding-top:11px;border-top:1px solid rgba(7,38,87,.12)}.insight-stats div{display:grid;gap:3px}.insight-stats strong{font-size:17px;line-height:1.1}.insight-stats span{color:#6b7c91;font-size:9px}.hint-button{display:inline-flex;align-items:center;gap:10px;margin-top:14px;padding:9px 12px;border:0;border-radius:7px;background:#c48a25;color:#fff;font-size:10px;font-weight:800}.hint-button .app-icon{width:14px;height:14px}.touch-tip{left:0;right:0;bottom:18px;text-align:center;color:#eef4f7;text-shadow:0 1px 4px rgba(0,0,0,.6);font-size:9px}@media (min-width:700px){.explore-header{min-height:88px;padding-left:34px;padding-right:34px}.palm-mark{width:50px;height:58px}.brand-copy strong{font-size:27px}.brand-copy small{font-size:12px}.live-pill{font-size:10px}.explore-intro{top:112px;left:34px;right:auto;width:350px}.summary-panel{top:250px;left:auto;right:34px;width:360px}.mode-nav,.sheet-handle{left:auto;right:34px;width:360px}.mode-nav{bottom:44px}.sheet-handle{bottom:150px}.insight-sheet{left:auto;right:34px;width:328px;bottom:44px}.insight-sheet.open{bottom:44px}.touch-tip{bottom:22px}}@media (max-width:380px){.brand-copy strong{font-size:14px}.brand-copy small{font-size:9px}.live-pill{font-size:8px}.explore-intro{top:86px}.summary-panel{top:188px}.summary-item{min-height:68px;padding:8px}.summary-copy strong{font-size:18px}.mode-nav{bottom:103px}.sheet-handle{bottom:55px}.insight-sheet.open{bottom:102px}}@media (max-height:700px) and (max-width:699px){.explore-intro{top:82px;padding-top:11px;padding-bottom:11px}.explore-intro h1{font-size:22px}.summary-panel{top:169px}.summary-heading{height:32px}.summary-item{min-height:61px;padding-top:7px;padding-bottom:7px}.mode-nav{bottom:94px}.sheet-handle{bottom:49px}.touch-tip{bottom:14px}.insight-sheet.open{bottom:93px}}
</style>
