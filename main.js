import {
  Viewer,
  Ion,
  IonImageryProvider,
  EllipsoidTerrainProvider
} from "https://cdn.jsdelivr.net/npm/cesium@1.109.0/+esm";

Ion.defaultAccessToken = "your-token-here"; // добавь свой токен Cesium Ion

const viewer = new Viewer("cesiumContainer", {
  terrainProvider: new EllipsoidTerrainProvider(),
  shouldAnimate: true,
});

document.getElementById("enterAR").addEventListener("click", async () => {
  if (!navigator.xr) {
    alert("WebXR не поддерживается в этом браузере.");
    return;
  }

  try {
    const session = await navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test", "dom-overlay"],
      domOverlay: { root: document.body },
    });
    alert("WebXR AR-сессия успешно запущена!");
    await session.end();
  } catch (e) {
    alert("Ошибка запуска WebXR: " + e.message);
    console.error(e);
  }
});
