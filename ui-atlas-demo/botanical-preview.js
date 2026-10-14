import * as THREE from 'three';
import { createPlantModel } from './botanical-models.js';

// Original meshes and local Three.js keep the plant previews independent of a model CDN.
function createPreview(host) {
  const canvas = host.querySelector('.plant-canvas');
  const state = host.querySelector('.preview-state');
  const fallback = host.querySelector('.plant-fallback');
  const hero = host.dataset.hero === 'true';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // Retain the last frame while idle, including after responsive layout changes.
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, hero ? 2 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xfff8e8, 0x707d58, 2.3));
  const sun = new THREE.DirectionalLight(0xffebd5, 3.1);
  sun.position.set(-3.5, 7, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(hero ? 1024 : 512, hero ? 1024 : 512);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -3.5;
  sun.shadow.camera.right = sun.shadow.camera.top = 3.5;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 16;
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdbe9ce, 1.5);
  fill.position.set(4, 3, -4);
  scene.add(fill);

  const plant = createPlantModel(host.dataset.plant);
  const bounds = new THREE.Box3().setFromObject(plant);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  plant.position.x -= center.x;
  plant.position.z -= center.z;
  scene.add(plant);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x344331, opacity: 0.2 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.008;
  floor.receiveShadow = true;
  scene.add(floor);

  const target = new THREE.Vector3(0, center.y, 0);
  const defaults = { yaw: -0.18, elevation: 0.13 };
  let yaw = defaults.yaw;
  let elevation = defaults.elevation;
  let distance = 8;
  let visible = false;
  let dirty = true;
  let disposed = false;
  let lost = false;
  let frame = 0;
  let pointer = null;
  let lastTime = 0;
  let drawingWidth = 0;
  let drawingHeight = 0;
  let rotating = hero && !motion.matches;
  const autoButton = host.querySelector('[data-turn="auto"]');

  function syncAutoButton() {
    if (!autoButton) return;
    autoButton.setAttribute('aria-pressed', String(rotating));
    autoButton.setAttribute('aria-label', rotating ? 'Pause plant rotation' : 'Start plant rotation');
    autoButton.textContent = rotating ? 'Ⅱ' : '▷';
  }
  function stopRotation() { rotating = false; syncAutoButton(); }
  function pose() {
    plant.rotation.y = yaw;
    camera.position.set(0, target.y + Math.sin(elevation) * distance, Math.cos(elevation) * distance);
    camera.lookAt(target);
  }
  function requestRender() {
    dirty = true;
    if (!frame && !disposed && !lost && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function render(time) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) { lastTime = 0; return; }
    if (rotating) {
      if (lastTime) yaw += Math.min((time - lastTime) / 1000, 0.05) * 0.13;
      dirty = true;
    }
    lastTime = time;
    if (dirty) {
      pose();
      renderer.render(scene, camera);
      dirty = false;
    }
    if (rotating) frame = requestAnimationFrame(render);
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    if (width === drawingWidth && height === drawingHeight) { requestRender(); return; }
    drawingWidth = width;
    drawingHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // Use foliage depth as well as width so the entire model fits throughout a turn.
    const span = Math.max(size.x, size.z);
    distance = Math.max(size.y / (2 * tangent), span / (2 * tangent * camera.aspect)) * (hero ? 1.22 : 1.23);
    // Refresh one frame even offscreen; interactive animation remains visibility-gated.
    if (!lost) { pose(); renderer.render(scene, camera); }
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { resize(); requestRender(); }
    else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  });
  intersectionObserver.observe(host);

  function pointerDown(event) {
    if (event.button !== 0 || pointer) return;
    stopRotation();
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, elevation, touch: event.pointerType !== 'mouse' };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('grabbing');
  }
  function pointerMove(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    yaw = pointer.yaw + (event.clientX - pointer.x) * 0.012;
    // One-finger horizontal drags turn the pot; vertical touch gestures scroll the page.
    if (!pointer.touch) elevation = THREE.MathUtils.clamp(pointer.elevation + (event.clientY - pointer.y) * 0.004, -0.05, 0.55);
    requestRender();
  }
  function pointerUp(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    pointer = null;
    canvas.classList.remove('grabbing');
  }
  function reset() {
    stopRotation();
    yaw = defaults.yaw;
    elevation = defaults.elevation;
    requestRender();
  }
  function keyDown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    stopRotation();
    if (event.key === 'Home') reset();
    if (event.key === 'ArrowLeft') yaw -= 0.22;
    if (event.key === 'ArrowRight') yaw += 0.22;
    if (event.key === 'ArrowUp') elevation = Math.min(elevation + 0.06, 0.55);
    if (event.key === 'ArrowDown') elevation = Math.max(elevation - 0.06, -0.05);
    requestRender();
  }
  function buttonClick(event) {
    const button = event.target.closest('[data-turn]');
    if (!button) return;
    if (button.dataset.turn === 'auto') { rotating = !rotating; lastTime = 0; syncAutoButton(); }
    else if (button.dataset.turn === 'reset') reset();
    else { stopRotation(); yaw += button.dataset.turn === 'left' ? -Math.PI / 6 : Math.PI / 6; }
    requestRender();
  }
  function visibilityChanged() {
    lastTime = 0;
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestRender();
  }
  function motionChanged() { if (motion.matches) stopRotation(); requestRender(); }
  function contextLost(event) {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    showFallback(host);
  }
  function contextRestored() {
    lost = false;
    host.dataset.preview = 'ready';
    fallback.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('aria-hidden', 'false');
    canvas.tabIndex = 0;
    state.textContent = 'LIVE 3D';
    requestRender();
  }
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('keydown', keyDown);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  host.querySelector('.model-controls').addEventListener('click', buttonClick);
  document.addEventListener('visibilitychange', visibilityChanged);
  motion.addEventListener('change', motionChanged);
  resize();
  pose();
  renderer.render(scene, camera);
  host.dataset.preview = 'ready';
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-hidden', 'false');
  canvas.setAttribute('aria-busy', 'false');
  fallback.setAttribute('aria-hidden', 'true');
  state.textContent = 'LIVE 3D';
  syncAutoButton();

  return {
    resume: requestRender,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged);
      motion.removeEventListener('change', motionChanged);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('keydown', keyDown);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      host.querySelector('.model-controls').removeEventListener('click', buttonClick);
      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      });
      materials.forEach(material => Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); }));
      textures.forEach(texture => texture.dispose());
      materials.forEach(material => material.dispose());
      geometries.forEach(geometry => geometry.dispose());
      renderer.dispose();
    },
  };
}

export function showFallback(host) {
  host.dataset.preview = 'fallback';
  host.querySelector('.preview-state').textContent = 'PLANT ILLUSTRATION';
  host.querySelector('.plant-fallback').setAttribute('aria-hidden', 'false');
  const canvas = host.querySelector('.plant-canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('aria-busy', 'false');
  canvas.tabIndex = -1;
}

export function startPlantPreviews() {
  const previews = [];
  document.querySelectorAll('[data-plant]').forEach(host => {
    try { previews.push(createPreview(host)); }
    catch { showFallback(host); }
  });
  window.addEventListener('pagehide', event => { if (!event.persisted) previews.forEach(preview => preview.dispose()); });
  window.addEventListener('pageshow', event => { if (event.persisted) previews.forEach(preview => preview.resume()); });
}
