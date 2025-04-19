// main.js — обновлённый с FIX/FLOAT и иконкой вместо точки
let viewer = null;
let gpsEntity = null;
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

  if (viewer && gpsEntity) {
    const pos = Cesium.Cartesian3.fromDegrees(lon, lat);
    gpsEntity.position = pos;
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
    imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
    shouldAnimate: true,
    scene3DOnly: true
  });

  viewer.scene.globe.enableLighting = true;

  gpsEntity = viewer.entities.add({
    name: "GPS Marker",
    position: Cesium.Cartesian3.fromDegrees(0, 0),
    billboard: {
      image: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.05
    }
  });

  fallbackGeolocation();
};

document.getElementById('connectRTK').addEventListener('click', connectToRTK);
