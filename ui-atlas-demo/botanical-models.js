import * as THREE from 'three';

// Original, deterministic botanical models. Every leaf is a curved surface;
// these models do not require downloaded geometry, images, or SVG billboards.
const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const palettes = {
  monstera: { pot: 0xb76b49, leaf: 0x355b32, vein: 0x5d7941 },
  snake: { pot: 0x8d9c80, leaf: 0x405d43, vein: 0x74885a },
  rubber: { pot: 0xb88c4b, leaf: 0x264b34, vein: 0x577044 },
  peace: { pot: 0xe3ddca, leaf: 0x345b38, vein: 0x6b824b },
};

function random(seed) {
  let n = seed >>> 0;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
}

function shadowMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function grainTexture(seed, dark = 100, light = 215) {
  const rng = random(seed);
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const value = Math.floor(dark + (light - dark) * rng());
    data.set([value, value, value, 255], i * 4);
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.repeat.set(3, 2);
  texture.needsUpdate = true;
  return texture;
}

function tube(points, radius, material, segments = 24, radialSegments = 5) {
  const curve = new THREE.CatmullRomCurve3(points.map(p =>
    p.isVector3 ? p.clone() : new THREE.Vector3(...p)));
  return shadowMesh(new THREE.TubeGeometry(curve, segments, radius, radialSegments, false), material);
}

function pot(group, color, seed) {
  const bump = grainTexture(seed);
  const pottery = new THREE.MeshStandardMaterial({
    color, roughness: 0.83, bumpMap: bump, bumpScale: 0.012,
  });
  // The profile returns down the inside wall, leaving a real hollow rim.
  const profile = [
    [0, 0], [0.33, 0], [0.355, 0.035], [0.364, 0.085],
    [0.464, 0.636], [0.484, 0.652], [0.505, 0.654], [0.518, 0.672],
    [0.518, 0.702], [0.507, 0.718], [0.466, 0.718], [0.447, 0.698],
    [0.442, 0.64], [0.352, 0.14], [0, 0.14],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = shadowMesh(new THREE.LatheGeometry(profile, 64), pottery);
  body.name = 'Hand-finished ceramic planter';
  group.add(body);

  const foot = shadowMesh(new THREE.TorusGeometry(0.344, 0.013, 6, 64), pottery);
  foot.rotation.x = Math.PI / 2;
  foot.position.y = 0.035;
  group.add(foot);

  const soil = new THREE.MeshStandardMaterial({
    color: 0x352a20, roughness: 1, bumpMap: grainTexture(seed + 2, 30, 230), bumpScale: 0.025,
  });
  const surface = shadowMesh(new THREE.CircleGeometry(0.445, 56), soil);
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.665;
  group.add(surface);

  const rng = random(seed + 7);
  const pebbleMaterials = [0x544336, 0x796451, 0x2c251c].map(c =>
    new THREE.MeshStandardMaterial({ color: c, roughness: 1 }));
  const pebbleGeometry = new THREE.SphereGeometry(1, 5, 3);
  for (let i = 0; i < 24; i++) {
    const angle = rng() * TAU;
    const radius = Math.sqrt(rng()) * 0.414;
    const stone = shadowMesh(pebbleGeometry, pebbleMaterials[i % 3]);
    const size = 0.007 + rng() * 0.01;
    stone.scale.set(size * 1.3, size * 0.6, size);
    stone.position.set(Math.cos(angle) * radius, 0.667 + size * 0.3, Math.sin(angle) * radius);
    stone.rotation.y = rng() * TAU;
    group.add(stone);
  }
}

function leafWidth(t, opts, side = 1) {
  const { kind, width, phase = 0 } = opts;
  if (t <= 0 || t >= 1) return 0;
  if (kind === 'snake') return width * Math.pow(Math.sin(Math.PI * t), 0.28) * (1 - 0.3 * t);
  const power = kind === 'monstera' ? 0.38 : kind === 'spathe' ? 0.68 : 0.72;
  let w = width * Math.pow(Math.sin(Math.PI * t), power) * (1.04 - t * 0.22);
  w *= 1 + Math.sin(t * 8 + phase + side) * 0.035;
  if (kind === 'monstera') {
    const notches = side > 0 ? [0.32, 0.535, 0.735] : [0.35, 0.56, 0.765];
    notches.forEach((at, i) => {
      const spread = 0.022 - i * 0.003;
      const depth = 0.72 - i * 0.075;
      w *= 1 - depth * Math.exp(-Math.pow((t - at) / spread, 2));
    });
  }
  return w;
}

function leafPoint(t, v, opts) {
  const { length, kind, phase = 0, bend = 0.12 } = opts;
  const width = leafWidth(t, opts, Math.sign(v) || 1);
  let x = width * v;
  let y = length * t;
  let z = bend * Math.sin(Math.PI * t) - bend * 0.75 * t * t;
  if (kind === 'monstera') {
    // Lobes sweep towards the tip from the midrib; basal shoulders turn back
    // down to produce the characteristic heart-shaped attachment.
    const sweep = Math.sqrt(Math.max(0, Math.sin(Math.PI * t)));
    y += length * 0.22 * Math.abs(x) / opts.width * sweep;
    y -= length * 0.24 * v * v * sweep * Math.exp(-t * 4);
    z += width * 0.16 * v * v + 0.014 * Math.sin(t * 17 + phase) * v;
  } else if (kind === 'snake') {
    z = 0.17 * t * t + width * (0.32 * v * v - 0.1);
    x += 0.034 * Math.sin(t * 5 + phase) * t;
    const twist = 0.22 * Math.sin(t * 3 + phase);
    const xx = x;
    x = xx * Math.cos(twist) - z * Math.sin(twist);
    z = xx * Math.sin(twist) + z * Math.cos(twist);
  } else if (kind === 'spathe') {
    z = 0.06 * Math.sin(Math.PI * t) + 0.16 * v * v * Math.sin(Math.PI * t) - 0.05 * t * t;
  } else {
    // Convex midrib and rolled margins give broad leaves a sculpted volume.
    z += width * 0.2 * v * v + 0.025 * Math.sin(t * 9 + phase) * v * v;
    if (kind === 'peace') z += 0.006 * Math.sin(Math.abs(v) * 19 + t * 11) * Math.sin(Math.PI * t);
  }
  return new THREE.Vector3(x, y, z);
}

function leafColor(t, v, opts, rng) {
  const color = new THREE.Color(opts.color);
  if (opts.kind === 'snake') {
    if (Math.abs(v) > 0.87) return color.set(0xb8b678).multiplyScalar(0.94 + rng() * 0.11);
    const band = Math.sin(t * 139 + Math.sin(v * 9 + t * 14) * 1.5);
    const mottling = Math.sin(t * 63 + v * 26) * 0.055 + rng() * 0.08;
    color.lerp(new THREE.Color(0xa4b692), band > 0.22 ? 0.48 + mottling : 0.07 + mottling);
    return color;
  }
  if (opts.kind === 'spathe') {
    return color.lerp(new THREE.Color(0xaabe81), Math.pow(1 - t, 4) * 0.29)
      .multiplyScalar(0.97 + rng() * 0.045);
  }
  color.multiplyScalar(0.93 + t * 0.1 + rng() * 0.07);
  if (Math.abs(v) < 0.13) color.lerp(new THREE.Color(opts.vein), 0.14);
  return color;
}

function subdivide(geometry, passes) {
  const positions = Array.from(geometry.attributes.position.array);
  let indices = Array.from(geometry.index.array);
  for (let pass = 0; pass < passes; pass++) {
    const edges = new Map();
    const midpoint = (a, b) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (edges.has(key)) return edges.get(key);
      const index = positions.length / 3;
      positions.push(
        (positions[a * 3] + positions[b * 3]) / 2,
        (positions[a * 3 + 1] + positions[b * 3 + 1]) / 2, 0,
      );
      edges.set(key, index);
      return index;
    };
    const next = [];
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = indices.slice(i, i + 3);
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      next.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    indices = next;
  }
  return { positions, indices };
}

function monsteraSurface(opts) {
  // Triangulate the real contour and four elliptical holes, rather than
  // deleting rectangular cells from a grid. Subdivision permits curved ribs
  // without sacrificing the smooth, explicitly sampled hole boundaries.
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  const rows = 72;
  for (let i = 1; i <= rows; i++) {
    const t = i / rows;
    shape.lineTo(leafWidth(t, opts, 1), t * opts.length);
  }
  for (let i = rows - 1; i > 0; i--) {
    const t = i / rows;
    shape.lineTo(-leafWidth(t, opts, -1), t * opts.length);
  }
  shape.closePath();
  for (const side of [-1, 1]) {
    for (const center of [0.435, 0.63]) {
      const t = center + (side < 0 ? 0.014 : 0);
      const w = leafWidth(t, opts, side);
      const hole = new THREE.Path();
      hole.absellipse(side * w * 0.47, t * opts.length, w * 0.105, opts.length * 0.037, -0.10 * side, TAU - 0.10 * side, true, side * 0.24);
      shape.holes.push(hole);
    }
  }
  const flat = new THREE.ShapeGeometry(shape, 12);
  const { positions: flatPositions, indices } = subdivide(flat, 2);
  flat.dispose();
  const positions = [], colors = [], uv = [];
  const rng = random(opts.seed || 8);
  for (let i = 0; i < flatPositions.length; i += 3) {
    const t = THREE.MathUtils.clamp(flatPositions[i + 1] / opts.length, 0, 1);
    const x = flatPositions[i];
    const width = leafWidth(t, opts, Math.sign(x) || 1);
    const v = width > 0.00001 ? THREE.MathUtils.clamp(x / width, -1, 1) : 0;
    const p = leafPoint(t, v, opts);
    const c = leafColor(t, v, opts, rng);
    positions.push(p.x, p.y, p.z);
    colors.push(c.r, c.g, c.b);
    uv.push(v * 0.5 + 0.5, t);
  }
  return { positions, colors, uv, indices };
}

function blade(opts) {
  const group = new THREE.Group();
  const rows = opts.kind === 'monstera' ? 96 : opts.kind === 'snake' ? 100 : 40;
  const columns = opts.kind === 'monstera' ? 18 : 12;
  let positions = [], colors = [], uv = [], indices = [];
  const rng = random(opts.seed || 8);
  if (opts.kind === 'monstera') {
    ({ positions, colors, uv, indices } = monsteraSurface(opts));
  } else for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    for (let j = 0; j <= columns; j++) {
      const v = j / columns * 2 - 1;
      const p = leafPoint(t, v, opts);
      positions.push(p.x, p.y, p.z);
      const c = leafColor(t, v, opts, rng);
      colors.push(c.r, c.g, c.b);
      uv.push(j / columns, t);
    }
  }
  if (opts.kind !== 'monstera') for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const t = (i + 0.5) / rows;
      const v = (j + 0.5) / columns * 2 - 1;
      const a = i * (columns + 1) + j;
      const b = a + columns + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const glossy = opts.kind === 'rubber';
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, side: THREE.DoubleSide,
    roughness: glossy ? 0.3 : opts.kind === 'spathe' ? 0.57 : 0.58,
    clearcoat: glossy ? 0.38 : 0.09,
    clearcoatRoughness: glossy ? 0.37 : 0.65,
  });
  group.add(shadowMesh(geometry, material));
  if (opts.kind === 'snake' || opts.kind === 'spathe') return group;

  const veins = new THREE.MeshStandardMaterial({ color: opts.vein, roughness: 0.65 });
  const midrib = [];
  for (let i = 0; i <= 15; i++) {
    const p = leafPoint(i / 15, 0, opts);
    p.z += 0.006;
    midrib.push(p);
  }
  group.add(tube(midrib, opts.kind === 'monstera' ? 0.005 : 0.0035, veins, 24, 4));
  const levels = opts.kind === 'monstera' ? [0.21, 0.41, 0.61, 0.84] : [0.2, 0.34, 0.49, 0.64, 0.78];
  levels.forEach((level, index) => {
    for (const side of [-1, 1]) {
      const points = [];
      for (let k = 0; k <= 5; k++) {
        const f = k / 5;
        const t = level - 0.065 * (1 - f) + (side < 0 ? 0.008 : 0);
        const p = leafPoint(t, side * f * 0.88, opts);
        p.z += 0.005;
        points.push(p);
      }
      group.add(tube(points, index > 3 ? 0.0013 : 0.0017, veins, 8, 3));
    }
  });
  return group;
}

function placeBlade(group, position, direction, turn = 0) {
  group.position.copy(position.isVector3 ? position : new THREE.Vector3(...position));
  const axis = direction.isVector3 ? direction.clone().normalize() : new THREE.Vector3(...direction).normalize();
  let side = new THREE.Vector3().crossVectors(UP, axis);
  if (side.lengthSq() < 0.0001) side.set(1, 0, 0);
  side.normalize();
  const normal = new THREE.Vector3().crossVectors(side, axis).normalize();
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, axis, normal));
  if (turn) group.rotateY(turn);
  return group;
}

function monstera(group, palette) {
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x607745, roughness: 0.72 });
  const rootMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5c38, roughness: 0.91 });
  group.add(tube([[0, 0.66, 0], [0.01, 1.03, 0.015], [0.07, 1.60, -0.03], [0.09, 2.22, -0.06]], 0.035, stemMaterial));
  const leaves = [
    [0.25, 1.22, 1.14, 0.53, 0.46],
    [2.45, 1.38, 1.13, 0.54, 0.44],
    [4.45, 1.55, 1.07, 0.52, 0.42],
    [1.20, 1.84, 1.12, 0.56, 0.36],
    [3.35, 1.97, 1.08, 0.53, 0.34],
    [5.55, 2.06, 1.08, 0.53, 0.30],
    [0.06, 2.34, 0.93, 0.44, 0.20],
    [2.00, 2.40, 0.78, 0.36, 0.16],
  ];
  leaves.forEach(([angle, height, length, width, radius], i) => {
    const end = new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    const start = new THREE.Vector3(0.02, 0.69 + i * 0.12, -0.01);
    group.add(tube([start, [Math.cos(angle) * radius * 0.46, height * 0.66, Math.sin(angle) * radius * 0.55], end], 0.012 + (7 - i) * 0.0008, stemMaterial));
    const leaf = blade({
      kind: 'monstera', length, width, color: palette.leaf, vein: palette.vein,
      bend: 0.13, phase: i * 1.9, seed: 150 + i,
    });
    placeBlade(leaf, end, [Math.cos(angle) * 0.66, 0.75, Math.sin(angle) * 0.66], Math.sin(i * 2) * 0.11);
    group.add(leaf);
  });
  // Aerial roots curl back into the soil, a small species-specific detail.
  group.add(tube([[0.06, 1.33, -0.035], [0.20, 1.11, -0.14], [0.27, 0.83, -0.19], [0.20, 0.67, -0.20]], 0.011, rootMaterial));
  group.add(tube([[0.075, 1.78, -0.04], [-0.11, 1.45, -0.16], [-0.17, 1.04, -0.20], [-0.13, 0.67, -0.19]], 0.008, rootMaterial));
}

function snake(group, palette) {
  const leaves = [
    [0.08, 0.03, 2.45, 0.16, 0.02], [-0.13, -0.04, 2.17, 0.175, 2.1],
    [0.14, -0.20, 2.06, 0.17, 4.5], [-0.27, -0.12, 1.85, 0.18, 3.45],
    [0.27, 0.05, 1.92, 0.16, 1.1], [-0.17, 0.24, 1.67, 0.185, 2.4],
    [0.12, 0.27, 1.57, 0.18, 0.8], [0.02, -0.26, 1.48, 0.17, 5.5],
    [-0.31, 0.07, 1.36, 0.15, 3.0], [0.28, -0.17, 1.33, 0.16, 0.3],
    [0.015, 0.105, 1.85, 0.13, 1.7],
  ];
  leaves.forEach(([x, z, length, width, angle], i) => {
    const leaf = blade({ kind: 'snake', length, width, color: palette.leaf, vein: palette.vein, phase: i * 1.1, seed: 260 + i });
    placeBlade(leaf, [x, 0.66, z], [Math.cos(angle) * (i < 3 ? 0.035 : 0.15), 1, Math.sin(angle) * 0.10]);
    leaf.rotateY(angle + 0.7);
    group.add(leaf);
  });
}

function rubber(group, palette) {
  const bark = new THREE.MeshStandardMaterial({ color: 0x716047, roughness: 0.87 });
  const petiole = new THREE.MeshStandardMaterial({ color: 0x7d6846, roughness: 0.62 });
  group.add(tube([[0, 0.66, 0], [-0.035, 1.20, 0.015], [0.04, 1.95, -0.03], [-0.015, 2.88, 0.01]], 0.027, bark, 32, 7));
  for (let i = 0; i < 11; i++) {
    const height = 1.01 + i * 0.155;
    const angle = i * 2.399 + 0.25;
    const r = i > 7 ? 0.17 : 0.22;
    const end = new THREE.Vector3(Math.cos(angle) * r, height + 0.045, Math.sin(angle) * r);
    group.add(tube([[0.015, height - 0.08, -0.01], [end.x * 0.65, height, end.z * 0.65], end], 0.01, petiole, 12));
    const length = i > 7 ? 0.70 - (i - 8) * 0.055 : 0.9 + Math.sin(i * 1.7) * 0.1;
    const leaf = blade({ kind: 'rubber', length, width: length * 0.365, color: palette.leaf, vein: palette.vein, bend: 0.065, phase: i * 0.9, seed: 375 + i });
    const roll = Math.atan2(-Math.cos(angle), Math.abs(Math.sin(angle)) * 0.6 + 0.32);
    placeBlade(leaf, end, [Math.cos(angle) * 0.84, i > 7 ? 0.72 : 0.54, Math.sin(angle) * 0.84], roll + Math.sin(i) * 0.10);
    group.add(leaf);
  }
  const fresh = blade({ kind: 'rubber', length: 0.50, width: 0.079, color: 0x73583b, vein: 0x987446, bend: 0.045, seed: 395 });
  placeBlade(fresh, [-0.014, 2.70, 0], [0.17, 1, -0.1], 0.18);
  group.add(fresh);
}

function peace(group, palette) {
  const stalk = new THREE.MeshStandardMaterial({ color: 0x758448, roughness: 0.64 });
  for (let i = 0; i < 13; i++) {
    const angle = i * 2.399 + 0.15;
    const height = 1.02 + (i % 4) * 0.155;
    const radius = 0.24 + (i % 3) * 0.045;
    const end = new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    group.add(tube([[Math.cos(angle) * 0.08, 0.66, Math.sin(angle) * 0.08], [end.x * 0.7, height * 0.79, end.z * 0.7], end], 0.0085, stalk, 18));
    const length = 1.03 + (i % 4) * 0.065;
    const leaf = blade({ kind: 'peace', length, width: 0.20 + (i % 3) * 0.018, color: palette.leaf, vein: palette.vein, bend: 0.16, phase: i * 1.2, seed: 480 + i });
    placeBlade(leaf, end, [Math.cos(angle) * 0.7, 0.72 + (i % 3) * 0.10, Math.sin(angle) * 0.7], Math.sin(i * 1.5) * 0.15);
    group.add(leaf);
  }
  const flowerCenters = [[-0.24, 2.41, 0.02, -0.38], [0.24, 2.15, 0.24, 0.35], [0.10, 2.50, -0.22, 1.75]];
  const spadixMaterial = new THREE.MeshStandardMaterial({ color: 0xddd4a5, roughness: 0.84, bumpMap: grainTexture(619, 75, 225), bumpScale: 0.006 });
  flowerCenters.forEach(([x, y, z, yaw], i) => {
    group.add(tube([[x * 0.2, 0.66, z * 0.2], [x * 0.5, 1.68, z * 0.7], [x, y, z]], 0.011, stalk, 28));
    const flower = new THREE.Group();
    flower.add(blade({ kind: 'spathe', length: 0.59, width: 0.195, color: 0xf7f4df, vein: 0xbcca8e, seed: 610 + i }));
    const spike = shadowMesh(new THREE.CylinderGeometry(0.019, 0.030, 0.32, 12, 5), spadixMaterial);
    spike.position.set(0, 0.255, 0.088);
    spike.rotation.x = 0.10;
    flower.add(spike);
    const cap = shadowMesh(new THREE.SphereGeometry(0.020, 12, 6), spadixMaterial);
    cap.position.set(0, 0.413, 0.104);
    flower.add(cap);
    placeBlade(flower, [x, y, z], [0.1 * Math.sin(yaw), 1, -0.07], yaw);
    group.add(flower);
  });
}

function batchMeshes(group) {
  // Bake leaf/petiole transforms and batch equal materials. Five simultaneously
  // visible shop previews then need only a handful of draw calls per plant.
  group.updateMatrixWorld(true);
  const batches = new Map();
  const originals = [];
  group.traverse(object => {
    if (!object.isMesh) return;
    originals.push(object);
    const m = object.material;
    const key = [m.type, m.color.getHex(), m.roughness, m.clearcoat || 0,
      m.clearcoatRoughness || 0, m.vertexColors, m.side, m.bumpMap?.uuid || '', m.bumpScale || 0].join(':');
    if (!batches.has(key)) batches.set(key, { material: m, geometries: [], name: object.name });
    batches.get(key).geometries.push(object.geometry.clone().applyMatrix4(object.matrixWorld));
  });
  group.clear();
  for (const { material, geometries, name } of batches.values()) {
    const geometry = new THREE.BufferGeometry();
    const names = Object.keys(geometries[0].attributes);
    const total = geometries.reduce((n, g) => n + g.attributes.position.count, 0);
    for (const attributeName of names) {
      const size = geometries[0].attributes[attributeName].itemSize;
      const data = new Float32Array(total * size);
      let offset = 0;
      for (const g of geometries) {
        data.set(g.attributes[attributeName].array, offset);
        offset += g.attributes[attributeName].array.length;
      }
      geometry.setAttribute(attributeName, new THREE.BufferAttribute(data, size));
    }
    const indices = [];
    let offset = 0;
    for (const g of geometries) {
      if (g.index) {
        for (const index of g.index.array) indices.push(index + offset);
      } else {
        for (let i = 0; i < g.attributes.position.count; i++) indices.push(i + offset);
      }
      offset += g.attributes.position.count;
      g.dispose();
    }
    geometry.setIndex(indices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const mesh = shadowMesh(geometry, material);
    mesh.name = name || 'Botanical surface';
    group.add(mesh);
  }
  const retained = new Set(Array.from(batches.values(), b => b.material));
  const disposedGeometry = new Set();
  for (const object of originals) {
    if (!disposedGeometry.has(object.geometry)) {
      disposedGeometry.add(object.geometry);
      object.geometry.dispose();
    }
    if (!retained.has(object.material)) object.material.dispose();
  }
}

/**
 * Returns an independently renderable THREE.Group for one shop product.
 * The pot rests on y=0; x/z are centered. No lights or cameras are included.
 * Known ids: monstera, snake, rubber, peace. Geometry/materials are disposable.
 */
export function createPlantModel(id) {
  const palette = palettes[id];
  if (!palette) throw new RangeError(`Unknown botanical model: ${id}`);
  const group = new THREE.Group();
  group.name = `ROOTED ${id}`;
  group.userData.productId = id;
  pot(group, palette.pot, 910 + Object.keys(palettes).indexOf(id));
  ({ monstera, snake, rubber, peace })[id](group, palette);
  batchMeshes(group);
  return group;
}
