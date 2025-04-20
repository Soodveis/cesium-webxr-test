const gpsDiv = document.getElementById('gpsCoordinates');

if (!gpsDiv) {
  console.error('Элемент #gpsCoordinates не найден!');
} else if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      gpsDiv.textContent = `GPS: ${lat}, ${lon}`;
    },
    (error) => {
      gpsDiv.textContent = `GPS: ошибка получения координат`;
      console.error('Ошибка геолокации:', error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );
} else {
  gpsDiv.textContent = 'GPS: не поддерживается';
}
