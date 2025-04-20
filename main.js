// === main.js ===

let viewer, markerEntity, useRTK = false;
let port, reader;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectRTK')?.addEventListener('click', connectToRTK);
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

async function connectToRTK() {
  if (!('serial' in navigator)) {
    alert('Web Serial API не поддерживается этим браузером.');
    return;
  }
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    reader = port.readable.getReader();
    useRTK = true;
    readFromRTK();
  } catch (err) {
    alert('Ошибка подключения к RTK: ' + err);
  }
}

async function readFromRTK() {
  let buffer = '';
  while (port.readable) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += new TextDecoder().decode(value);
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (line.startsWith('$GPGGA')) {
        const coords = parseGGA(line);
        if (coords) updateGPS(coords.lat, coords.lon);
      }
    }
  }
}

function parseGGA(gga) {
  const parts = gga.split(',');
  if (parts.length < 6 || !parts[2] || !parts[4]) return null;
  const lat = convert(parts[2], parts[3]);
  const lon = convert(parts[4], parts[5]);
  return { lat, lon };
}

function convert(coord, dir) {
  const degrees = parseInt(coord.slice(0, dir === 'N' || dir === 'S' ? 2 : 3));
  const minutes = parseFloat(coord.slice(dir === 'N' || dir === 'S' ? 2 : 3));
  let dec = degrees + minutes / 60;
  if (dir === 'S' || dir === 'W') dec *= -1;
  return dec;
}

function updateGPS(lat, lon) {
  document.getElementById('gpsText').textContent = `GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  if (viewer && markerEntity) {
    markerEntity.position = Cesium.Cartesian3.fromDegrees(lon, lat);
  } else if (viewer && !markerEntity) {
    markerEntity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      billboard: {
        image: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scale: 0.1
      }
    });
  }
}

function fallbackGeolocation() {
  if (!useRTK && 'geolocation' in navigator) {
    navigator.geolocation.watchPosition(pos => {
      updateGPS(pos.coords.latitude, pos.coords.longitude);
    }, err => console.warn(err), { enableHighAccuracy: true });
  }
}

window.loadScene = loadScene; // делаем функцию глобальной
