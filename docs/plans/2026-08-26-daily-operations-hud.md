# Daily Operations HUD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recreate the second reference image as a responsive Vue HUD over the existing interactive Cesium Dubai scene.

**Architecture:** Keep `CesiumScene` as the full-viewport base layer and render a pointer-safe HTML HUD above it. Store demo content in typed configuration objects so Daily Operations ships first while Event and Maintenance can reuse the same shell later. Keep future SketchUp/3D Tiles loading isolated in the GIS layer.

**Tech Stack:** Vue 3, TypeScript, Pinia, CSS, inline SVG icon components, CesiumJS.

---

### Task 1: Define the dashboard data model

**Files:**
- Create: `src/types/dashboard.ts`
- Create: `src/data/dailyOperations.ts`

**Steps:**
1. Define metric, system-status, recommendation, business-mode, and map-layer types.
2. Add the exact Daily Operations labels and values visible in reference image 2.
3. Export immutable typed data.
4. Run `npx vue-tsc --noEmit`; expect PASS.

### Task 2: Create reusable visual primitives

**Files:**
- Create: `src/components/ui/AppIcon.vue`
- Create: `src/components/ui/StatusDot.vue`
- Create: `src/components/ui/GlassPanel.vue`

**Steps:**
1. Implement an inline SVG icon registry to avoid external icon/network dependencies.
2. Implement accessible status indicators with text equivalents.
3. Implement the shared white panel surface, border, radius, and shadow.
4. Verify icons inherit color and panels do not intercept map input outside their bounds.

### Task 3: Build the top header

**Files:**
- Create: `src/components/dashboard/TopHeader.vue`

**Steps:**
1. Recreate the palm brand mark, divider, title, and Dubai subtitle.
2. Add weather, time/date, notification, and menu groups.
3. Add the compact responsive state for widths below 1100 px.
4. Verify keyboard focus and readable contrast.

### Task 4: Build the Daily Operations left panel

**Files:**
- Create: `src/components/dashboard/DailyOperationsPanel.vue`
- Create: `src/components/dashboard/MetricCard.vue`
- Create: `src/components/dashboard/SystemStatusRow.vue`

**Steps:**
1. Recreate the 2x2 metric grid.
2. Recreate the Live Operations status list and footer action.
3. Match typography, spacing, borders, status colors, and compact chart glyph.
4. Add collapse behavior to the panel header.

### Task 5: Build the AI recommendations panel

**Files:**
- Create: `src/components/dashboard/RecommendationsPanel.vue`
- Create: `src/components/dashboard/RecommendationCard.vue`

**Steps:**
1. Recreate the four recommendation cards from reference image 2.
2. Add icon colors, chevrons, vertical rhythm, and footer action.
3. Add a scroll-safe layout for short viewport heights.

### Task 6: Build bottom navigation and map controls

**Files:**
- Create: `src/components/dashboard/BusinessModeDock.vue`
- Create: `src/components/dashboard/MapLayerControl.vue`
- Create: `src/components/dashboard/MapTools.vue`
- Create: `src/stores/dashboard.ts`

**Steps:**
1. Implement Daily, Event, and Green & Maintenance mode items.
2. Make Daily Operations the selected navy item.
3. Implement Base, Facilities, and Utilities layer toggles.
4. Implement locate, 2D/3D, and compass controls with accessible tooltips.
5. Keep non-selected modes present but initially backed by placeholder state, ready for later screens.

### Task 7: Compose the HUD over Cesium

**Files:**
- Create: `src/components/dashboard/DashboardHud.vue`
- Modify: `src/App.vue`
- Modify: `src/styles.css`

**Steps:**
1. Keep Cesium absolute and full viewport.
2. Place the HUD in a higher stacking context with `pointer-events: none` on the shell and `pointer-events: auto` only on controls.
3. Add exact desktop offsets and responsive rules.
4. Add a restrained entrance animation respecting `prefers-reduced-motion`.
5. Verify left-drag map pan still works in uncovered map areas.

### Task 8: Add Daily Operations map overlays

**Files:**
- Create: `src/gis/dailyOperationsOverlay.ts`
- Modify: `src/gis/cesiumParkScene.ts`
- Modify: `src/components/CesiumScene.vue`

**Steps:**
1. Add demo POIs for visitor hotspot, security post, service hubs, water, and restroom.
2. Add a turquoise comfort-route polyline and translucent heat/hotspot ellipses.
3. Return overlay visibility controls in the scene handle.
4. Connect Base/Facilities/Utilities toggles to Cesium entities.
5. Preserve the future `tilesetUrl` integration point for the SU-derived 3D Tiles model.

### Task 9: Visual and interaction verification

**Files:**
- No production files unless fixes are required.

**Steps:**
1. Run `npm run build`; expect PASS.
2. Capture 1920x1080 and 1365x768 browser screenshots.
3. Compare layout proportions against reference image 2.
4. Test left-drag pan, right-drag rotate, wheel zoom, panel controls, and responsive overflow.
5. Check browser console for Vue, Cesium, asset, and Ion errors.

