// Подключение к встроенному GPS и отображение координат и статуса RTK в #gpsCoordinates

const gpsDiv = document.getElementById('gpsCoordinates');

if (!gpsDiv) {
  console.error('Элемент #gpsCoordinates не найден!');
} else if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);

      // Симуляция RTK статуса
      const statuses = ['NO FIX', 'FLOAT', 'FIX'];
      const random = Math.floor(Math.random() * statuses.length);
      const rtk = statuses[random];

      gpsDiv.textContent = `GPS: ${lat}, ${lon} | RTK: ${rtk}`;
      gpsDiv.style.color =
        rtk === 'FIX' ? 'lime' : rtk === 'FLOAT' ? 'orange' : 'gray';

      console.log(`Получены координаты: широта ${lat}, долгота ${lon}`);
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
  console.warn('Геолокация не поддерживается браузером.');
}
