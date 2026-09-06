import {
  ArcGisMapServerImageryProvider,
  BoxEmitter,
  BoundingSphere,
  CameraEventType,
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  ClockRange,
  Color,
  createWorldTerrainAsync,
  EasingFunction,
  EllipsoidTerrainProvider,
  HeadingPitchRange,
  Ion,
  JulianDate,
  Math as CesiumMath,
  Matrix4,
  ParticleSystem,
  type ImageryLayer,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  ShadowMode,
  Transforms,
  type Entity,
  type TerrainProvider,
  UrlTemplateImageryProvider,
  Viewer,
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

const PARK_CENTER_LNG = 55.2217211268577;
const PARK_CENTER_LAT = 25.1557512418444;
const PARK_MIN_ZOOM = 60;
const PARK_MAX_ZOOM = 1100;

function parkCartesian(lng: number, lat: number, height: number) {
  return Cartesian3.fromDegrees(lng, lat, height);
}

export async function createCesiumParkScene(container: HTMLElement): Promise<CesiumParkSceneHandle> {
  const { park } = cesiumConfig;
  let terrainProvider: TerrainProvider = new EllipsoidTerrainProvider();

  if (cesiumConfig.ionToken) Ion.defaultAccessToken = cesiumConfig.ionToken;

  if (cesiumConfig.ionToken && cesiumConfig.useRemoteTerrain) {
    try {
      terrainProvider = await createWorldTerrainAsync({
        requestVertexNormals: true,
        requestWaterMask: true,
      });
    } catch (ionError) {
      console.warn("Cesium World Terrain could not be loaded; using ellipsoid terrain.", ionError);
    }
  }

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
    shadows: true,
    terrainShadows: ShadowMode.RECEIVE_ONLY,
    targetFrameRate: 45,
    useBrowserRecommendedResolution: true,
    scene3DOnly: true,
    orderIndependentTranslucency: false,
    requestRenderMode: false,
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

  const idleResolutionScale = 1;
  const interactionResolutionScale = 0.9;
  viewer.resolutionScale = idleResolutionScale;
  viewer.scene.backgroundColor = Color.fromCssColorString("#dfeef8");
  viewer.scene.globe.baseColor = Color.fromCssColorString("#7dc0d9");
  viewer.scene.globe.depthTestAgainstTerrain = !(terrainProvider instanceof EllipsoidTerrainProvider);
  viewer.scene.globe.maximumScreenSpaceError = 2;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.shadows = ShadowMode.RECEIVE_ONLY;
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
  viewer.scene.screenSpaceCameraController.translateEventTypes = [];
  viewer.scene.screenSpaceCameraController.rotateEventTypes = CameraEventType.RIGHT_DRAG;
  viewer.scene.screenSpaceCameraController.tiltEventTypes = CameraEventType.MIDDLE_DRAG;
  viewer.scene.screenSpaceCameraController.zoomEventTypes = [CameraEventType.WHEEL, CameraEventType.PINCH];

  const simulationDayStart = getDubaiDayStart(new Date());
  const simulationDayStartJulian = JulianDate.fromDate(simulationDayStart);
  viewer.clock.startTime = JulianDate.clone(simulationDayStartJulian);
  viewer.clock.stopTime = JulianDate.addSeconds(simulationDayStartJulian, 24 * 60 * 60, new JulianDate());
  viewer.clock.currentTime = JulianDate.addHours(simulationDayStartJulian, 14, new JulianDate());
  viewer.clock.clockRange = ClockRange.LOOP_STOP;
  viewer.clock.multiplier = 120;
  viewer.clock.shouldAnimate = false;

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

  viewer.camera.moveStart.addEventListener(() => {
    viewer.resolutionScale = interactionResolutionScale;
  });

  viewer.camera.moveEnd.addEventListener(() => {
    if (!viewer.isDestroyed()) {
      viewer.resolutionScale = idleResolutionScale;
      clampCameraToPark();
      viewer.scene.requestRender();
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    viewer.resize();
    viewer.scene.requestRender();
  });
  resizeObserver.observe(container);

  let imageryLayer: ImageryLayer;
  try {
    const esriImagery = await ArcGisMapServerImageryProvider.fromUrl(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      { enablePickFeatures: false },
    );
    imageryLayer = viewer.imageryLayers.addImageryProvider(esriImagery);
    imageryLayer.alpha = 0.95;
  } catch (error) {
    console.warn("Esri imagery metadata could not be loaded; using direct tiles.", error);
    imageryLayer = viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: ESRI_IMAGERY_URL,
        minimumLevel: 2,
        maximumLevel: 19,
        credit: "Esri World Imagery",
      }),
    );
    imageryLayer.alpha = 0.9;
  }

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
        position: parkCartesian(lng, lat, 15),
        point: {
          pixelSize: 13,
          color: Color.fromCssColorString(color),
          outlineColor: Color.WHITE,
          outlineWidth: 3,
        },
        label: markerLabel(text),
      }),
    );
  }

  function addPointOnly(mode: DashboardModeId, name: string, lng: number, lat: number, color: string, labelText: string) {
    return addModeEntity(
      mode,
      viewer.entities.add({
        name,
        position: parkCartesian(lng, lat, 12),
        point: {
          pixelSize: 14,
          color: Color.fromCssColorString(color),
          outlineColor: Color.WHITE,
          outlineWidth: 3,
        },
        label: bubbleLabel(labelText, "#102e5e"),
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

  function clampCameraToPark() {
    const cartographic = viewer.camera.positionCartographic;
    const lon = CesiumMath.clamp(
      CesiumMath.toDegrees(cartographic.longitude),
      55.220726298749305,
      55.22265459992857,
    );
    const lat = CesiumMath.clamp(
      CesiumMath.toDegrees(cartographic.latitude),
      25.154842832411614,
      25.156659648287633,
    );
    const height = CesiumMath.clamp(cartographic.height, 40, 900);
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: viewer.camera.heading,
        pitch: CesiumMath.clamp(viewer.camera.pitch, CesiumMath.toRadians(-78), CesiumMath.toRadians(-35)),
        roll: 0,
      },
    });
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

  const panHandler = new ScreenSpaceEventHandler(viewer.canvas);
  const panDelta = new Cartesian3();
  let panAnchor: Cartesian3 | undefined;

  const pickPanSurface = (position: Cartesian2) => {
    const ray = viewer.camera.getPickRay(position);
    return (
      (ray ? viewer.scene.globe.pick(ray, viewer.scene) : undefined) ??
      viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid)
    );
  };

  panHandler.setInputAction((movement: { position: Cartesian2 }) => {
    panAnchor = pickPanSurface(movement.position);
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.canvas.style.cursor = panAnchor ? "grabbing" : "default";
  }, ScreenSpaceEventType.LEFT_DOWN);

  panHandler.setInputAction((movement: { endPosition: Cartesian2 }) => {
    if (!panAnchor) return;

    const groundPosition = pickPanSurface(movement.endPosition);
    if (!groundPosition) return;

    Cartesian3.subtract(panAnchor, groundPosition, panDelta);
    Cartesian3.add(viewer.camera.position, panDelta, viewer.camera.position);
    panAnchor = pickPanSurface(movement.endPosition);
  }, ScreenSpaceEventType.MOUSE_MOVE);

  const endPan = () => {
    panAnchor = undefined;
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.canvas.style.cursor = "grab";
  };
  panHandler.setInputAction(endPan, ScreenSpaceEventType.LEFT_UP);
  viewer.canvas.style.cursor = "grab";

  if (park.tilesetAssetId) {
    try {
      const tileset = await Cesium3DTileset.fromIonAssetId(park.tilesetAssetId, {
        maximumScreenSpaceError: 8,
        show: true,
        skipLevelOfDetail: true,
        preferLeaves: true,
        loadSiblings: true,
      });

      viewer.scene.primitives.add(tileset);
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = Math.min(
        Math.max(park.startupCamera.range * 2.4, tileset.boundingSphere.radius * 1.8),
        PARK_MAX_ZOOM,
      );
      viewer.flyTo(tileset, {
        duration: 2.2,
        offset: {
          heading: CesiumMath.toRadians(park.startupCamera.heading),
          pitch: CesiumMath.toRadians(park.startupCamera.pitch),
          range: Math.max(park.startupCamera.range, tileset.boundingSphere.radius * 2.8),
        },
      });
    } catch (error) {
      console.warn("Dubai park tiles not ready, continuing with terrain/globe view.", error);
    }
  } else {
    console.info("3D Tiles entry is enabled but disabled for now; waiting for a real Dubai park tileset asset id.");
  }

  let currentMode: DashboardModeId = "daily";
  let currentLayer: MapLayerId = "base";
  let currentViewMode: DashboardSceneView = "3D";
  const simulationTimeCallbacks = new Set<(hour: number) => void>();

  function setVisibility(mode: DashboardModeId) {
    (Object.keys(modeEntities) as DashboardModeId[]).forEach((key) => {
      modeEntities[key].forEach((entity) => {
        entity.show = key === mode;
      });
    });
  }

  function flyToFocus(focusId: string) {
    const target = focusTargets[focusId] ?? focusTargets[MODE_DEFAULT_FOCUS[currentMode]];
    viewer.camera.flyToBoundingSphere(new BoundingSphere(target.center, target.radius), {
      duration: 0.85,
      easingFunction: EasingFunction.CUBIC_IN_OUT,
      offset: new HeadingPitchRange(target.heading, target.pitch, target.range),
    });
  }

  function applyMode(mode: DashboardModeId) {
    currentMode = mode;
    setVisibility(mode);
    flyToFocus(MODE_DEFAULT_FOCUS[mode]);
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
    imageryLayer.alpha = layerStyle.alpha;
    viewer.scene.globe.baseColor = Color.fromCssColorString(layerStyle.baseColor);
    viewer.scene.requestRender();
  }

  function setViewMode(mode: DashboardSceneView) {
    currentViewMode = mode;
    if (mode === "2D") {
      if (viewer.scene.mode !== SceneMode.SCENE2D) {
        viewer.scene.morphTo2D(0.8);
      }
    } else if (viewer.scene.mode !== SceneMode.SCENE3D) {
      viewer.scene.morphTo3D(0.8);
    }
    viewer.scene.requestRender();
  }

  function toggleViewMode() {
    setViewMode(currentViewMode === "3D" ? "2D" : "3D");
  }

  function recenter() {
    flyToFocus(MODE_DEFAULT_FOCUS[currentMode]);
  }

  function resetNorth() {
    const target = focusTargets[MODE_DEFAULT_FOCUS[currentMode]];
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
    simulationTimeCallbacks.forEach((callback) => callback(hour));
  };

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
      emissionRate: 850,
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

  applyMode(currentMode);
  applyLayer(currentLayer);
  setViewMode(currentViewMode);

  return {
    destroy: () => {
      panHandler.destroy();
      resizeObserver.disconnect();
      viewer.clock.onTick.removeEventListener(notifySimulationTimeChange);
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
  };
}
