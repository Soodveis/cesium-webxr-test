let viewer = null;

document.getElementById('enterAR').addEventListener('click', async () => {
  if (!viewer) {
    alert("Сначала загрузите сцену.");
    return;
  }

  if (navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')) {
    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local'] }).then(() => {
      alert("WebXR AR-сессия успешно запущена!");
    });
  } else {
    alert("WebXR не поддерживается на этом устройстве.");
  }
});

window.saveSettings = function () {
  const accessToken = document.getElementById('accessToken').value.trim();
  const assetId = parseInt(document.getElementById('assetId').value.trim());

  if (!accessToken || !assetId) {
    alert("Пожалуйста, введите Access Token и Asset ID");
    return;
  }

  Cesium.Ion.defaultAccessToken = accessToken;

  viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(assetId)
    }),
    imageryProvider: new Cesium.IonImageryProvider({ assetId }),
    shouldAnimate: true
  });

  viewer.scene.globe.enableLighting = true;
};
