export type AccentTone = "gold" | "navy" | "blue" | "green" | "red" | "orange" | "gray";
export type DashboardModeId = "daily" | "events" | "maintenance";
export type DashboardSceneView = "3D" | "2D";
export type MapLayerId = "base" | "facilities" | "utilities";

export interface MetricItem {
  label: string;
  value: string;
  icon: string;
  tone: AccentTone;
  status: string;
  statusTone: AccentTone;
  chart?: boolean;
  focusId?: string;
}

export interface SystemStatusItem {
  label: string;
  value: string;
  icon: string;
  tone: AccentTone;
}

export interface RecommendationItem {
  title: string;
  description: string;
  icon: string;
  tone: AccentTone;
  focusId?: string;
}

export interface BusinessModeItem {
  id: "daily" | "events" | "maintenance";
  title: string;
  description: string;
  icon: string;
  tone: AccentTone;
}

export interface MapLayerItem {
  id: MapLayerId;
  label: string;
  icon: string;
}

export interface ModeLegendChip {
  label: string;
  icon: string;
  tone: AccentTone;
}

export interface ModeLegendRow {
  chips: readonly ModeLegendChip[];
}

export interface AssetHealthStat {
  label: string;
  value: string;
  tone: AccentTone;
}

export interface AssetHealthItem {
  label: string;
  value: string;
  status: string;
  icon: string;
  tone: AccentTone;
  detail: string;
  stats: readonly AssetHealthStat[];
  progress: number;
  focusId?: string;
}

export interface ModePrimaryPanelConfig {
  kind: "operations" | "assets";
  title: string;
  subtitle: string;
  headerIcon: string;
  footerLabel: string;
  statusLabel?: string;
  statusTone?: AccentTone;
  metrics?: readonly MetricItem[];
  systems?: readonly SystemStatusItem[];
  assets?: readonly AssetHealthItem[];
}

export interface ModeRecommendationsConfig {
  title: string;
  subtitle: string;
  footerLabel: string;
  items: readonly RecommendationItem[];
}

export interface ModeDashboardConfig {
  primary: ModePrimaryPanelConfig;
  recommendations: ModeRecommendationsConfig;
  legend?: readonly ModeLegendRow[];
  defaultFocusId: string;
}

export interface DashboardSceneController {
  setMode: (mode: DashboardModeId) => void;
  setLayer: (layer: MapLayerId) => void;
  recenter: () => void;
  resetNorth: () => void;
  focus: (focusId: string) => void;
  setViewMode: (mode: DashboardSceneView) => void;
  toggleViewMode: () => void;
  setSimulationTime: (hour: number) => void;
  setClockMultiplier: (multiplier: number) => void;
  setClockAnimating: (isAnimating: boolean) => void;
  setRain: (enabled: boolean) => void;
  onSimulationTimeChange: (callback: (hour: number) => void) => () => void;
  onPoiSelect: (callback: (poi: { name: string; label: string }) => void) => () => void;
}
