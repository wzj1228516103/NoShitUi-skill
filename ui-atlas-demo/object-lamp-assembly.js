import * as THREE from './vendor/three/three.module.js';

// The pinned Balance glTF is in meters. Its spring vertices were baked upright,
// independently of the inclined lower linkage. Keep that source file intact and
// seat its existing wire end caps on real pins before normalizing the preview.
const SPRINGS = [
  { name: 'Task lamp | tension spring', side: -1, endX: -0.020 },
  { name: 'Task lamp | tension spring.001', side: 1, endX: 0.032 },
];

function part(root, name) {
  let found;
  root.traverse(object => {
    if (object.isMesh && (object.userData.name === name || object.name === name
      || object.name === THREE.PropertyBinding.sanitizeNodeName(name))) found = object;
  });
  if (!found) throw new Error(`Balance assembly part is missing: ${name}`);
  return found;
}

function endRing(mesh, hint) {
  const positions = mesh.geometry.getAttribute('position');
  const vertices = new Map();
  for (let i = 0; i < positions.count; i++) {
    const point = new THREE.Vector3().fromBufferAttribute(positions, i);
    vertices.set(point.toArray().map(value => value.toFixed(7)).join(','), point);
  }
  // Each physical terminal is a capped octagonal wire section. Weld the glTF's
  // normal/UV seam duplicates, then measure the eight nearest terminal vertices.
  const ring = [...vertices.values()].sort((a, b) => a.distanceToSquared(hint) - b.distanceToSquared(hint)).slice(0, 8);
  const center = ring.reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / 8);
  const radii = ring.map(point => point.distanceTo(center));
  const radius = radii.reduce((sum, value) => sum + value, 0) / radii.length;
  if (ring.length !== 8 || center.distanceTo(hint) > 0.0001
    || radius < 0.0017 || radius > 0.0019 || Math.max(...radii) - Math.min(...radii) > 0.00001) {
    throw new Error('Balance spring terminal geometry differs from the pinned asset');
  }
  return { center, radius };
}

export function alignTaskLampAssembly(root) {
  if (root.userData.taskLampAssemblyReport) return root.userData.taskLampAssemblyReport;
  root.updateWorldMatrix(true, true);
  const springs = SPRINGS.map(spec => ({ ...spec, mesh: part(root, spec.name) }));
  const frame = springs[0].mesh.parent;
  if (springs.some(spring => spring.mesh.parent !== frame)) throw new Error('Unexpected Balance spring hierarchy');
  const rails = [part(root, 'Task lamp | parallel link'), part(root, 'Task lamp | parallel link.001')];
  const pivots = [part(root, 'Task lamp | pivot'), part(root, 'Task lamp | pivot.001')];
  const base = part(root, 'Lamp | weighted circular base');
  const inFrame = (mesh, point) => frame.worldToLocal(mesh.localToWorld(point.clone()));
  const centerOf = mesh => {
    mesh.geometry.computeBoundingBox();
    return inFrame(mesh, mesh.geometry.boundingBox.getCenter(new THREE.Vector3()));
  };
  const bottomPivot = centerOf(pivots[0]);
  const upperPivot = centerOf(pivots[1]);
  const direction = upperPivot.clone().sub(bottomPivot);
  const pivotSpacing = direction.length();
  if (pivotSpacing < 0.22 || pivotSpacing > 0.23) throw new Error('Unexpected Balance linkage dimensions');
  direction.normalize();
  // Cross-pins follow the existing hinge shafts and the two rail offsets.
  const side = centerOf(rails[1]).sub(centerOf(rails[0]));
  const railHalfGap = side.length() / 2;
  side.normalize();
  const coilRadius = 0.006;
  const socketHalfSpan = railHalfGap + coilRadius * 2;
  const pinHalfSpan = socketHalfSpan + 0.003;
  const measured = springs.map(spring => {
    const lower = endRing(spring.mesh, new THREE.Vector3(spring.endX, 0.075, -0.019));
    const upper = endRing(spring.mesh, new THREE.Vector3(spring.endX, 0.219, -0.019));
    const sourceStart = inFrame(spring.mesh, lower.center);
    const sourceEnd = inFrame(spring.mesh, upper.center);
    return { ...spring, lower, upper, sourceStart, sourceEnd, length: sourceStart.distanceTo(sourceEnd) };
  });
  const springLength = measured[0].length;
  if (Math.abs(springLength - 0.144) > 0.0001 || Math.abs(measured[1].length - springLength) > 0.00001) {
    throw new Error('Unexpected Balance spring lengths');
  }
  const lowerStation = bottomPivot.clone().addScaledVector(direction, pivotSpacing * 0.10);
  const upperStation = lowerStation.clone().addScaledVector(direction, springLength);
  const hardware = Array.isArray(springs[0].mesh.material) ? springs[0].mesh.material[0] : springs[0].mesh.material;
  const bodyMaterial = Array.isArray(base.material) ? base.material[0] : base.material;
  const anchorGroup = new THREE.Group();
  anchorGroup.name = 'Task lamp | spring anchor assembly';
  const cylinder = (name, start, end, radius, material) => {
    const axis = end.clone().sub(start);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, axis.length(), 20), material);
    mesh.name = name;
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
    mesh.castShadow = mesh.receiveShadow = true;
    anchorGroup.add(mesh);
    return mesh;
  };
  for (const [label, station] of [['lower', lowerStation], ['upper', upperStation]]) {
    cylinder(`Task lamp | spring anchor ${label} cross-pin`, station.clone().addScaledVector(side, -pinHalfSpan),
      station.clone().addScaledVector(side, pinHalfSpan), 0.0025, hardware);
    for (const sign of [-1, 1]) {
      const socket = station.clone().addScaledVector(side, sign * socketHalfSpan);
      cylinder(`Task lamp | spring anchor ${label} ${sign < 0 ? 'left' : 'right'} socket`,
        socket.clone().addScaledVector(side, -0.001), socket.clone().addScaledVector(side, 0.001), 0.0045, hardware);
    }
  }
  const report = { pivotSpacing, springLength, socketHalfSpan, pinHalfSpan, springs: [] };
  for (const spring of measured) {
    const targetStart = lowerStation.clone().addScaledVector(side, spring.side * socketHalfSpan);
    const targetEnd = upperStation.clone().addScaledVector(side, spring.side * socketHalfSpan);
    const sourceAxis = spring.sourceEnd.clone().sub(spring.sourceStart).normalize();
    const rotation = new THREE.Quaternion().setFromUnitVectors(sourceAxis, direction);
    // Roll the right-hand coil around its terminal line so both coils sit
    // outboard of their rails, with the terminal caps facing inward to the pins.
    if (spring.side > 0) rotation.multiply(new THREE.Quaternion().setFromAxisAngle(sourceAxis, Math.PI));
    const translation = targetStart.clone().sub(spring.sourceStart.clone().applyQuaternion(rotation));
    const transform = new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1));
    spring.mesh.applyMatrix4(transform);
    report.springs.push({ name: spring.name, sourceStart: spring.lower.center.toArray(), sourceEnd: spring.upper.center.toArray(),
      targetStart: targetStart.toArray(), targetEnd: targetEnd.toArray(), wireRadius: spring.lower.radius });
  }
  // The original base ends at y=.031 and its hinge begins at y=.043. Bridge
  // that 12 mm air gap with a pedestal that continues into the hinge center.
  const baseTop = inFrame(base, new THREE.Vector3(0, base.geometry.boundingBox.max.y, 0));
  const supportBottom = new THREE.Vector3(bottomPivot.x, baseTop.y, bottomPivot.z);
  cylinder('Task lamp | pedestal support', supportBottom, bottomPivot, 0.008, bodyMaterial);
  frame.add(anchorGroup);
  root.userData.taskLampAssemblyReport = report;
  root.updateWorldMatrix(true, true);
  return report;
}
