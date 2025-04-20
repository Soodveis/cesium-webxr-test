// === main.js ===

let viewer, markerEntity;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loadScene')?.addEventListener('click', loadScene);
  fallbackGeolocation();
});

async function loadScene() {
  const token = document.getElementById('accessToken').value.trim();
  const assetId = parseInt(document.getElementById('assetId').value.trim());
  Cesium.Ion.defaultAccessToken = token;

  viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
    imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
    shouldAnimate: true,
    scene3DOnly: true
  });

  const resource = await Cesium.IonResource.fromAssetId(assetId);
  viewer.dataSources.add(Cesium.KmlDataSource.load(resource, {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  }));
}

function fallbackGeolocation() {
  if (!('geolocation' in navigator)) {
    console.warn('Геолокация не поддерживается');
    return;
  }

  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    updateGPS(lat, lon);
  }, err => console.warn(err), { enableHighAccuracy: true });
}

function updateGPS(lat, lon) {
  const gpsEl = document.getElementById('gpsCoordinates');
  gpsEl.textContent = `GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  if (viewer) {
    const position = Cesium.Cartesian3.fromDegrees(lon, lat);
    if (markerEntity) {
      markerEntity.position = position;
    } else {
      markerEntity = viewer.entities.add({
        position,
        billboard: {
          image: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
          scale: 0.08,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
      });
    }
  }
}

window.loadScene = loadScene;
