const connectButton = document.getElementById('connectRTK');

if (connectButton) {
  connectButton.addEventListener('click', async () => {
    try {
      // Запрос порта
      const port = await navigator.serial.requestPort();
      
      // Открываем порт
      await port.open({ baudRate: 115200 });

      console.log('✅ USB-порт открыт');

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;

      const reader = inputStream.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          console.log('📡 Данные от RTK:', value);
        }
      }

      reader.releaseLock();
    } catch (error) {
      console.error('❌ Ошибка подключения к USB:', error);
    }
  });
}
// Подключаемся к WebSocket на ESP32
const socket = new WebSocket('ws://192.168.4.1:81');

socket.onopen = () => {
    console.log('✅ WebSocket открыт (ESP32)');
};

socket.onerror = (error) => {
    console.error('❌ WebSocket ошибка:', error);
};

let gpsEntity = viewer.entities.add({
    name: 'RTK GPS Marker',
    position: Cesium.Cartesian3.fromDegrees(0, 0),
    point: {
        pixelSize: 12,
        color: Cesium.Color.YELLOW,
    },
});

// Обработка приходящих GPS строк
socket.onmessage = (event) => {
    const line = event.data.trim();
    if (line.startsWith('$GNGGA') || line.startsWith('$GNRMC')) {
        const parts = line.split(',');
        if (parts.length > 5) {
            const lat = parseFloat(parts[3]);
            const latDir = parts[4];
            const lon = parseFloat(parts[5]);
            const lonDir = parts[6];

            const convert = (val, dir) => {
                const deg = Math.floor(val / 100);
                const min = val - deg * 100;
                let coord = deg + min / 60;
                if (dir === 'S' || dir === 'W') coord = -coord;
                return coord;
            };

            const latitude = convert(lat, latDir);
            const longitude = convert(lon, lonDir);

            console.log(`📍 Координаты: ${latitude}, ${longitude}`);

            // Обновление позиции маркера
            gpsEntity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        }
    }
};
