import type {
  BusinessModeItem,
  MapLayerItem,
  MetricItem,
  RecommendationItem,
  SystemStatusItem,
} from "../types/dashboard";

export const dailyMetrics: readonly MetricItem[] = [
  { label: "Temperature", value: "28°C", icon: "temperature", tone: "gold", status: "Comfortable", statusTone: "green" },
  { label: "Visitors", value: "412", icon: "visitors", tone: "gold", status: "Moderate", statusTone: "blue", chart: true },
  { label: "Park Status", value: "Normal", icon: "shield", tone: "gold", status: "All Systems OK", statusTone: "green" },
  { label: "Open Issues", value: "2", icon: "warning", tone: "gold", status: "Requires Attention", statusTone: "red" },
] as const;

export const liveSystems: readonly SystemStatusItem[] = [
  { label: "Irrigation Systems", value: "Healthy", icon: "water", tone: "green" },
  { label: "Lighting Network", value: "98%", icon: "bulb", tone: "gold" },
  { label: "Waste Management", value: "On Schedule", icon: "waste", tone: "gray" },
  { label: "Security Status", value: "No Alerts", icon: "shield", tone: "gray" },
  { label: "Wi-Fi Network", value: "Connected", icon: "wifi", tone: "gold" },
] as const;

export const dailyRecommendations: readonly RecommendationItem[] = [
  { title: "Afternoon Heat Response", description: "Temps to reach 36°C at 2 PM. Increase shade & hydration messaging.", icon: "sun", tone: "gold" },
  { title: "Shaded Route Guidance", description: "Promote the Comfortable Route for optimal visitor experience.", icon: "tree", tone: "green" },
  { title: "Hydration & Restrooms", description: "High activity expected. Ensure hydration stations & restrooms are well stocked.", icon: "water", tone: "blue" },
  { title: "Family Peak Support", description: "Family traffic may turn up around 4–7 PM. Prepare restrooms & play areas.", icon: "visitors", tone: "blue" },
] as const;

export const businessModes: readonly BusinessModeItem[] = [
  { id: "daily", title: "Daily Operations", description: "Monitor park activities and daily status", icon: "clipboard", tone: "gold" },
  { id: "events", title: "Event Operations", description: "Manage events and special activities", icon: "calendar", tone: "gold" },
  { id: "maintenance", title: "Green & Maintenance", description: "Oversee assets and maintenance tasks", icon: "leaf", tone: "green" },
] as const;

export const mapLayers: readonly MapLayerItem[] = [
  { id: "base", label: "Base", icon: "layers" },
  { id: "facilities", label: "Facilities", icon: "building" },
  { id: "utilities", label: "Utilities", icon: "utility" },
] as const;

