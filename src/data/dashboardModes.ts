import type {
  AssetHealthItem,
  DashboardModeId,
  ModeDashboardConfig,
  ModeLegendRow,
  MetricItem,
  RecommendationItem,
  SystemStatusItem,
} from "../types/dashboard";

const dailyMetrics: readonly MetricItem[] = [
  { label: "Temperature", value: "28°C", icon: "temperature", tone: "gold", status: "Comfortable", statusTone: "green", focusId: "heat-response" },
  { label: "Visitors", value: "412", icon: "visitors", tone: "gold", status: "Moderate", statusTone: "blue", chart: true, focusId: "visitor-hotspot" },
  { label: "Park Status", value: "Normal", icon: "shield", tone: "gold", status: "All Systems OK", statusTone: "green", focusId: "park-core" },
  { label: "Open Issues", value: "2", icon: "warning", tone: "gold", status: "Requires Attention", statusTone: "red", focusId: "security-post" },
] as const;

const eventMetrics: readonly MetricItem[] = [
  { label: "Expected Attendance", value: "5,842", icon: "visitors", tone: "gold", status: "High", statusTone: "green", focusId: "crowd-core" },
  { label: "Peak Time", value: "5:30 PM", icon: "clock", tone: "gold", status: "Today", statusTone: "blue", focusId: "stage-core" },
  { label: "Access Status", value: "Open", icon: "shield", tone: "gold", status: "All Gates Active", statusTone: "green", focusId: "entry-flow" },
  { label: "Open Tasks", value: "12", icon: "clipboard", tone: "gold", status: "Requires Attention", statusTone: "red", focusId: "event-ops" },
] as const;

const maintenanceAssets: readonly AssetHealthItem[] = [
  {
    label: "Vegetation Health",
    value: "78%",
    status: "Healthy",
    icon: "leaf",
    tone: "green",
    detail: "Seasonal cover remains strong in the shaded core.",
    progress: 78,
    focusId: "vegetation-south",
    stats: [
      { label: "Healthy", value: "78%", tone: "green" },
      { label: "Attention", value: "16%", tone: "gold" },
      { label: "Needs Care", value: "6%", tone: "red" },
    ],
  },
  {
    label: "Irrigation Status",
    value: "92%",
    status: "Optimal",
    icon: "water",
    tone: "blue",
    detail: "Most zones are within target moisture levels.",
    progress: 92,
    focusId: "irrigation-west",
    stats: [
      { label: "Normal", value: "92%", tone: "green" },
      { label: "Attention", value: "6%", tone: "gold" },
      { label: "Off-line", value: "2%", tone: "red" },
    ],
  },
  {
    label: "Canopy Systems",
    value: "601",
    status: "Total Canopies",
    icon: "umbrella",
    tone: "gold",
    detail: "Shade structures remain intact across the promenade loop.",
    progress: 83,
    focusId: "canopy-east",
    stats: [
      { label: "Good", value: "535", tone: "green" },
      { label: "Attention", value: "48", tone: "gold" },
      { label: "Needs Care", value: "18", tone: "red" },
    ],
  },
  {
    label: "Lighting Health",
    value: "98%",
    status: "Operational",
    icon: "bulb",
    tone: "gold",
    detail: "Evening lighting circuits are mostly stable.",
    progress: 98,
    focusId: "lighting-rings",
    stats: [
      { label: "OK", value: "98%", tone: "green" },
      { label: "Faults", value: "2%", tone: "red" },
      { label: "Checks", value: "6", tone: "gold" },
    ],
  },
  {
    label: "Maintenance Tickets",
    value: "12",
    status: "Open",
    icon: "clipboard",
    tone: "orange",
    detail: "High-priority items are clustered near the south access road.",
    progress: 42,
    focusId: "maintenance-road",
    stats: [
      { label: "Open", value: "12", tone: "gold" },
      { label: "High Priority", value: "4", tone: "red" },
      { label: "In Progress", value: "28", tone: "blue" },
    ],
  },
  {
    label: "Asset Conditions",
    value: "87%",
    status: "Good",
    icon: "shield",
    tone: "green",
    detail: "General asset condition remains within the expected range.",
    progress: 87,
    focusId: "asset-core",
    stats: [
      { label: "Good", value: "87%", tone: "green" },
      { label: "Fair", value: "10%", tone: "gold" },
      { label: "Poor", value: "3%", tone: "red" },
    ],
  },
] as const;

const dailySystems: readonly SystemStatusItem[] = [
  { label: "Irrigation Systems", value: "Healthy", icon: "water", tone: "green" },
  { label: "Lighting Network", value: "98%", icon: "bulb", tone: "gold" },
  { label: "Waste Management", value: "On Schedule", icon: "waste", tone: "gray" },
  { label: "Security Status", value: "No Alerts", icon: "shield", tone: "gray" },
  { label: "Wi-Fi Network", value: "Connected", icon: "wifi", tone: "gold" },
] as const;

const eventSystems: readonly SystemStatusItem[] = [
  { label: "Entry Gates", value: "All Open", icon: "visitors", tone: "green" },
  { label: "Service Points", value: "Operational", icon: "clipboard", tone: "gold" },
  { label: "Lighting Readiness", value: "100%", icon: "bulb", tone: "gold" },
  { label: "Waste Readiness", value: "Ready", icon: "waste", tone: "gray" },
  { label: "Security Support", value: "Active", icon: "shield", tone: "gray" },
] as const;

const dailyRecommendations: readonly RecommendationItem[] = [
  { title: "Afternoon Heat Response", description: "Temps to reach 36°C at 2 PM. Increase shade & hydration messaging.", icon: "sun", tone: "gold", focusId: "heat-response" },
  { title: "Shaded Route Guidance", description: "Promote the Comfortable Route for optimal visitor experience.", icon: "tree", tone: "green", focusId: "shaded-route" },
  { title: "Hydration & Restrooms", description: "High activity expected. Ensure hydration stations & restrooms are well stocked.", icon: "water", tone: "blue", focusId: "hydration-station" },
  { title: "Family Peak Support", description: "Family traffic may turn up around 4-7 PM. Prepare restrooms & play areas.", icon: "visitors", tone: "blue", focusId: "family-entry" },
] as const;

const eventRecommendations: readonly RecommendationItem[] = [
  { title: "Family Weekend", description: "High family turnout expected. Focus on shaded seating, play areas & hydration.", icon: "visitors", tone: "blue", focusId: "crowd-core" },
  { title: "Entry Flow", description: "Spread arrivals across all gates. Open Gate 3 fully after 4:30 PM.", icon: "arrow-right", tone: "green", focusId: "entry-flow" },
  { title: "Night Activation", description: "Optimize lighting scenes from 6:30 PM and activate eco-mode after 11 PM.", icon: "sparkles", tone: "gold", focusId: "stage-lighting" },
  { title: "Crowd Safety", description: "Keep the central lawn loop clear and preserve emergency access around the stage.", icon: "shield", tone: "red", focusId: "security-post" },
] as const;

const maintenanceRecommendations: readonly RecommendationItem[] = [
  { title: "Irrigation Optimization", description: "Zone 3 & 5: Reduce run time by 15% to save ~12,000 L.", icon: "water", tone: "blue", focusId: "irrigation-west" },
  { title: "Inspection Priorities", description: "4 high-priority areas flagged for inspection today.", icon: "warning", tone: "gold", focusId: "inspection-priority" },
  { title: "Shaded Canopy Maintenance", description: "18 canopies require cleaning & fabric check.", icon: "umbrella", tone: "gold", focusId: "canopy-east" },
  { title: "Water Saving Suggestion", description: "Adjust mulch in Zones 6 & 7 to reduce evaporation.", icon: "leaf", tone: "green", focusId: "water-saving" },
  { title: "Turf Protection", description: "High footfall detected in Zone 2. Recommend aeration & rest.", icon: "tree", tone: "green", focusId: "turf-protection" },
  { title: "Scheduled Actions", description: "6 tasks due today. Next: irrigation audit - 11:30 AM.", icon: "calendar", tone: "gold", focusId: "maintenance-road" },
] as const;

const eventLegend: readonly ModeLegendRow[] = [
  {
    chips: [
      { label: "Entry Flow", icon: "visitors", tone: "blue" },
      { label: "Stage", icon: "sparkles", tone: "gold" },
      { label: "Crowd Zone", icon: "visitors", tone: "orange" },
      { label: "Security", icon: "shield", tone: "navy" },
    ],
  },
] as const;

const maintenanceLegend: readonly ModeLegendRow[] = [
  {
    chips: [
      { label: "Irrigation Zone", icon: "water", tone: "blue" },
      { label: "Healthy", icon: "leaf", tone: "green" },
      { label: "Attention", icon: "warning", tone: "gold" },
      { label: "Maintenance Needed", icon: "warning", tone: "red" },
    ],
  },
  {
    chips: [
      { label: "Vegetation", icon: "leaf", tone: "green" },
      { label: "Irrigation", icon: "water", tone: "blue" },
      { label: "Canopy", icon: "umbrella", tone: "gold" },
      { label: "Asset", icon: "shield", tone: "navy" },
      { label: "Maintenance", icon: "clipboard", tone: "orange" },
    ],
  },
] as const;

export const dashboardModeConfigs: Record<DashboardModeId, ModeDashboardConfig> = {
  daily: {
    primary: {
      kind: "operations",
      title: "Park Overview",
      subtitle: "Live park operations and day-of signals",
      headerIcon: "activity",
      footerLabel: "View all systems",
      statusLabel: "All Systems Active",
      statusTone: "green",
      metrics: dailyMetrics,
      systems: dailySystems,
    },
    recommendations: {
      title: "AI Today",
      subtitle: "Smart suggestions for today",
      footerLabel: "View all suggestions",
      items: dailyRecommendations,
    },
    defaultFocusId: "park-core",
  },
  events: {
    primary: {
      kind: "operations",
      title: "Event Operations",
      subtitle: "Live event readiness and crowd flow",
      headerIcon: "activity",
      footerLabel: "View all operations",
      statusLabel: "All Systems Active",
      statusTone: "green",
      metrics: eventMetrics,
      systems: eventSystems,
    },
    recommendations: {
      title: "AI Event Plan",
      subtitle: "Smart recommendations for today",
      footerLabel: "View full event plan",
      items: eventRecommendations,
    },
    legend: eventLegend,
    defaultFocusId: "event-ops",
  },
  maintenance: {
    primary: {
      kind: "assets",
      title: "Asset & Landscape Health",
      subtitle: "Detailed asset health and maintenance signals",
      headerIcon: "activity",
      footerLabel: "View all assets",
      assets: maintenanceAssets,
    },
    recommendations: {
      title: "AI Maintenance Actions",
      subtitle: "Recommendations for today",
      footerLabel: "View all recommendations",
      items: maintenanceRecommendations,
    },
    legend: maintenanceLegend,
    defaultFocusId: "asset-core",
  },
} as const;

export function getDashboardModeConfig(mode: DashboardModeId): ModeDashboardConfig {
  return dashboardModeConfigs[mode];
}
