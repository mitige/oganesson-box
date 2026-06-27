import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const OGANESSON_294 = Object.freeze({
  symbol: 'Og',
  atomicNumber: 118,
  massNumber: 294,
  protons: 118,
  neutrons: 176,
  electrons: 118,
  electronShells: [2, 8, 18, 32, 32, 18, 8],
  upQuarks: 412,
  downQuarks: 470
});

const DETAIL = Object.freeze({
  ATOMS: 0,
  ELECTRONS: 1,
  NUCLEONS: 2,
  QUARKS: 3
});

const DETAIL_LABELS = ['Atoms', 'Electron shells', 'Nucleons', 'Quarks'];
const BOX_HALF = 12;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const config = {
  atomCount: 12,
  atomRadius: 1.05,
  nucleusRadius: 0.28,
  sigma: 2.28,
  epsilon: 0.7,
  temperature: 0.65,
  damping: 0.992,
  contrast: 0.55,
  autoRotate: false
};

const sceneHost = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d10);
scene.fog = new THREE.FogExp2(0x0b0d10, 0.018);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.05, 180);
camera.position.set(20, 13, 22);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
sceneHost.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.minDistance = 2.8;
controls.maxDistance = 58;
controls.autoRotate = config.autoRotate;
controls.autoRotateSpeed = 0.32;

scene.add(new THREE.HemisphereLight(0xbfc7d1, 0x161b21, 1.45));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(8, 14, 10);
scene.add(keyLight);
const sideLight = new THREE.PointLight(0x8aa6c7, 30, 70, 2);
sideLight.position.set(-13, 3, -9);
scene.add(sideLight);

const atomGroup = new THREE.Group();
scene.add(atomGroup);

const boxGroup = new THREE.Group();
scene.add(boxGroup);

const boxGeometry = new THREE.BoxGeometry(BOX_HALF * 2, BOX_HALF * 2, BOX_HALF * 2);
const boxFaceMaterial = new THREE.MeshBasicMaterial({
  color: 0x9aa6b2,
  transparent: true,
  opacity: 0.035,
  side: THREE.BackSide,
  depthWrite: false
});
boxGroup.add(new THREE.Mesh(boxGeometry, boxFaceMaterial));

const boxEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(boxGeometry),
  new THREE.LineBasicMaterial({ color: 0x9aa6b2, transparent: true, opacity: 0.42 })
);
boxGroup.add(boxEdges);

const grid = new THREE.GridHelper(BOX_HALF * 2, 12, 0x4b5563, 0x252c34);
grid.position.y = -BOX_HALF;
grid.material.transparent = true;
grid.material.opacity = 0.38;
scene.add(grid);

const envelopeGeometry = new THREE.SphereGeometry(config.atomRadius, 40, 24);
const protonGeometry = new THREE.SphereGeometry(0.027, 10, 8);
const neutronGeometry = new THREE.SphereGeometry(0.026, 10, 8);
const electronGeometry = new THREE.SphereGeometry(0.018, 8, 6);
const quarkGeometry = new THREE.SphereGeometry(0.011, 8, 6);

const protonMaterial = new THREE.MeshStandardMaterial({
  color: 0xd85c4a,
  emissive: 0x4a140d,
  emissiveIntensity: 0.18,
  roughness: 0.48,
  metalness: 0.05
});
const neutronMaterial = new THREE.MeshStandardMaterial({
  color: 0xa8adb4,
  emissive: 0x15171a,
  emissiveIntensity: 0.08,
  roughness: 0.62,
  metalness: 0.03
});
const electronMaterial = new THREE.MeshStandardMaterial({
  color: 0x76c6d7,
  emissive: 0x173c45,
  emissiveIntensity: 0.35,
  roughness: 0.25
});
const upQuarkMaterial = new THREE.MeshStandardMaterial({
  color: 0xe3b55f,
  emissive: 0x4b3510,
  emissiveIntensity: 0.24,
  roughness: 0.35
});
const downQuarkMaterial = new THREE.MeshStandardMaterial({
  color: 0x8da7ff,
  emissive: 0x1d2b62,
  emissiveIntensity: 0.24,
  roughness: 0.35
});
const shellMaterial = new THREE.LineBasicMaterial({
  color: 0x607080,
  transparent: true,
  opacity: 0.23
});

const tmpVec = new THREE.Vector3();
const tmpVecB = new THREE.Vector3();
const tmpMatrix = new THREE.Matrix4();
const tmpQuaternion = new THREE.Quaternion();
const tmpScale = new THREE.Vector3(1, 1, 1);
const tmpEuler = new THREE.Euler();

const baseNucleons = createNucleonLayout();
const baseElectrons = createElectronLayout();
const baseQuarks = createQuarkLayout(baseNucleons);

const atoms = [];
let currentDetail = -1;
let frames = 0;
let lastFpsTime = performance.now();

const ui = {
  count: document.getElementById('count'),
  countVal: document.getElementById('countVal'),
  temp: document.getElementById('temp'),
  tempVal: document.getElementById('tempVal'),
  inter: document.getElementById('inter'),
  interVal: document.getElementById('interVal'),
  glow: document.getElementById('glow'),
  glowVal: document.getElementById('glowVal'),
  rotate: document.getElementById('rotate'),
  reset: document.getElementById('reset'),
  levelLabel: document.getElementById('levelLabel'),
  fps: document.getElementById('fps')
};

function createNucleonLayout() {
  const positions = fibonacciBall(OGANESSON_294.protons + OGANESSON_294.neutrons, config.nucleusRadius);
  const nucleons = [];
  let protons = 0;
  let neutrons = 0;

  for (let i = 0; i < positions.length; i += 1) {
    const targetProtons = Math.round(((i + 1) * OGANESSON_294.protons) / positions.length);
    const isProton = protons < targetProtons || neutrons >= OGANESSON_294.neutrons;
    if (isProton) protons += 1;
    else neutrons += 1;

    nucleons.push({
      type: isProton ? 'proton' : 'neutron',
      position: positions[i],
      phase: i * 0.39,
      jitter: 0.0035 + (i % 7) * 0.0006
    });
  }

  return nucleons;
}

function createElectronLayout() {
  const electrons = [];
  const shellCount = OGANESSON_294.electronShells.length;
  const inner = 0.43;
  const outer = 0.98;

  OGANESSON_294.electronShells.forEach((count, shellIndex) => {
    const radius = inner + ((outer - inner) * shellIndex) / Math.max(1, shellCount - 1);
    for (let i = 0; i < count; i += 1) {
      const phase = (i / count) * Math.PI * 2 + shellIndex * 0.41;
      tmpEuler.set(
        (shellIndex * 0.31 + i * 0.17) % Math.PI,
        (shellIndex * 0.19 + i * 0.11) % Math.PI,
        (shellIndex * 0.23 + i * 0.07) % Math.PI
      );
      electrons.push({
        shell: shellIndex,
        radius,
        phase,
        speed: 0.18 + shellIndex * 0.025 + (i % 5) * 0.01,
        plane: new THREE.Quaternion().setFromEuler(tmpEuler)
      });
    }
  });

  return electrons;
}

function createQuarkLayout(nucleons) {
  const up = [];
  const down = [];
  const offsetRadius = 0.018;

  nucleons.forEach((nucleon, nucleonIndex) => {
    const types = nucleon.type === 'proton' ? ['up', 'up', 'down'] : ['up', 'down', 'down'];
    for (let i = 0; i < 3; i += 1) {
      const angle = (i / 3) * Math.PI * 2 + nucleonIndex * 0.071;
      const record = {
        parent: nucleon.position,
        offset: new THREE.Vector3(
          Math.cos(angle) * offsetRadius,
          Math.sin(angle * 1.7) * offsetRadius * 0.58,
          Math.sin(angle) * offsetRadius
        ),
        phase: nucleonIndex * 0.13 + i * 1.9,
        speed: 1.1 + ((nucleonIndex + i) % 9) * 0.025
      };

      if (types[i] === 'up') up.push(record);
      else down.push(record);
    }
  });

  return { up, down };
}

function fibonacciBall(count, radius) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const y = 1 - 2 * t;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GOLDEN_ANGLE;
    const r = radius * Math.cbrt(t);
    points.push(new THREE.Vector3(
      Math.cos(theta) * radial * r,
      y * r,
      Math.sin(theta) * radial * r
    ));
  }
  return points;
}

function createInstancedMesh(geometry, material, count) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  return mesh;
}

function createEnvelopeMaterial(atomIndex) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.58 + (atomIndex % 5) * 0.015, 0.12, 0.48),
    emissive: 0x121922,
    emissiveIntensity: 0.08,
    roughness: 0.55,
    metalness: 0.08,
    transparent: true,
    opacity: 0.26,
    depthWrite: false
  });
  material.userData.owned = true;
  return material;
}

function createShellGuides() {
  const group = new THREE.Group();
  const inner = 0.43;
  const outer = 0.98;
  const shellCount = OGANESSON_294.electronShells.length;

  OGANESSON_294.electronShells.forEach((_, shellIndex) => {
    const radius = inner + ((outer - inner) * shellIndex) / Math.max(1, shellCount - 1);
    const line = createCircleLine(radius);
    line.rotation.x = Math.PI / 2;
    line.rotation.z = shellIndex * 0.32;
    group.add(line);

    if (shellIndex % 2 === 0) {
      const crossLine = createCircleLine(radius);
      crossLine.rotation.y = Math.PI / 2;
      crossLine.rotation.x = shellIndex * 0.18;
      group.add(crossLine);
    }
  });

  return group;
}

function createCircleLine(radius) {
  const points = [];
  const segments = 128;
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(geometry, shellMaterial);
  line.userData.ownedGeometry = true;
  return line;
}

function createAtom(position, atomIndex) {
  const group = new THREE.Group();
  group.position.copy(position);

  const envelope = new THREE.Mesh(envelopeGeometry, createEnvelopeMaterial(atomIndex));
  group.add(envelope);

  const shellGuides = createShellGuides();
  group.add(shellGuides);

  const protonMesh = createInstancedMesh(protonGeometry, protonMaterial, OGANESSON_294.protons);
  const neutronMesh = createInstancedMesh(neutronGeometry, neutronMaterial, OGANESSON_294.neutrons);
  const electronMesh = createInstancedMesh(electronGeometry, electronMaterial, OGANESSON_294.electrons);
  const upQuarkMesh = createInstancedMesh(quarkGeometry, upQuarkMaterial, OGANESSON_294.upQuarks);
  const downQuarkMesh = createInstancedMesh(quarkGeometry, downQuarkMaterial, OGANESSON_294.downQuarks);

  group.add(protonMesh, neutronMesh, electronMesh, upQuarkMesh, downQuarkMesh);
  atomGroup.add(group);

  const atom = {
    group,
    envelope,
    shellGuides,
    protonMesh,
    neutronMesh,
    electronMesh,
    upQuarkMesh,
    downQuarkMesh,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.34 * config.temperature,
      (Math.random() - 0.5) * 0.34 * config.temperature,
      (Math.random() - 0.5) * 0.34 * config.temperature
    ),
    force: new THREE.Vector3(),
    phase: atomIndex * 0.61
  };

  updateNucleonMatrices(atom, 0);
  updateElectronMatrices(atom, 0);
  updateQuarkMatrices(atom, 0);
  atoms.push(atom);
}

function disposeAtom(atom) {
  atom.group.traverse((object) => {
    if (object.userData.ownedGeometry && object.geometry) object.geometry.dispose();
    if (object.material?.userData?.owned) object.material.dispose();
  });
  atomGroup.remove(atom.group);
}

function spawnAtoms(count) {
  while (atoms.length) disposeAtom(atoms.pop());

  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const position = randomPointInBox(positions);
    positions.push(position);
    createAtom(position, i);
  }

  currentDetail = -1;
  applyDetailLevel(computeDetailLevel());
}

function randomPointInBox(existingPositions) {
  const margin = config.atomRadius * 1.35;
  const minDistance = config.sigma * 0.85;

  for (let attempt = 0; attempt < 140; attempt += 1) {
    const point = new THREE.Vector3(
      THREE.MathUtils.randFloat(-BOX_HALF + margin, BOX_HALF - margin),
      THREE.MathUtils.randFloat(-BOX_HALF + margin, BOX_HALF - margin),
      THREE.MathUtils.randFloat(-BOX_HALF + margin, BOX_HALF - margin)
    );
    const ok = existingPositions.every((other) => point.distanceTo(other) >= minDistance);
    if (ok) return point;
  }

  return new THREE.Vector3(
    THREE.MathUtils.randFloat(-BOX_HALF + margin, BOX_HALF - margin),
    THREE.MathUtils.randFloat(-BOX_HALF + margin, BOX_HALF - margin),
    THREE.MathUtils.randFloat(-BOX_HALF + margin, BOX_HALF - margin)
  );
}

function updateNucleonMatrices(atom, time) {
  let protonIndex = 0;
  let neutronIndex = 0;

  for (const nucleon of baseNucleons) {
    const jitter = Math.sin(time * 1.7 + atom.phase + nucleon.phase) * nucleon.jitter;
    tmpVec.copy(nucleon.position).addScaledVector(nucleon.position, jitter);
    tmpQuaternion.identity();
    tmpMatrix.compose(tmpVec, tmpQuaternion, tmpScale);

    if (nucleon.type === 'proton') {
      atom.protonMesh.setMatrixAt(protonIndex, tmpMatrix);
      protonIndex += 1;
    } else {
      atom.neutronMesh.setMatrixAt(neutronIndex, tmpMatrix);
      neutronIndex += 1;
    }
  }

  atom.protonMesh.instanceMatrix.needsUpdate = true;
  atom.neutronMesh.instanceMatrix.needsUpdate = true;
}

function updateElectronMatrices(atom, time) {
  baseElectrons.forEach((electron, index) => {
    const angle = electron.phase + time * electron.speed + atom.phase * 0.21;
    tmpVec.set(
      Math.cos(angle) * electron.radius,
      Math.sin(angle * 0.73 + electron.shell) * electron.radius * 0.08,
      Math.sin(angle) * electron.radius
    );
    tmpVec.applyQuaternion(electron.plane);
    tmpQuaternion.identity();
    tmpMatrix.compose(tmpVec, tmpQuaternion, tmpScale);
    atom.electronMesh.setMatrixAt(index, tmpMatrix);
  });

  atom.electronMesh.instanceMatrix.needsUpdate = true;
}

function updateQuarkMatrices(atom, time) {
  baseQuarks.up.forEach((quark, index) => {
    writeQuarkMatrix(atom.upQuarkMesh, index, quark, time, atom.phase);
  });
  baseQuarks.down.forEach((quark, index) => {
    writeQuarkMatrix(atom.downQuarkMesh, index, quark, time, atom.phase);
  });

  atom.upQuarkMesh.instanceMatrix.needsUpdate = true;
  atom.downQuarkMesh.instanceMatrix.needsUpdate = true;
}

function writeQuarkMatrix(mesh, index, quark, time, atomPhase) {
  const spin = Math.sin(time * quark.speed + quark.phase + atomPhase) * 0.006;
  tmpVec.copy(quark.parent);
  tmpVecB.copy(quark.offset).multiplyScalar(1 + spin);
  tmpVec.add(tmpVecB);
  tmpQuaternion.identity();
  tmpMatrix.compose(tmpVec, tmpQuaternion, tmpScale);
  mesh.setMatrixAt(index, tmpMatrix);
}

function physicsStep(dt) {
  const cutoff = config.sigma * 2.8;
  const cutoffSq = cutoff * cutoff;
  const wallLimit = BOX_HALF - config.atomRadius;

  atoms.forEach((atom) => atom.force.set(0, 0, 0));

  for (let i = 0; i < atoms.length; i += 1) {
    for (let j = i + 1; j < atoms.length; j += 1) {
      const a = atoms[i];
      const b = atoms[j];
      tmpVec.subVectors(a.group.position, b.group.position);
      const rSq = Math.max(tmpVec.lengthSq(), 0.18);
      if (rSq > cutoffSq) continue;

      const r = Math.sqrt(rSq);
      const sr = config.sigma / r;
      const sr6 = sr ** 6;
      const sr12 = sr6 * sr6;
      let forceMagnitude = (24 * config.epsilon / r) * (2 * sr12 - sr6);
      forceMagnitude = THREE.MathUtils.clamp(forceMagnitude, -18, 26);

      tmpVec.multiplyScalar(forceMagnitude / r);
      a.force.add(tmpVec);
      b.force.sub(tmpVec);
    }
  }

  atoms.forEach((atom) => {
    atom.velocity.x += (Math.random() - 0.5) * 0.018 * config.temperature;
    atom.velocity.y += (Math.random() - 0.5) * 0.018 * config.temperature;
    atom.velocity.z += (Math.random() - 0.5) * 0.018 * config.temperature;

    atom.velocity.addScaledVector(atom.force, dt);
    atom.velocity.multiplyScalar(config.damping);
    if (atom.velocity.lengthSq() > 11 * 11) atom.velocity.setLength(11);

    atom.group.position.addScaledVector(atom.velocity, dt);

    ['x', 'y', 'z'].forEach((axis) => {
      if (atom.group.position[axis] > wallLimit) {
        atom.group.position[axis] = wallLimit;
        atom.velocity[axis] = -Math.abs(atom.velocity[axis]) * 0.88;
      } else if (atom.group.position[axis] < -wallLimit) {
        atom.group.position[axis] = -wallLimit;
        atom.velocity[axis] = Math.abs(atom.velocity[axis]) * 0.88;
      }
    });
  });
}

function computeDetailLevel() {
  const distance = camera.position.distanceTo(controls.target);
  if (distance < 5.2) return DETAIL.QUARKS;
  if (distance < 9.2) return DETAIL.NUCLEONS;
  if (distance < 17) return DETAIL.ELECTRONS;
  return DETAIL.ATOMS;
}

function applyDetailLevel(level) {
  if (level === currentDetail) return;
  currentDetail = level;

  atoms.forEach((atom) => {
    atom.envelope.visible = true;
    atom.envelope.material.opacity = level === DETAIL.ATOMS ? 0.28 : 0.08;
    atom.shellGuides.visible = level >= DETAIL.ELECTRONS;
    atom.electronMesh.visible = level >= DETAIL.ELECTRONS;
    atom.protonMesh.visible = level >= DETAIL.NUCLEONS;
    atom.neutronMesh.visible = level >= DETAIL.NUCLEONS;
    atom.upQuarkMesh.visible = level === DETAIL.QUARKS;
    atom.downQuarkMesh.visible = level === DETAIL.QUARKS;
  });

  ui.levelLabel.textContent = DETAIL_LABELS[level];
}

function applyContrast() {
  const c = config.contrast;
  protonMaterial.emissiveIntensity = 0.08 + c * 0.18;
  neutronMaterial.emissiveIntensity = 0.03 + c * 0.07;
  electronMaterial.emissiveIntensity = 0.18 + c * 0.52;
  upQuarkMaterial.emissiveIntensity = 0.1 + c * 0.42;
  downQuarkMaterial.emissiveIntensity = 0.1 + c * 0.42;
  atoms.forEach((atom) => {
    atom.envelope.material.emissiveIntensity = 0.03 + c * 0.1;
  });
}

function updateAtomVisuals() {
  atoms.forEach((atom) => {
    const speed = atom.velocity.length();
    const heat = THREE.MathUtils.clamp(speed / 4.5, 0, 1);
    atom.envelope.material.color.setHSL(0.58 - heat * 0.07, 0.12 + heat * 0.12, 0.45 + heat * 0.08);
  });
}

function bindUi() {
  ui.count.addEventListener('input', (event) => {
    config.atomCount = Number(event.target.value);
    ui.countVal.textContent = String(config.atomCount);
    spawnAtoms(config.atomCount);
  });

  ui.temp.addEventListener('input', (event) => {
    config.temperature = Number(event.target.value);
    ui.tempVal.textContent = config.temperature.toFixed(2);
  });

  ui.inter.addEventListener('input', (event) => {
    config.epsilon = Number(event.target.value);
    ui.interVal.textContent = config.epsilon.toFixed(2);
  });

  ui.glow.addEventListener('input', (event) => {
    config.contrast = Number(event.target.value);
    ui.glowVal.textContent = config.contrast.toFixed(2);
    applyContrast();
  });

  ui.rotate.addEventListener('click', toggleRotation);
  ui.rotate.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleRotation();
    }
  });

  ui.reset.addEventListener('click', () => spawnAtoms(config.atomCount));
}

function toggleRotation() {
  config.autoRotate = !config.autoRotate;
  controls.autoRotate = config.autoRotate;
  ui.rotate.classList.toggle('on', config.autoRotate);
  ui.rotate.setAttribute('aria-checked', String(config.autoRotate));
}

function updateFps() {
  const now = performance.now();
  const elapsed = now - lastFpsTime;
  if (elapsed < 750) return;

  const fps = Math.round((frames * 1000) / elapsed);
  ui.fps.textContent = `${fps} fps`;
  frames = 0;
  lastFpsTime = now;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.033);
  const substeps = 2;
  for (let i = 0; i < substeps; i += 1) physicsStep(dt / substeps);

  const detail = computeDetailLevel();
  applyDetailLevel(detail);

  const time = clock.elapsedTime;
  atoms.forEach((atom) => {
    if (detail >= DETAIL.NUCLEONS) updateNucleonMatrices(atom, time);
    if (detail >= DETAIL.ELECTRONS) updateElectronMatrices(atom, time);
    if (detail === DETAIL.QUARKS) updateQuarkMatrices(atom, time);
  });
  updateAtomVisuals();

  controls.update();
  renderer.render(scene, camera);
  frames += 1;
  updateFps();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

bindUi();
applyContrast();
spawnAtoms(config.atomCount);
animate();
