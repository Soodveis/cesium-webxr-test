const connectButton = document.getElementById('connectRTK');

if (connectButton) {
  if (!('serial' in navigator)) {
  console.error('❌ Web Serial API не поддерживается этим браузером.');
  alert('Ваш браузер не поддерживает Web Serial API. Попробуйте в Chrome на ПК или обновите устройство.');
  return;
}
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
