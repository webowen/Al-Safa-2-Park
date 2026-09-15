import type { AssetHealthItem, AssetHealthStat, MetricItem, SystemStatusItem } from "../types/dashboard";

export function liveWobble(seed: string, amount: number, tick: number): number {
  return Math.round((Math.sin(tick * 1.7 + seed.length * 3.1) * 0.5 + 0.5) * amount);
}

export function getLiveMetric(item: MetricItem, tick: number): MetricItem {
  if (item.label === "Temperature") return { ...item, value: `${27 + liveWobble(item.label, 5, tick)}\u00b0C` };
  if (item.label.includes("Visitors")) {
    return { ...item, value: (390 + liveWobble(item.label, 100, tick)).toLocaleString() };
  }
  if (item.label === "Open Issues") {
    return { ...item, value: String(2 + liveWobble(item.label, 3, tick)) };
  }
  return item;
}

export function getLiveSystem(item: SystemStatusItem, tick: number): SystemStatusItem {
  if (item.label.includes("Lighting")) {
    return { ...item, value: `${96 + liveWobble(item.label, 4, tick)}%` };
  }
  return item;
}

export function getLiveAsset(item: AssetHealthItem, tick: number): AssetHealthItem {
  if (!item.value.includes("%")) return item;
  const progress = Math.max(1, Math.min(99, item.progress + liveWobble(item.label, 3, tick) - 1));
  const stats: AssetHealthStat[] = item.stats.map((stat, index) => (
    index === 0 ? { ...stat, value: `${progress}%` } : stat
  ));
  return { ...item, value: `${progress}%`, progress, stats };
}
