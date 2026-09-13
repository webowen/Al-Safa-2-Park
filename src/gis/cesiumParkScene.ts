import {
  BoxEmitter,
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  ClockRange,
  Color,
  createWorldTerrainAsync,
  DynamicAtmosphereLightingType,
  EasingFunction,
  EllipsoidTerrainProvider,
  HeadingPitchRange,
  HeightReference,
  Ion,
  JulianDate,
  Math as CesiumMath,
  Matrix4,
  ParticleSystem,
  Rectangle,
  ShadowMode,
  TileMapServiceImageryProvider,
  type ImageryLayer,
  SceneMode,
  Transforms,
  type Entity,
  type TerrainProvider,
  UrlTemplateImageryProvider,
  Viewer,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium";

import { cesiumConfig } from "../config/cesium";
import type { DashboardModeId, DashboardSceneController, DashboardSceneView, MapLayerId } from "../types/dashboard";

const ESRI_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

type FocusTarget = {
  center: Cartesian3;
  heading: number;
  pitch: number;
  range: number;
  radius: number;
};

export type CesiumParkSceneHandle = DashboardSceneController & {
  destroy: () => void;
};

const MODE_DEFAULT_FOCUS: Record<DashboardModeId, string> = {
  daily: "park-core",
  events: "event-core",
  maintenance: "asset-core",
};

const PARK_MIN_ZOOM = 60;
const PARK_MAX_ZOOM = 5000;

function parkCartesian(lng: number, lat: number, height: number) {
  return Cartesian3.fromDegrees(lng, lat, height);
}

export async function createCesiumParkScene(container: HTMLElement): Promise<CesiumParkSceneHandle> {
  const { park } = cesiumConfig;
  let terrainProvider: TerrainProvider = new EllipsoidTerrainProvider();

  if (cesiumConfig.ionToken) Ion.defaultAccessToken = cesiumConfig.ionToken;

  const viewer = new Viewer(container, {
    animation: false,
    baseLayer: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    terrainProvider,
    // Daylight analysis must update the shadow map as the clock changes.
    shadows: true,
    targetFrameRate: 45,
    useBrowserRecommendedResolution: true,
    // The dashboard exposes a real 2D/3D toggle, so do not disable 2D
    // geometry at Viewer construction time.
    scene3DOnly: false,
    orderIndependentTranslucency: false,
    // The scene is static most of the time. Render on demand so the browser
    // does not spend a full frame budget while the dashboard is idle.
    requestRenderMode: true,
    maximumRenderTimeChange: 0.5,
    msaaSamples: 1,
    contextOptions: {
      webgl: {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      },
    },
  });

  const idleGlobeScreenSpaceError = 2;
  const idleTilesetScreenSpaceError = 10;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const isLowPowerDevice = (nav.deviceMemory !== undefined && nav.deviceMemory <= 4)
    || (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
  const performanceProfile = isLowPowerDevice
    ? { resolutionScale: 0.82, globeSse: 3.5, tilesetSse: 16, rainRate: 420 }
    : { resolutionScale: 1, globeSse: idleGlobeScreenSpaceError, tilesetSse: idleTilesetScreenSpaceError, rainRate: 850 };
  let parkTileset: Cesium3DTileset | null = null;
  let imageryLayer: ImageryLayer | undefined;
  viewer.resolutionScale = performanceProfile.resolutionScale;
  viewer.scene.backgroundColor = Color.fromCssColorString("#dfeef8");
  viewer.scene.globe.baseColor = Color.fromCssColorString("#7dc0d9");
  viewer.scene.globe.depthTestAgainstTerrain = !(terrainProvider instanceof EllipsoidTerrainProvider);
  viewer.scene.globe.maximumScreenSpaceError = performanceProfile.globeSse;
  // Keep Cesium's celestial lighting tied to `viewer.clock.currentTime`.
  // Without this, changing the daylight slider only updates application data
  // while the globe/atmosphere keep using a fixed, unlit appearance.
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.dynamicAtmosphereLighting = true;
  viewer.scene.globe.dynamicAtmosphereLightingFromSun = true;
  viewer.scene.globe.shadows = ShadowMode.RECEIVE_ONLY;
  viewer.scene.globe.showGroundAtmosphere = true;
  viewer.scene.atmosphere.dynamicLighting = DynamicAtmosphereLightingType.SUNLIGHT;
  viewer.scene.light.intensity = 2.0;
  if (viewer.scene.skyAtmosphere) {
    viewer.scene.skyAtmosphere.show = true;
    // Per-fragment scattering is a little more expensive, but it keeps the
    // near-ground view responsive to the sun at park scale instead of looking
    // like one static blue backdrop at every hour.
    viewer.scene.skyAtmosphere.perFragmentAtmosphere = true;
  }
  if (viewer.scene.sun) {
    viewer.scene.sun.show = true;
    viewer.scene.sun.glowFactor = 1.35;
  }
  viewer.scene.fog.enabled = false;
  viewer.scene.highDynamicRange = false;
  viewer.scene.postProcessStages.fxaa.enabled = false;
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = PARK_MIN_ZOOM;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = PARK_MAX_ZOOM;
  viewer.scene.screenSpaceCameraController.inertiaSpin = 0.04;
  viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.04;
  viewer.scene.screenSpaceCameraController.inertiaZoom = 0.05;
  viewer.scene.screenSpaceCameraController.enableTranslate = true;
  viewer.scene.screenSpaceCameraController.enableRotate = true;
  viewer.scene.screenSpaceCameraController.enableTilt = true;
  viewer.scene.screenSpaceCameraController.enableZoom = true;

  // Do not block first paint on remote terrain. Start with the lightweight
  // ellipsoid and upgrade in the background when the network/token allows it.
  if (cesiumConfig.ionToken && cesiumConfig.useRemoteTerrain) {
    void createWorldTerrainAsync({
      requestVertexNormals: false,
      requestWaterMask: false,
    }).then((remoteTerrain) => {
      if (viewer.isDestroyed()) return;
      terrainProvider = remoteTerrain;
      viewer.terrainProvider = remoteTerrain;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.requestRender();
    }).catch((ionError) => {
      console.warn("Cesium World Terrain unavailable; keeping ellipsoid terrain.", ionError);
    });
  }

  const simulationDayStart = getDubaiDayStart(new Date());
  const simulationDayStartJulian = JulianDate.fromDate(simulationDayStart);
  viewer.clock.startTime = JulianDate.clone(simulationDayStartJulian);
  viewer.clock.stopTime = JulianDate.addSeconds(simulationDayStartJulian, 24 * 60 * 60, new JulianDate());
  viewer.clock.currentTime = JulianDate.addHours(simulationDayStartJulian, 14, new JulianDate());
  viewer.clock.clockRange = ClockRange.LOOP_STOP;
  viewer.clock.multiplier = 120;
  viewer.clock.shouldAnimate = false;

  // Keep the sky, atmosphere and ground tone in the same simulation-time
  // pipeline as the sun/light direction. Cesium's sun position is derived
  // from clock.currentTime during render; these additional tone adjustments
  // make the transition visible at park-scale camera distances as well.
  const daySkyColor = Color.fromCssColorString("#dfeef8");
  const twilightSkyColor = Color.fromCssColorString("#d88963");
  const nightSkyColor = Color.fromCssColorString("#071426");
  const environmentColorScratch = new Color();
  function applyEnvironmentForTime(hour: number) {
    const normalizedHour = ((hour % 24) + 24) % 24;
    const sunElevation = Math.sin(((normalizedHour - 6) / 12) * Math.PI);
    // Keep a short twilight band around sunrise/sunset instead of snapping
    // directly from blue daylight to a black sky.
    const daylight = CesiumMath.clamp((sunElevation + 0.12) / 1.12, 0, 1);
    const twilight = CesiumMath.clamp(1 - Math.abs(sunElevation) / 0.32, 0, 1);
    const nightMix = 1 - daylight;
    let skyColor: Color;
    if (twilight > 0) {
      skyColor = Color.lerp(nightSkyColor, twilightSkyColor, twilight, environmentColorScratch);
      skyColor = Color.lerp(skyColor, daySkyColor, daylight, environmentColorScratch);
    } else {
      skyColor = Color.lerp(nightSkyColor, daySkyColor, daylight, environmentColorScratch);
    }
    viewer.scene.backgroundColor = skyColor;
    viewer.scene.atmosphere.brightnessShift = -0.58 + daylight * 0.58;
    viewer.scene.atmosphere.lightIntensity = 2.5 + daylight * 7.5;
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.brightnessShift = -0.7 + daylight * 0.7;
      viewer.scene.skyAtmosphere.saturationShift = 0.12 * nightMix;
      viewer.scene.skyAtmosphere.atmosphereLightIntensity = 18 + daylight * 32;
    }
    if (imageryLayer) {
      imageryLayer.brightness = 0.42 + daylight * 0.58;
      imageryLayer.contrast = 0.82 + daylight * 0.18;
      imageryLayer.saturation = 0.72 + daylight * 0.28;
    }
    if (viewer.scene.sun) {
      // A stronger glow around low solar elevations sells sunrise/sunset while
      // preserving a restrained midday sun.
      viewer.scene.sun.glowFactor = 1.1 + twilight * 0.65;
    }
    viewer.scene.requestRender();
  }
  applyEnvironmentForTime(14);

  viewer.camera.lookAt(
    Cartesian3.fromDegrees(park.center.lng, park.center.lat, 80),
    new HeadingPitchRange(
      CesiumMath.toRadians(park.startupCamera.heading),
      CesiumMath.toRadians(park.startupCamera.pitch),
      park.startupCamera.range,
    ),
  );
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
  viewer.scene.requestRender();

  viewer.camera.moveEnd.addEventListener(() => {
    if (!viewer.isDestroyed()) {
      viewer.resolutionScale = performanceProfile.resolutionScale;
      viewer.scene.globe.maximumScreenSpaceError = performanceProfile.globeSse;
      if (parkTileset) {
        parkTileset.maximumScreenSpaceError = performanceProfile.tilesetSse;
      }
      viewer.scene.requestRender();
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    viewer.resize();
    viewer.scene.requestRender();
  });
  resizeObserver.observe(container);

  try {
    // Use the direct tile endpoint first. The ArcGIS metadata endpoint can
    // resolve successfully while individual imagery tiles are unavailable,
    // which leaves Cesium rendering a black globe with no visible error.
    imageryLayer = viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: ESRI_IMAGERY_URL,
        minimumLevel: 2,
        maximumLevel: 19,
        credit: "Esri World Imagery",
      }),
    );
    imageryLayer.alpha = 0.95;
  } catch (error) {
    console.warn("Esri imagery could not be loaded; using bundled Cesium imagery.", error);
    const localImagery = await TileMapServiceImageryProvider.fromUrl(
      "/cesium/Assets/Textures/NaturalEarthII",
    );
    imageryLayer = viewer.imageryLayers.addImageryProvider(localImagery);
  }
  // The imagery layer is created after the initial clock setup. Re-apply the
  // current hour so the first rendered frame already has the correct day/night
  // tone instead of waiting for the user to move the slider.
  applyEnvironmentForTime(14);

  const modeEntities: Record<DashboardModeId, Entity[]> = {
    daily: [],
    events: [],
    maintenance: [],
  };
  let rainSystem: ParticleSystem | null = null;
  const rainImage =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="3" height="38" viewBox="0 0 3 38"><path d="M1.5 0v38" stroke="#d9f4ff" stroke-width="1.5" stroke-linecap="round" opacity=".78"/></svg>',
    );

  const focusTargets: Record<string, FocusTarget> = {
    "park-core": focusTarget(park.center.lng, park.center.lat, 22, 18, -58, 420, 120),
    "heat-response": focusTarget(park.center.lng + 0.0002, park.center.lat + 0.0001, 18, 12, -55, 260, 80),
    "visitor-hotspot": focusTarget(park.center.lng + 0.0002, park.center.lat + 0.0001, 18, 12, -55, 260, 80),
    "shaded-route": focusTarget(park.center.lng + 0.0001, park.center.lat + 0.00008, 18, 18, -55, 260, 80),
    "hydration-station": focusTarget(park.center.lng + 0.00025, park.center.lat + 0.00012, 18, 20, -55, 260, 80),
    "family-entry": focusTarget(park.center.lng - 0.00018, park.center.lat - 0.00012, 18, 8, -56, 260, 80),
    "security-post": focusTarget(park.center.lng - 0.00018, park.center.lat - 0.00012, 18, 8, -56, 260, 80),
    "event-core": focusTarget(park.center.lng + 0.00018, park.center.lat + 0.0001, 20, 8, -54, 260, 80),
    "crowd-core": focusTarget(park.center.lng + 0.00018, park.center.lat + 0.0001, 20, 8, -54, 260, 80),
    "stage-core": focusTarget(park.center.lng + 0.0002, park.center.lat + 0.0001, 20, 8, -54, 240, 80),
    "entry-flow": focusTarget(park.center.lng - 0.0001, park.center.lat - 0.0001, 18, 5, -56, 260, 80),
    "stage-lighting": focusTarget(park.center.lng + 0.0002, park.center.lat + 0.0001, 20, 8, -54, 240, 80),
    "event-ops": focusTarget(park.center.lng + 0.00018, park.center.lat + 0.0001, 20, 8, -54, 260, 80),
    "asset-core": focusTarget(park.center.lng + 0.00008, park.center.lat + 0.00005, 20, 18, -56, 280, 90),
    "vegetation-south": focusTarget(park.center.lng - 0.0001, park.center.lat + 0.00015, 18, 20, -55, 240, 80),
    "irrigation-west": focusTarget(park.center.lng - 0.00016, park.center.lat + 0.00004, 18, 20, -56, 240, 80),
    "canopy-east": focusTarget(park.center.lng + 0.0002, park.center.lat + 0.0001, 18, 20, -55, 240, 80),
    "lighting-rings": focusTarget(park.center.lng + 0.0001, park.center.lat - 0.00008, 18, 18, -55, 240, 80),
    "maintenance-road": focusTarget(park.center.lng + 0.00014, park.center.lat - 0.0001, 18, 12, -56, 260, 80),
    "inspection-priority": focusTarget(park.center.lng + 0.00018, park.center.lat + 0.00005, 18, 15, -55, 240, 80),
    "water-saving": focusTarget(park.center.lng + 0.00014, park.center.lat - 0.00006, 18, 18, -55, 240, 80),
    "turf-protection": focusTarget(park.center.lng + 0.00008, park.center.lat + 0.00008, 18, 18, -55, 240, 80),
  };

  function focusTarget(
    lng: number,
    lat: number,
    height: number,
    headingDegrees: number,
    pitchDegrees: number,
    range: number,
    radius: number,
  ): FocusTarget {
    return {
      center: parkCartesian(lng, lat, height),
      heading: CesiumMath.toRadians(headingDegrees),
      pitch: CesiumMath.toRadians(pitchDegrees),
      range,
      radius,
    };
  }

  function addModeEntity(mode: DashboardModeId, entity: Entity): Entity {
    modeEntities[mode].push(entity);
    return entity;
  }

  function makeColor(color: string, alpha = 1) {
    return Color.fromCssColorString(color).withAlpha(alpha);
  }

  function markerLabel(text: string, fill = "#ffffff", outline = "#092b5d") {
    return {
      text,
      fillColor: Color.fromCssColorString(fill),
      outlineColor: Color.fromCssColorString(outline),
      outlineWidth: 3,
      pixelOffset: new Cartesian2(0, -23),
      style: 2,
      font: "700 10px sans-serif",
    };
  }

  function bubbleLabel(text: string, fill = "#12283f") {
    return {
      text,
      fillColor: Color.fromCssColorString(fill),
      outlineColor: Color.fromCssColorString("#ffffff"),
      outlineWidth: 3,
      pixelOffset: new Cartesian2(0, -28),
      style: 2,
      font: "700 11px sans-serif",
    };
  }

  function addMarker(mode: DashboardModeId, name: string, lng: number, lat: number, color: string, text: string) {
    return addModeEntity(
      mode,
      viewer.entities.add({
        name,
        position: parkCartesian(lng, lat, 0),
        point: {
          pixelSize: 13,
          color: Color.fromCssColorString(color),
          outlineColor: Color.WHITE,
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_3D_TILE,
        },
        label: { ...markerLabel(text), heightReference: HeightReference.CLAMP_TO_3D_TILE },
      }),
    );
  }

  function addPointOnly(mode: DashboardModeId, name: string, lng: number, lat: number, color: string, labelText: string) {
    return addModeEntity(
      mode,
      viewer.entities.add({
        name,
        position: parkCartesian(lng, lat, 0),
        point: {
          pixelSize: 14,
          color: Color.fromCssColorString(color),
          outlineColor: Color.WHITE,
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_3D_TILE,
        },
        label: { ...bubbleLabel(labelText, "#102e5e"), heightReference: HeightReference.CLAMP_TO_3D_TILE },
      }),
    );
  }

  function addRoute(mode: DashboardModeId, name: string, positions: Cartesian3[], color: string, width = 5) {
    return addModeEntity(
      mode,
      viewer.entities.add({
        name,
        polyline: {
          positions,
          width,
          material: makeColor(color, 0.9),
          clampToGround: true,
        },
      }),
    );
  }

  function addEllipse(
    mode: DashboardModeId,
    name: string,
    lng: number,
    lat: number,
    semiMajorAxis: number,
    semiMinorAxis: number,
    fillColor: string,
    outlineColor: string,
    outlineAlpha = 0.75,
  ) {
    return addModeEntity(
      mode,
      viewer.entities.add({
        name,
        position: parkCartesian(lng, lat, 2),
        ellipse: {
          semiMajorAxis,
          semiMinorAxis,
          material: makeColor(fillColor, 0.22),
          outline: true,
          outlineColor: makeColor(outlineColor, outlineAlpha),
          height: 2,
        },
      }),
    );
  }

  function addDailyModeGeometry() {
    addRoute(
      "daily",
      "Comfortable Route",
      [
        parkCartesian(55.2210, 25.1551, 8),
        parkCartesian(55.2214, 25.1554, 8),
        parkCartesian(55.2218, 25.1558, 8),
        parkCartesian(55.2221, 25.1560, 8),
        parkCartesian(55.2224, 25.1557, 8),
      ],
      "#31d5a2",
      5,
    );
    addEllipse("daily", "Visitor Hotspot", 55.2218, 25.1558, 85, 60, "#7e64ed", "#8d77ff");
    addPointOnly("daily", "Service Hub North Gate", 55.2213, 25.1562, "#d28b16", "SERVICE");
    addPointOnly("daily", "Security Post Main Gate", 55.2211, 25.1551, "#2a85ea", "SECURITY");
    addPointOnly("daily", "Hydration Station", 55.2221, 25.1559, "#2585e9", "WATER");
  }

  function addEventModeGeometry() {
    addEllipse("events", "Event Core", 55.2218, 25.1558, 75, 52, "#d18b16", "#f1b54e");
    addRoute(
      "events",
      "Event Flow",
      [
        parkCartesian(55.2210, 25.1551, 10),
        parkCartesian(55.2213, 25.1554, 10),
        parkCartesian(55.2218, 25.1558, 10),
        parkCartesian(55.2221, 25.1560, 10),
        parkCartesian(55.2224, 25.1557, 10),
      ],
      "#4a8cff",
      5,
    );
    addPointOnly("events", "Main Stage", 55.2218, 25.1558, "#d18b16", "STAGE");
    addPointOnly("events", "Entry Gate", 55.2211, 25.1551, "#3a913f", "ENTRY");
    addPointOnly("events", "Security Support", 55.2221, 25.1560, "#2a85ea", "SECURITY");
    addPointOnly("events", "Service Point", 55.2210, 25.1554, "#8a54d6", "SERVICE");
  }

  function addMaintenanceModeGeometry() {
    addEllipse("maintenance", "Vegetation Health", 55.2212, 25.1560, 80, 55, "#3a913f", "#70c46f");
    addEllipse("maintenance", "Irrigation Status", 55.2219, 25.1558, 70, 48, "#2585e9", "#59a8ff");
    addEllipse("maintenance", "Canopy Systems", 55.2217, 25.1556, 65, 45, "#d18b16", "#f4be58");
    addEllipse("maintenance", "Maintenance Alerts", 55.2221, 25.1552, 60, 42, "#d83b38", "#f16a62");
    addRoute(
      "maintenance",
      "Inspection Loop",
      [
        parkCartesian(55.2210, 25.1560, 10),
        parkCartesian(55.2214, 25.1558, 10),
        parkCartesian(55.2217, 25.1556, 10),
        parkCartesian(55.2221, 25.1553, 10),
        parkCartesian(55.2224, 25.1551, 10),
      ],
      "#5b8ef0",
      4,
    );
    addPointOnly("maintenance", "Vegetation", 55.2211, 25.1560, "#3a913f", "VEGETATION");
    addPointOnly("maintenance", "Irrigation", 55.2219, 25.1558, "#2585e9", "IRRIGATION");
    addPointOnly("maintenance", "Canopy", 55.2217, 25.1556, "#d18b16", "CANOPY");
    addPointOnly("maintenance", "Asset", 55.2216, 25.1554, "#17376b", "ASSET");
    addPointOnly("maintenance", "Maintenance", 55.2222, 25.1552, "#d83b38", "ALERT");
  }

  addDailyModeGeometry();
  addEventModeGeometry();
  addMaintenanceModeGeometry();

  if (park.tilesetAssetId) {
    try {
      const tileset = await Cesium3DTileset.fromIonAssetId(park.tilesetAssetId, {
        maximumScreenSpaceError: performanceProfile.tilesetSse,
        show: true,
        skipLevelOfDetail: true,
        preferLeaves: false,
        preloadFlightDestinations: false,
        loadSiblings: false,
      });

      viewer.scene.primitives.add(tileset);
      parkTileset = tileset;
      tileset.shadows = ShadowMode.ENABLED;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = PARK_MAX_ZOOM;
      // Do not call viewer.flyTo(tileset) here. The tileset's own bounding
      // volume is not the park's geographic extent and would override the
      // configured park-centered camera, often placing the view inside the
      // model. Keep the camera anchored to the four-corner park coordinates.
      // Never derive the camera target from the tileset bounding sphere. Ion
      // assets can include surrounding context and their box center may sit
      // outside the park's authoritative four corners. The configured park
      // center remains the sole camera/focus anchor.
    } catch (error) {
      console.warn("Dubai park tiles not ready, continuing with terrain/globe view.", error);
    }
  } else {
    console.info("3D Tiles entry is enabled but disabled for now; waiting for a real Dubai park tileset asset id.");
  }

  let currentMode: DashboardModeId = "daily";
  let modeFocusTimer: number | undefined;
  let currentLayer: MapLayerId = "base";
  let currentViewMode: DashboardSceneView = "3D";
  let pendingViewModeFocus: DashboardSceneView | null = null;
  let pendingFocusId: string | null = null;
  const simulationTimeCallbacks = new Set<(hour: number) => void>();
  const poiCallbacks = new Set<(poi: { name: string; label: string }) => void>();
  const poiHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  poiHandler.setInputAction((movement: { position: Cartesian2 }) => {
    const picked = viewer.scene.pick(movement.position) as { id?: Entity } | undefined;
    const entity = picked?.id;
    if (!entity?.point) return;
    const label = entity.label?.text?.getValue(viewer.clock.currentTime) ?? entity.name ?? "POI";
    poiCallbacks.forEach((callback) => callback({ name: entity.name ?? "Park device", label }));
  }, ScreenSpaceEventType.LEFT_CLICK);

  function setVisibility(mode: DashboardModeId) {
    (Object.keys(modeEntities) as DashboardModeId[]).forEach((key) => {
      modeEntities[key].forEach((entity) => {
        entity.show = key === mode;
      });
    });
  }

  function flyToFocus(focusId: string, duration = 0.85) {
    if (viewer.scene.mode === SceneMode.MORPHING) {
      pendingFocusId = focusId;
      return;
    }
    const target = focusTargets[focusId] ?? focusTargets[MODE_DEFAULT_FOCUS[currentMode]];
    viewer.camera.cancelFlight();
    if (viewer.scene.mode === SceneMode.SCENE2D) {
      // Bounding-sphere offsets are perspective-oriented and can produce an
      // unexpected zoom/orientation in 2D. Set the authoritative park extent
      // directly after the projection morph, avoiding a second 2D flight that
      // can inherit an enormous world-scale frustum.
      viewer.camera.setView({
        destination: Rectangle.fromDegrees(
          park.bounds.west,
          park.bounds.south,
          park.bounds.east,
          park.bounds.north,
        ),
      });
      viewer.scene.requestRender();
      return;
    }
    viewer.camera.flyToBoundingSphere(new BoundingSphere(target.center, target.radius), {
      duration,
      easingFunction: EasingFunction.CUBIC_IN_OUT,
      offset: new HeadingPitchRange(target.heading, target.pitch, target.range),
    });
  }

  function applyMode(mode: DashboardModeId) {
    currentMode = mode;
    setVisibility(mode);
    // Let Vue commit the HUD state first, then start the camera flight on the
    // next task. This prevents panel remounts and Cesium animation from
    // competing for the same frame.
    if (modeFocusTimer !== undefined) window.clearTimeout(modeFocusTimer);
    modeFocusTimer = window.setTimeout(() => {
      modeFocusTimer = undefined;
      flyToFocus(MODE_DEFAULT_FOCUS[mode]);
    }, 120);
    viewer.scene.requestRender();
  }

  function applyLayer(layer: MapLayerId) {
    currentLayer = layer;
    const layerStyles: Record<MapLayerId, { alpha: number; baseColor: string }> = {
      base: { alpha: 0.95, baseColor: "#7dc0d9" },
      facilities: { alpha: 0.89, baseColor: "#dce7ee" },
      utilities: { alpha: 0.84, baseColor: "#d8efe1" },
    };
    const layerStyle = layerStyles[layer];
    if (imageryLayer) imageryLayer.alpha = layerStyle.alpha;
    viewer.scene.globe.baseColor = Color.fromCssColorString(layerStyle.baseColor);
    viewer.scene.requestRender();
  }

  function setViewMode(mode: DashboardSceneView) {
    currentViewMode = mode;
    pendingViewModeFocus = mode;
    pendingFocusId = MODE_DEFAULT_FOCUS[currentMode];
    viewer.camera.cancelFlight();
    // A second click while morphing should not leave the transitioner and
    // camera fighting each other. Finish the previous transition first, then
    // start the requested one and focus the park from morphComplete.
    if (viewer.scene.mode === SceneMode.MORPHING) {
      viewer.scene.completeMorph();
    }
    const targetSceneMode = mode === "2D" ? SceneMode.SCENE2D : SceneMode.SCENE3D;
    if (viewer.scene.mode !== targetSceneMode) {
      if (mode === "2D") {
        viewer.scene.morphTo2D(0.8);
      } else {
        viewer.scene.morphTo3D(0.8);
      }
    } else {
      pendingViewModeFocus = null;
      pendingFocusId = null;
    }
    viewer.scene.requestRender();
  }

  const restoreParkFocusAfterMorph = () => {
    const completedViewMode: DashboardSceneView = viewer.scene.mode === SceneMode.SCENE2D ? "2D" : "3D";
    if (pendingViewModeFocus !== null && completedViewMode !== pendingViewModeFocus) return;
    const focusId = pendingFocusId ?? MODE_DEFAULT_FOCUS[currentMode];
    pendingViewModeFocus = null;
    pendingFocusId = null;
    // Defer one frame so Cesium has committed the new map projection before
    // calculating the destination. This prevents the old frustum from
    // contaminating the first camera flight after a morph.
    window.requestAnimationFrame(() => {
      if (!viewer.isDestroyed()) flyToFocus(focusId, 0.65);
    });
  };
  viewer.scene.morphComplete.addEventListener(restoreParkFocusAfterMorph);

  function toggleViewMode() {
    setViewMode(currentViewMode === "3D" ? "2D" : "3D");
  }

  function recenter() {
    flyToFocus(MODE_DEFAULT_FOCUS[currentMode]);
  }

  function resetNorth() {
    const target = focusTargets[MODE_DEFAULT_FOCUS[currentMode]];
    viewer.camera.cancelFlight();
    if (viewer.scene.mode === SceneMode.SCENE2D) {
      viewer.camera.setView({
        destination: Rectangle.fromDegrees(
          park.bounds.west,
          park.bounds.south,
          park.bounds.east,
          park.bounds.north,
        ),
      });
      viewer.scene.requestRender();
      return;
    }
    viewer.camera.flyToBoundingSphere(new BoundingSphere(target.center, target.radius), {
      duration: 0.75,
      easingFunction: EasingFunction.CUBIC_IN_OUT,
      offset: new HeadingPitchRange(0, target.pitch, target.range),
    });
  }

  function getDubaiDayStart(now: Date): Date {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dubai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return new Date(`${values.year}-${values.month}-${values.day}T00:00:00+04:00`);
  }

  function setSimulationTime(hour: number) {
    const clampedHour = CesiumMath.clamp(hour, 0, 23.98);
    viewer.clock.currentTime = JulianDate.addSeconds(
      simulationDayStartJulian,
      clampedHour * 60 * 60,
      new JulianDate(),
    );
    applyEnvironmentForTime(clampedHour);
    viewer.scene.requestRender();
  }

  function setClockMultiplier(multiplier: number) {
    viewer.clock.multiplier = Math.max(0, multiplier);
  }

  function setClockAnimating(isAnimating: boolean) {
    viewer.clock.shouldAnimate = isAnimating;
    viewer.scene.requestRender();
  }

  const notifySimulationTimeChange = () => {
    const elapsedSeconds = JulianDate.secondsDifference(viewer.clock.currentTime, simulationDayStartJulian);
    const hour = (((elapsedSeconds / 3600) % 24) + 24) % 24;
    if (viewer.clock.shouldAnimate && Math.abs(hour - lastEnvironmentHour) >= 0.01) {
      lastEnvironmentHour = hour;
      applyEnvironmentForTime(hour);
    }
    const now = performance.now();
    if (now - lastSimulationNotify < 500) return;
    if (Math.abs(hour - lastSimulationHour) < 0.02) return;
    lastSimulationNotify = now;
    lastSimulationHour = hour;
    simulationTimeCallbacks.forEach((callback) => callback(hour));
  };

  let lastSimulationNotify = 0;
  let lastSimulationHour = -1;
  let lastEnvironmentHour = 14;

  viewer.clock.onTick.addEventListener(notifySimulationTimeChange);

  function createRainSystem() {
    const center = Cartesian3.fromDegrees(park.center.lng, park.center.lat, 1500);
    const downDirection = Cartesian3.normalize(
      Cartesian3.negate(center, new Cartesian3()),
      new Cartesian3(),
    );
    const rain = new ParticleSystem({
      modelMatrix: Transforms.eastNorthUpToFixedFrame(center),
      emitter: new BoxEmitter(new Cartesian3(24000, 24000, 2200)),
      emissionRate: performanceProfile.rainRate,
      minimumParticleLife: 2.4,
      maximumParticleLife: 4.2,
      minimumSpeed: 75,
      maximumSpeed: 125,
      image: rainImage,
      imageSize: new Cartesian2(3, 38),
      minimumImageSize: new Cartesian2(2, 26),
      maximumImageSize: new Cartesian2(4, 46),
      startColor: Color.fromCssColorString("#e6f7ff").withAlpha(0.5),
      endColor: Color.fromCssColorString("#b9e7f7").withAlpha(0.05),
      startScale: 0.9,
      endScale: 0.72,
      updateCallback: (particle) => {
        Cartesian3.multiplyByScalar(downDirection, 105, particle.velocity);
      },
    });
    rain.show = true;
    viewer.scene.primitives.add(rain);
    rainSystem = rain;
  }

  function setRain(enabled: boolean) {
    if (enabled && !rainSystem) {
      createRainSystem();
    }
    if (rainSystem) {
      rainSystem.show = enabled;
    }
    viewer.scene.requestRender();
  }

  setVisibility(currentMode);
  applyLayer(currentLayer);
  setViewMode(currentViewMode);

  return {
    destroy: () => {
      if (modeFocusTimer !== undefined) window.clearTimeout(modeFocusTimer);
      resizeObserver.disconnect();
      viewer.clock.onTick.removeEventListener(notifySimulationTimeChange);
      viewer.scene.morphComplete.removeEventListener(restoreParkFocusAfterMorph);
      poiHandler.destroy();
      rainSystem = null;
      viewer.destroy();
    },
    setMode: applyMode,
    setLayer: applyLayer,
    focus: flyToFocus,
    recenter,
    resetNorth,
    setViewMode,
    toggleViewMode,
    setSimulationTime,
    setClockMultiplier,
    setClockAnimating,
    setRain,
    onSimulationTimeChange: (callback) => {
      simulationTimeCallbacks.add(callback);
      return () => simulationTimeCallbacks.delete(callback);
    },
    onPoiSelect: (callback) => {
      poiCallbacks.add(callback);
      return () => poiCallbacks.delete(callback);
    },
  };
}
