import {
  Viewer,
  Ion,
  IonResource,
  IonImageryProvider,
  EllipsoidTerrainProvider,
} from "https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Cesium.js";

let viewer;

function initCesium(token, assetId) {
  Ion.defaultAccessToken = token;

  viewer = new Viewer("cesiumContainer", {
    terrainProvider: new EllipsoidTerrainProvider(),
    imageryProvider: new IonImageryProvider({ assetId: Number(assetId) }),
    shouldAnimate: true,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    timeline: false,
    animation: false,
  });

  viewer.scene.globe.enableLighting = true;
  viewer.scene.backgroundColor = Cesium.Color.BLACK;
}

function saveSettings() {
  const token = document.getElementById("accessToken").value.trim();
  const assetId = document.getElementById("assetId").value.trim();

  if (token && assetId) {
    localStorage.setItem("cesiumToken", token);
    localStorage.setItem("cesiumAssetId", assetId);
    location.reload();
  } else {
    alert("Пожалуйста, введите Access Token и Asset ID.");
  }
}

document.getElementById("enterAR").addEventListener("click", async () => {
  if (navigator.xr) {
    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    if (isSupported) {
      alert("WebXR AR-сессия успешно запущена!");
    } else {
      alert("Ваше устройство не поддерживает WebXR AR.");
    }
  } else {
    alert("WebXR не поддерживается этим браузером.");
  }
});

window.saveSettings = saveSettings;

const storedToken = localStorage.getItem("cesiumToken");
const storedAssetId = localStorage.getItem("cesiumAssetId");

if (storedToken && storedAssetId) {
  initCesium(storedToken, storedAssetId);
}
