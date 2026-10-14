import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';

const models = {
  task: './assets/models/desk-lamp.glb',
  table: './assets/models/table-lamp.gltf',
};
const finishes = {
  silver: { color: 0xc4cbd3, metalness: 0.88, roughness: 0.31 },
  obsidian: { color: 0x303640, metalness: 0.65, roughness: 0.35 },
  rose: { color: 0xc57e78, metalness: 0.24, roughness: 0.39 },
};

// This renderer is imported after the HTML controls are connected. A failed
// module, WebGL context or asset never prevents configuration and copying.
export function createLampPreview({ canvas, onStatus }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = !reducedMotion.matches;
  controls.dampingFactor = 0.11;
  controls.minDistance = 3.8;
  controls.maxDistance = 10;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = Math.PI / 2 - 0.035;
  controls.target.set(0, 1.23, 0);
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.7;

  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.62;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xcad8ff, 0x27201b, 0.7));

  const key = new THREE.DirectionalLight(0xffefde, 3.2);
  key.position.set(-3.5, 6, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -4;
  key.shadow.camera.right = key.shadow.camera.top = 4;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 15;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.00015;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa9c8ff, 2);
  rim.position.set(4, 3.5, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 1);
  fill.position.set(3, 1.8, 4);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.34 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.006;
  floor.receiveShadow = true;
  scene.add(floor);

  function radialTexture(stops) {
    const image = document.createElement('canvas');
    image.width = image.height = 128;
    const ctx = image.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(image);
  }
  const shadowTexture = radialTexture([[0, '#000d'], [0.3, '#0009'], [1, '#0000']]);
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.8,
  }));
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.003;
  scene.add(contactShadow);
  const lightTexture = radialTexture([[0, '#ffd08ccc'], [0.35, '#ffbd6655'], [1, '#ffb96a00']]);
  const lightPool = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshBasicMaterial({
    map: lightTexture, transparent: true, depthWrite: false, opacity: 0.2,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }));
  lightPool.rotation.x = -Math.PI / 2;
  lightPool.position.y = 0.005;
  scene.add(lightPool);

  const lampLight = new THREE.SpotLight(0xffc38a, 5, 8, 0.65, 0.65, 1.6);
  scene.add(lampLight, lampLight.target);
  const bulbFill = new THREE.PointLight(0xffc68d, 0.25, 1.4, 2);
  scene.add(bulbFill);
  const loader = new GLTFLoader();
  let current = null;
  let loadedModel = null;
  let requestedModel = null;
  let generation = 0;
  let frame = 0;
  let visible = true;
  let contextLost = false;
  let disposed = false;
  let state = { model: 'task', view: 'studio', material: 'silver', brightness: 72, diffuser: true, counterweight: false };
  let lastView = null;

  function requestRender() {
    if (!frame && !disposed && !contextLost && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function render() {
    frame = 0;
    if (disposed || contextLost || !visible || document.hidden) return;
    // OrbitControls only emits change while damping is still moving; this
    // schedules the next frame through its listener, without an idle loop.
    controls.update();
    renderer.render(scene, camera);
  }
  controls.addEventListener('change', requestRender);
  controls.addEventListener('start', () => canvas.classList.add('grabbing'));
  controls.addEventListener('end', () => canvas.classList.remove('grabbing'));

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestRender();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  });
  intersectionObserver.observe(canvas);
  function visibilityChanged() {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else requestRender();
  }
  document.addEventListener('visibilitychange', visibilityChanged);
  function motionChanged() { controls.enableDamping = !reducedMotion.matches; requestRender(); }
  reducedMotion.addEventListener('change', motionChanged);

  function setView(view) {
    lastView = view;
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.target.set(0, 1.23, 0);
    camera.position.copy(view === 'profile'
      ? new THREE.Vector3(0.06, 2.35, 6.6)
      : new THREE.Vector3(4.1, 3.0, 5.8));
    camera.lookAt(controls.target);
    controls.update();
    controls.enableDamping = damping;
    requestRender();
  }

  function disposeObject(root) {
    const materials = new Set();
    const textures = new Set();
    root.traverse(object => {
      object.geometry?.dispose();
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
  }

  function prepareModel(asset) {
    const root = asset.scene;
    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('Empty model bounds');
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 2.55 / size.y;
    root.scale.multiplyScalar(scale);
    root.position.x -= center.x * scale;
    root.position.y -= bounds.min.y * scale;
    root.position.z -= center.z * scale;
    root.updateMatrixWorld(true);
    const parts = [];
    let bulb = null, base = null, shade = null;
    root.traverse(mesh => {
      if (!mesh.isMesh) return;
      const isBulb = /bulb|diffuser/i.test(mesh.name);
      const isHardware = /spring|pivot|socket|mount/i.test(mesh.name);
      // Keep the actual asset geometry and its subtle normal textures, while
      // making the three finish choices consistent across both models.
      const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const material = source.clone();
      material.map = null;
      material.envMapIntensity = 1.25;
      material.side = THREE.DoubleSide;
      mesh.material = material;
      mesh.castShadow = !isBulb;
      mesh.receiveShadow = true;
      mesh.userData.isBulb = isBulb;
      mesh.userData.isHardware = isHardware;
      parts.push(mesh);
      if (isBulb) bulb = mesh;
      if (/base/i.test(mesh.name)) base = mesh;
      if (/shade/i.test(mesh.name)) shade = mesh;
    });
    const baseBox = new THREE.Box3().setFromObject(base || root);
    const baseSize = baseBox.getSize(new THREE.Vector3());
    const baseCenter = baseBox.getCenter(new THREE.Vector3());
    const baseRadius = Math.max(baseSize.x, baseSize.z) / 2;
    const bulbBox = new THREE.Box3().setFromObject(bulb || shade || root);
    const bulbPosition = bulbBox.getCenter(new THREE.Vector3());
    const container = new THREE.Group();
    container.add(root);
    const weight = new THREE.Mesh(new THREE.CylinderGeometry(baseRadius * 1.15, baseRadius * 1.19, 0.075, 64),
      new THREE.MeshStandardMaterial({ color: 0x262b31, metalness: 0.8, roughness: 0.3 }));
    weight.position.set(baseCenter.x, 0.038, baseCenter.z);
    weight.castShadow = weight.receiveShadow = true;
    container.add(weight);

    // An optional lens sits just inside the shade opening, following the task
    // lamp's tilted head. It is a preview accessory, not an animated joint.
    const shadeBox = new THREE.Box3().setFromObject(shade || bulb || root);
    const shadeSize = shadeBox.getSize(new THREE.Vector3());
    const lensRadius = Math.max(shadeSize.x, shadeSize.z) * 0.34;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(lensRadius, 64), new THREE.MeshStandardMaterial({
      color: 0xffe8ca, metalness: 0, roughness: 0.55, transparent: true, opacity: 0.78,
      emissive: 0xffc282, emissiveIntensity: 0.5, side: THREE.DoubleSide, depthWrite: false,
    }));
    lens.rotation.x = -Math.PI / 2;
    lens.position.copy(bulbPosition);
    lens.position.y = shadeBox.min.y + 0.028;
    if (state.model === 'task') lens.rotation.x -= 0.297;
    container.add(lens);
    return { container, parts, lens, weight, bulbPosition, baseCenter, baseRadius };
  }

  function applyConfiguration() {
    if (!current) return;
    const finish = finishes[state.material] || finishes.silver;
    const brightness = state.brightness / 100;
    for (const mesh of current.parts) {
      const material = mesh.material;
      if (mesh.userData.isBulb) {
        material.color.setHex(0xffecd2);
        material.emissive.setHex(0xffb765);
        material.emissiveIntensity = 0.3 + brightness * 1.5;
        material.metalness = 0;
        material.roughness = 0.4;
      } else if (mesh.userData.isHardware) {
        material.color.setHex(state.material === 'obsidian' ? 0x777f89 : 0xa6afb9);
        material.metalness = 0.95;
        material.roughness = 0.25;
        material.emissive?.setHex(0x000000);
      } else {
        material.color.setHex(finish.color);
        material.metalness = finish.metalness;
        material.roughness = finish.roughness;
        material.emissive?.setHex(0x000000);
      }
    }
    current.lens.visible = state.diffuser;
    current.lens.material.emissiveIntensity = 0.15 + brightness * 0.7;
    current.weight.visible = state.counterweight;
    lampLight.position.copy(current.bulbPosition);
    lampLight.position.y -= 0.065;
    lampLight.target.position.set(current.bulbPosition.x, 0, current.bulbPosition.z + 0.35);
    lampLight.intensity = 2 + brightness * 6;
    lampLight.angle = state.diffuser ? 0.8 : 0.5;
    lampLight.penumbra = state.diffuser ? 1 : 0.45;
    bulbFill.position.copy(current.bulbPosition);
    bulbFill.intensity = brightness * 0.55;
    lightPool.position.x = current.bulbPosition.x;
    lightPool.position.z = current.bulbPosition.z + 0.22;
    lightPool.scale.setScalar(state.diffuser ? 1.12 : 0.75);
    lightPool.material.opacity = brightness * 0.24;
    contactShadow.position.x = current.baseCenter.x;
    contactShadow.position.z = current.baseCenter.z;
    contactShadow.scale.set(current.baseRadius * 3.6, current.baseRadius * 3.6, 1);
    if (state.view !== lastView) setView(state.view);
    requestRender();
  }

  async function loadModel(model, force = false) {
    if (disposed || (!force && requestedModel === model)) return;
    const token = ++generation;
    requestedModel = model;
    onStatus({ kind: 'loading', model, message: `Loading ${model.toUpperCase()} model…` });
    let timeout;
    let candidate;
    try {
      const load = loader.loadAsync(models[model]);
      // Dispose a late response from a cancelled or timed-out request.
      let timedOut = false;
      load.then(asset => {
        if (timedOut || token !== generation || disposed) disposeObject(asset.scene);
      }).catch(() => {});
      const asset = await Promise.race([load, new Promise((_, reject) => {
        timeout = setTimeout(() => { timedOut = true; reject(new Error('Model request timed out')); }, 15000);
      })]);
      if (token !== generation || disposed) return;
      candidate = prepareModel(asset);
      if (current) { scene.remove(current.container); disposeObject(current.container); }
      current = candidate;
      scene.add(current.container);
      loadedModel = model;
      applyConfiguration();
      onStatus({ kind: 'ready', model, message: `${model === 'task' ? 'Balance task lamp' : 'Table lamp'} loaded · drag to inspect.` });
      requestRender();
    } catch (error) {
      if (token !== generation || disposed) return;
      requestedModel = null;
      if (candidate) disposeObject(candidate.container);
      onStatus({ kind: 'error', model, message: 'The 3D model could not load. Retry or choose the other model.', error });
    } finally { clearTimeout(timeout); }
  }

  function keyDown(event) {
    if (disposed || contextLost || !current) return;
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const amount = event.shiftKey ? 0.18 : 0.08;
    switch (event.key) {
      case 'ArrowLeft': spherical.theta -= amount; break;
      case 'ArrowRight': spherical.theta += amount; break;
      case 'ArrowUp': spherical.phi -= amount; break;
      case 'ArrowDown': spherical.phi += amount; break;
      case '+': case '=': spherical.radius *= 0.9; break;
      case '-': case '_': spherical.radius *= 1.1; break;
      case 'Home': event.preventDefault(); setView(state.view); return;
      default: return;
    }
    event.preventDefault();
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
    requestRender();
  }
  canvas.addEventListener('keydown', keyDown);
  function contextLoss(event) {
    event.preventDefault();
    contextLost = true;
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    onStatus({ kind: 'error', model: state.model, message: 'The graphics context was lost. Retry when it recovers, or reload this page.' });
  }
  function contextRestored() { contextLost = false; loadModel(state.model, true); }
  canvas.addEventListener('webglcontextlost', contextLoss);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  setView('studio');
  resize();

  const api = {
    update(nextState) {
      state = { ...nextState };
      if (contextLost) {
        onStatus({ kind: 'error', model: state.model, message: 'The graphics context has not recovered. Reload this page to restart 3D.' });
        return;
      }
      if (loadedModel === state.model) {
        if (requestedModel !== state.model) ++generation;
        requestedModel = state.model;
        applyConfiguration();
        onStatus({ kind: 'ready', model: state.model, message: 'Configuration synced · drag to inspect.' });
      } else loadModel(state.model);
    },
    resetView() { setView(state.view); },
    resume() {
      if (disposed) return;
      resize();
      requestRender();
    },
    retry() {
      if (contextLost) {
        onStatus({ kind: 'error', model: state.model, message: 'The graphics context has not recovered. Reload this page to restart 3D.' });
      } else loadModel(state.model, true);
    },
    dispose() {
      disposed = true;
      ++generation;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      controls.dispose();
      document.removeEventListener('visibilitychange', visibilityChanged);
      reducedMotion.removeEventListener('change', motionChanged);
      canvas.removeEventListener('keydown', keyDown);
      canvas.removeEventListener('webglcontextlost', contextLoss);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      if (current) disposeObject(current.container);
      floor.geometry.dispose(); floor.material.dispose();
      contactShadow.geometry.dispose(); contactShadow.material.dispose(); shadowTexture.dispose();
      lightPool.geometry.dispose(); lightPool.material.dispose(); lightTexture.dispose();
      environmentTarget.dispose();
      renderer.dispose();
    },
  };
  return api;
}
