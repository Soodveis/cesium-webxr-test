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

window.saveSettings = async function () {
  const accessToken = document.getElementById('accessToken').value.trim();
  const assetId = parseInt(document.getElementById('assetId').value.trim());

  if (!accessToken || !assetId) {
    alert("Пожалуйста, введите Access Token и Asset ID");
    return;
  }

  Cesium.Ion.defaultAccessToken = accessToken;

  const terrain = await Cesium.CesiumTerrainProvider.fromIonAssetId(assetId);

  viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: terrain,
    imageryProvider: new Cesium.BingMapsImageryProvider({
      url: 'https://dev.virtualearth.net',
      key: 'Agi1Q9ZKxoK5eW0Jw0AQ02ZwLz1g0xJc3xFG9dyNjNljZgk0hxYQRYsYgkztlKce', // ключ Cesium
      mapStyle: Cesium.BingMapsStyle.AERIAL
    }),
    shouldAnimate: true
  });

  viewer.scene.globe.enableLighting = true;
};
