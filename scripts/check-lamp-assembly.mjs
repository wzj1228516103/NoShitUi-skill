import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../ui-atlas-demo/vendor/three/three.module.js';
import { alignTaskLampAssembly } from '../ui-atlas-demo/object-lamp-assembly.js';

// Numeric regression for the pinned, originally disconnected Balance asset.
// Run with: node scripts/check-lamp-assembly.mjs
// This reconstructs real POSITION/index/TRS data without WebGL or model textures.
const source = fs.readFileSync(new URL('../ui-atlas-demo/assets/models/desk-lamp.glb', import.meta.url));
const jsonLength = source.readUInt32LE(12);
const gltf = JSON.parse(source.subarray(20, 20 + jsonLength).toString('utf8'));
const binary = source.subarray(28 + jsonLength);
const names = {
  springs: ['Task lamp | tension spring', 'Task lamp | tension spring.001'],
  rails: ['Task lamp | parallel link', 'Task lamp | parallel link.001'],
  pivots: ['Task lamp | pivot', 'Task lamp | pivot.001'],
  base: 'Lamp | weighted circular base',
  anchors: 'Task lamp | spring anchor assembly',
};

function readAccessor(index) {
  const a = gltf.accessors[index], view = gltf.bufferViews[a.bufferView];
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const bytes = { 5126: 4, 5125: 4, 5123: 2, 5121: 1 }[a.componentType];
  const read = { 5126: 'readFloatLE', 5125: 'readUInt32LE', 5123: 'readUInt16LE', 5121: 'readUInt8' }[a.componentType];
  assert.ok(size && bytes && read, 'fixture accessor must use a supported component layout');
  const data = [];
  for (let i = 0; i < a.count; i++) for (let c = 0; c < size; c++) {
    data.push(binary[read]((view.byteOffset || 0) + (a.byteOffset || 0)
      + i * (view.byteStride || size * bytes) + c * bytes));
  }
  return { data, size };
}

function fixture(sanitize = false) {
  const objects = gltf.nodes.map(node => {
    let object;
    if (node.mesh !== undefined) {
      const primitive = gltf.meshes[node.mesh].primitives[0];
      const geometry = new THREE.BufferGeometry();
      for (const [gltfName, attributeName] of [['POSITION', 'position'], ['NORMAL', 'normal']]) {
        const a = readAccessor(primitive.attributes[gltfName]);
        geometry.setAttribute(attributeName, new THREE.Float32BufferAttribute(a.data, a.size));
      }
      geometry.setIndex(readAccessor(primitive.indices).data);
      // GLTFLoader derives these bounds from the same POSITION accessor.
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    } else object = new THREE.Group();
    object.name = sanitize ? THREE.PropertyBinding.sanitizeNodeName(node.name) : node.name;
    if (sanitize) object.userData.name = node.name;
    if (node.matrix) object.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix));
    else {
      if (node.translation) object.position.fromArray(node.translation);
      if (node.rotation) object.quaternion.fromArray(node.rotation);
      if (node.scale) object.scale.fromArray(node.scale);
    }
    return object;
  });
  gltf.nodes.forEach((node, i) => node.children?.forEach(child => objects[i].add(objects[child])));
  const root = new THREE.Group();
  gltf.scenes[gltf.scene || 0].nodes.forEach(i => root.add(objects[i]));
  root.updateMatrixWorld(true);
  return root;
}

function part(root, name) {
  let found;
  root.traverse(object => {
    if (object.name === name || object.userData.name === name) found = object;
  });
  assert.ok(found, `expected assembly part: ${name}`);
  return found;
}

function uniqueVertices(mesh) {
  const p = mesh.geometry.attributes.position, unique = new Map();
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    unique.set(v.toArray().map(n => Math.round(n * 1e8)).join(','), v);
  }
  return [...unique.values()];
}

function terminalRings(mesh) {
  // Independently recover terminal octagons by axial extremity, without the
  // repair helper's hints, report coordinates, or nearest-hint algorithm.
  const vertices = uniqueVertices(mesh).sort((a, b) => a.y - b.y);
  return [vertices.slice(0, 8), vertices.slice(-8)].map(ring => {
    const center = ring.reduce((sum, p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / ring.length);
    const radii = ring.map(p => p.distanceTo(center));
    assert.ok(Math.max(...radii) - Math.min(...radii) < 1e-7, 'terminal must be a circular wire section');
    const radius = radii.reduce((a, b) => a + b) / radii.length;
    assert.ok(Math.abs(radius - 0.0018) < 1e-7, 'pinned source wire radius must remain 1.8 mm');
    return { center, radius };
  });
}

const worldVertices = mesh => uniqueVertices(mesh).map(p => p.applyMatrix4(mesh.matrixWorld));
const worldPoint = (mesh, point) => point.clone().applyMatrix4(mesh.matrixWorld);
function geometryCenter(mesh) {
  mesh.geometry.computeBoundingBox();
  return worldPoint(mesh, mesh.geometry.boundingBox.getCenter(new THREE.Vector3()));
}
function railSegment(mesh) {
  mesh.geometry.computeBoundingBox();
  return [mesh.geometry.boundingBox.min.y, mesh.geometry.boundingBox.max.y]
    .map(y => worldPoint(mesh, new THREE.Vector3(0, y, 0)));
}
function distanceToMesh(point, mesh) {
  const positions = mesh.geometry.attributes.position, indices = mesh.geometry.index;
  const vertices = Array.from({ length: positions.count }, (_, i) =>
    worldPoint(mesh, new THREE.Vector3().fromBufferAttribute(positions, i)));
  const closest = new THREE.Vector3();
  let distance = Infinity;
  for (let i = 0; i < indices.count; i += 3) {
    const triangle = new THREE.Triangle(...[0, 1, 2].map(j => vertices[indices.getX(i + j)]));
    triangle.closestPointToPoint(point, closest);
    distance = Math.min(distance, closest.distanceTo(point));
  }
  return distance;
}
function lineDistance(point, [a, b]) {
  return new THREE.Line3(a, b).closestPointToPoint(point, true, new THREE.Vector3()).distanceTo(point);
}
function axialSegment(mesh) {
  // Anchor cylinders are axially symmetric; infer their longest axis from
  // actual vertices instead of assuming which local axis the helper used.
  const points = worldVertices(mesh);
  const center = points.reduce((sum, p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / points.length);
  const offsets = points.map(p => p.clone().sub(center));
  let axis = new THREE.Vector3(1, 1, 1).normalize();
  for (let iteration = 0; iteration < 40; iteration++) {
    const next = offsets.reduce((sum, p) => sum.addScaledVector(p, p.dot(axis)), new THREE.Vector3());
    axis = next.normalize();
  }
  const projections = offsets.map(p => p.dot(axis));
  return [center.clone().addScaledVector(axis, Math.min(...projections)), center.clone().addScaledVector(axis, Math.max(...projections))];
}
function nearVector(actual, expected, message, tolerance = 1e-6) {
  assert.ok(actual.distanceTo(expected) <= tolerance,
    `${message}: distance ${actual.distanceTo(expected)} exceeds ${tolerance}`);
}
function range(points, normal) {
  const values = points.map(p => p.dot(normal));
  return [Math.min(...values), Math.max(...values)];
}
function capture(mesh) {
  return {
    object: mesh, position: mesh.position.toArray(), quaternion: mesh.quaternion.toArray(), scale: mesh.scale.toArray(),
    positions: Array.from(mesh.geometry.attributes.position.array), indices: Array.from(mesh.geometry.index.array),
  };
}
function assertUnchanged(snapshot, transform = true) {
  const { object } = snapshot;
  assert.deepEqual(Array.from(object.geometry.attributes.position.array), snapshot.positions, `${object.name}: vertices changed`);
  assert.deepEqual(Array.from(object.geometry.index.array), snapshot.indices, `${object.name}: topology changed`);
  if (transform) {
    assert.deepEqual(object.position.toArray(), snapshot.position, `${object.name}: position changed`);
    assert.deepEqual(object.quaternion.toArray(), snapshot.quaternion, `${object.name}: rotation changed`);
    assert.deepEqual(object.scale.toArray(), snapshot.scale, `${object.name}: scale changed`);
  }
}

function checkAssembly(label, root) {
  root.updateWorldMatrix(true, true);
  const springs = names.springs.map(name => part(root, name));
  const rails = names.rails.map(name => part(root, name));
  const sourceMeshes = [];
  root.traverse(object => { if (object.isMesh) sourceMeshes.push(object); });
  const snapshots = sourceMeshes.map(capture);
  const rings = springs.map(terminalRings);
  const sourceGaps = rings.flatMap((ends, spring) => ends.map(end => {
    const point = worldPoint(springs[spring], end.center);
    const distance = Math.min(...sourceMeshes.filter(mesh => !springs.includes(mesh)).map(mesh => distanceToMesh(point, mesh)));
    const diskGapBound = distance - end.radius;
    assert.ok(diskGapBound > 0.004, 'original terminal disk must demonstrably float >4 mm from all solid parts');
    return diskGapBound;
  }));

  const report = alignTaskLampAssembly(root);
  root.updateWorldMatrix(true, true);
  assert.equal(report, root.userData.taskLampAssemblyReport, 'helper must cache its report');
  assert.equal(report.springs.length, 2);
  assert.ok(Math.abs(report.pivotSpacing - 0.226) < 1e-6);
  assert.ok(Math.abs(report.springLength - 0.144) < 1e-6);
  assert.ok(report.pinHalfSpan > report.socketHalfSpan + 0.001);

  const railAxis = railSegment(rails[0])[1].sub(railSegment(rails[0])[0]).normalize();
  const railSide = rails[1].getWorldPosition(new THREE.Vector3()).sub(rails[0].getWorldPosition(new THREE.Vector3()));
  const lateral = railSide.addScaledVector(railAxis, -railSide.dot(railAxis)).normalize();
  const clearances = [];
  for (let i = 0; i < springs.length; i++) {
    const spring = springs[i], side = i === 0 ? 'left' : 'right';
    const endpoints = rings[i].map(end => worldPoint(spring, end.center));
    for (let end = 0; end < 2; end++) {
      const socket = part(root, `Task lamp | spring anchor ${end === 0 ? 'lower' : 'upper'} ${side} socket`);
      nearVector(endpoints[end], geometryCenter(socket), `${label}: ${side} terminal must meet the actual socket`);
    }
    const axis = endpoints[1].clone().sub(endpoints[0]);
    assert.ok(axis.clone().normalize().dot(railAxis) > 1 - 1e-10, 'spring axis must parallel the lower rails');
    assert.ok(Math.abs(axis.length() - report.springLength) < 1e-7, 'spring may not stretch');
    nearVector(spring.scale, new THREE.Vector3(1, 1, 1), 'spring must keep unit scale', 1e-12);
    const railRange = range(worldVertices(rails[i]), lateral);
    const springRange = range(worldVertices(spring), lateral);
    const clearance = i === 0 ? railRange[0] - springRange[1] : springRange[0] - railRange[1];
    assert.ok(clearance > 0.004, `actual spring/rail surfaces need >4 mm separating-plane clearance, got ${clearance}`);
    clearances.push(clearance);
    const entry = report.springs.find(entry => entry.name === names.springs[i]);
    assert.ok(entry && Math.abs(entry.wireRadius - rings[i][0].radius) < 1e-8, 'report wire radius must match the original wire');
  }

  const anchors = part(root, names.anchors);
  const anchorMeshes = [];
  anchors.traverse(object => { if (object.isMesh) anchorMeshes.push(object); });
  assert.equal(anchorMeshes.length, 7, 'expected two pins, four sockets and one pedestal');
  for (const level of ['lower', 'upper']) {
    const pin = part(root, `Task lamp | spring anchor ${level} cross-pin`), pinLine = axialSegment(pin);
    const sockets = ['left', 'right'].map(side => geometryCenter(part(root, `Task lamp | spring anchor ${level} ${side} socket`)));
    const station = sockets[0].clone().add(sockets[1]).multiplyScalar(0.5);
    const pinAxis = pinLine[1].clone().sub(pinLine[0]).normalize();
    nearVector(pinLine[0].clone().add(pinLine[1]).multiplyScalar(0.5), station, 'cross-pin center must coincide with socket station');
    for (const socket of sockets) assert.ok(lineDistance(socket, pinLine) < 1e-6, 'cross-pin must reach both sockets');
    for (const rail of rails) {
      const [a, b] = railSegment(rail), axis = b.clone().sub(a).normalize();
      // Intersect the rail's centerline with the plane through the pin station
      // whose normal is perpendicular to the pin and lies along the rail.
      const normal = axis.clone().addScaledVector(pinAxis, -axis.dot(pinAxis)).normalize();
      const t = station.clone().sub(a).dot(normal) / axis.dot(normal);
      const intersection = a.clone().addScaledVector(axis, t);
      assert.ok(t > 0 && t < a.distanceTo(b), 'cross-pin must intersect within the rail span');
      assert.ok(lineDistance(intersection, pinLine) < 1e-6, 'cross-pin must actually pass through both rail centerlines');
    }
  }

  const frame = springs[0].parent, inverse = frame.matrixWorld.clone().invert();
  const inFrame = mesh => worldVertices(mesh).map(p => p.applyMatrix4(inverse));
  const baseTop = Math.max(...inFrame(part(root, names.base)).map(p => p.y));
  const pivotCenter = geometryCenter(part(root, names.pivots[0])).applyMatrix4(inverse);
  const pedestalBounds = new THREE.Box3().setFromPoints(inFrame(part(root, 'Task lamp | pedestal support')));
  assert.ok(pedestalBounds.min.y <= baseTop + 1e-7 && pedestalBounds.max.y >= pivotCenter.y - 1e-7,
    'pedestal must bridge base top through the lower hinge center');
  const pedestalCenter = pedestalBounds.getCenter(new THREE.Vector3());
  assert.ok(Math.hypot(pedestalCenter.x - pivotCenter.x, pedestalCenter.z - pivotCenter.z) < 1e-7,
    'pedestal must sit under the existing lower pivot');

  for (const snapshot of snapshots) assertUnchanged(snapshot, !springs.includes(snapshot.object));
  const repaired = sourceMeshes.map(capture), children = [];
  root.traverse(object => children.push(object));
  assert.equal(alignTaskLampAssembly(root), report, 'repeat calls must return the cached report');
  const after = [];
  root.traverse(object => after.push(object));
  assert.deepEqual(after, children, 'repeat calls must not add duplicate hardware');
  repaired.forEach(snapshot => assertUnchanged(snapshot));
  console.log(`${label}: PASS; source cap disk gap bounds ${sourceGaps.map(n => (n * 1000).toFixed(2)).join('/')} mm; repaired rail clearances ${clearances.map(n => (n * 1000).toFixed(3)).join('/')} mm`);
}

checkAssembly('Raw GLB hierarchy', fixture());
const parent = new THREE.Group();
parent.position.set(1.73, -0.41, 2.2);
parent.rotation.set(0.38, -0.74, 0.21);
const transformed = fixture(true);
parent.add(transformed);
parent.updateMatrixWorld(true);
checkAssembly('Rotated/translated parent and GLTFLoader names', transformed);

console.log('All assembly geometry checks passed.');
