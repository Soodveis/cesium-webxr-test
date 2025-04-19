// main.js — правки: terrain по умолчанию + KML слой через assetId
let viewer = null;
let useRTK = false;
let port, reader;

async function connectToRTK() {
  if (!('serial' in navigator)) {
    alert("Web Serial API не поддерживается этим браузером.");
    return;
  }

  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    reader = port.readable.getReader();
    useRTK = true;
    readFromRTK();
  } catch (err) {
    alert("Ошибка подключения к RTK: " + err);
    console.error(err);
  }
}

async function readFromRTK() {
  let buffer = '';
  while (port.readable) {
    try {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);

      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (line.startsWith("$GPGGA")) {
          const coords = parseGGA(line);
          if (coords) updateGPS(coords.lat, coords.lon, coords.fix);
        }
      }
    } catch (err) {
      console.error("Ошибка чтения из RTK:", err);
      break;
    }
  }
}

function parseGGA(gga) {
  const parts = gga.split(',');
  if (parts.length < 7 || parts[2] === '' || parts[4] === '') return null;

  const lat = convertToDecimal(parts[2], parts[3]);
  const lon = convertToDecimal(parts[4], parts[5]);
  const fix = parts[6];
  return { lat, lon, fix };
}

function convertToDecimal(coord, direction) {
  const deg = parseInt(coord.slice(0, direction === 'N' || direction === 'S' ? 2 : 3));
  const min = parseFloat(coord.slice(direction === 'N' || direction === 'S' ? 2 : 3));
  let decimal = deg + min / 60;
  if (direction === 'S' || direction === 'W') decimal *= -1;
  return decimal;
}

function updateGPS(lat, lon, fix = 0) {
  document.getElementById('gpsText').textContent = `GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  const fixEl = document.getElementById('fixStatus');
  if (fix == '1') {
    fixEl.textContent = 'NO FIX';
    fixEl.className = 'none';
  } else if (fix == '2') {
    fixEl.textContent = 'FLOAT';
    fixEl.className = 'float';
  } else if (fix == '4') {
    fixEl.textContent = 'FIX';
    fixEl.className = 'fix';
  } else {
    fixEl.textContent = 'NO FIX';
    fixEl.className = 'none';
  }
}

function fallbackGeolocation() {
  if (!useRTK && 'geolocation' in navigator) {
    navigator.geolocation.watchPosition(pos => {
      updateGPS(pos.coords.latitude, pos.coords.longitude);
    }, err => console.warn(err), { enableHighAccuracy: true });
  }
}

window.saveSettings = async function () {
  localStorage.setItem('cesiumToken', document.getElementById('accessToken').value);
  localStorage.setItem('cesiumAssetId', document.getElementById('assetId').value);
  const accessToken = document.getElementById('accessToken').value.trim();
  const assetId = parseInt(document.getElementById('assetId').value.trim());

  if (!accessToken || !assetId) {
    alert("Пожалуйста, введите Access Token и Asset ID");
    return;
  }

  Cesium.Ion.defaultAccessToken = accessToken;

  const terrain = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

  if (!viewer) {
    viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: terrain,
      imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
      shouldAnimate: true,
      scene3DOnly: true
    });
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();
  }
  try {
    const resource = await Cesium.IonResource.fromAssetId(assetId);
    const kmlLayer = await Cesium.KmlDataSource.load(resource, {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: true
    });
    viewer.dataSources.add(kmlLayer);
    viewer.flyTo(kmlLayer);

    // Удаляем лишние сущности: на (0,0), и те, что слишком высоко висят
    const badEntities = kmlLayer.entities.values.filter(entity => {
      const position = entity.position?.getValue(Cesium.JulianDate.now());
      if (!position) return true;
      const carto = Cesium.Cartographic.fromCartesian(position);
      const lon = Cesium.Math.toDegrees(carto.longitude);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const height = carto.height;
      return (lon === 0 && lat === 0) || height > 10;
    });
    badEntities.forEach(entity => kmlLayer.entities.remove(entity));

    setTimeout(() => {
      fallbackGeolocation();
    }, 2000);
  } catch (err) {
    console.error("Ошибка загрузки KML:", err);
    alert("Не удалось загрузить KML-слой. Проверьте Asset ID");
  }
}

document.getElementById('connectRTK').addEventListener('click', connectToRTK);

window.addEventListener('DOMContentLoaded', () => {
  const storedToken = localStorage.getItem('cesiumToken');
  const storedAssetId = localStorage.getItem('cesiumAssetId');
  if (storedToken) document.getElementById('accessToken').value = storedToken;
  if (storedAssetId) document.getElementById('assetId').value = storedAssetId;
});
