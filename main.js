function saveSettings() {
  const token = document.getElementById('accessToken').value.trim();
  const assetId = parseInt(document.getElementById('assetId').value.trim());

  if (!token || !assetId) {
    alert("Пожалуйста, введите Access Token и Asset ID");
    return;
  }

  Cesium.Ion.defaultAccessToken = token;

  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: new Cesium.IonImageryProvider({ assetId }),
    baseLayerPicker: false,
    animation: false,
    timeline: false
  });

  viewer.scene.globe.enableLighting = true;
  viewer.scene.backgroundColor = Cesium.Color.BLACK;

  document.getElementById("enterAR").addEventListener("click", async () => {
    if (navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')) {
      alert("WebXR AR-сессия успешно запущена!");
      // здесь может быть логика AR-инициализации
    } else {
      alert("WebXR не поддерживается на этом устройстве или браузере");
    }
  });
}
