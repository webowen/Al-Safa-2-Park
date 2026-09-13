export const cesiumConfig = {
  ionToken: import.meta.env.VITE_CESIUM_ION_TOKEN ?? "",
  ionServer: import.meta.env.VITE_CESIUM_ION_SERVER ?? "https://api.cesium.com",
  useRemoteTerrain: import.meta.env.VITE_USE_REMOTE_TERRAIN !== "false",
  park: {
    center: {
      // Authoritative center derived from the four park corner coordinates.
      lng: (55.220726298749305 + 55.22265459992857) / 2,
      lat: (25.154842832411614 + 25.156659648287633) / 2,
      height: 0,
    },
    bounds: {
      west: 55.220726298749305,
      south: 25.154842832411614,
      east: 55.22265459992857,
      north: 25.156659648287633,
    },
    startupCamera: {
      heading: 20,
      pitch: -55,
      // Start on the park itself instead of showing a wide regional view.
      range: 180,
    },
    tilesetAssetId: 5835399,
  },
};
