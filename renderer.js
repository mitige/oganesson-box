// =============================================================
//  Oganesson Box — rendu 3D + physique + structure subatomique
//  Three.js (modules via importmap dans index.html)
//
//  Niveaux de détail révélés au zoom :
//    L0  Atome        : sphère émissive rouge + halo (vue par défaut)
//    L1  Noyau        : protons (rouge vif) + neutrons (gris chaud)
//                       + électrons (points brillants) en orbite
//    L2  Quarks       : chaque nucléon se décompose en 3 quarks
//                       (u rouge, d vert, b rouge) reliés par gluons
// =============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------- Configuration (pilotée par l'UI) ----------
const config = {
  atomCount: 28,
  atomRadius: 0.55,
  sigma: 1.9,
  epsilon: 1.0,
  repulsion: 1.0,
  temperature: 1.0,
  damping: 0.995,
  glow: 0.8,
  autoRotate: true
};

const BOX_SIZE = 11;
const HALF = BOX_SIZE - config.atomRadius;

// ---------- Scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06030a);
scene.fog = new THREE.FogExp2(0x06030a, 0.018);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(20, 13, 22);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.getElementById('scene').appendChild(renderer.domElement);

// ---------- Contrôles caméra ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.5;   // zoom très proche pour révéler les quarks
controls.maxDistance = 60;
controls.autoRotate = config.autoRotate;
controls.autoRotateSpeed = 0.45;

// ---------- Lumières ----------
scene.add(new THREE.AmbientLight(0x331122, 0.6));

const keyLight = new THREE.PointLight(0xff2a2a, 120, 80, 2);
keyLight.position.set(12, 14, 10);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xff5544, 60, 80, 2);
rimLight.position.set(-14, -6, -12);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xffccaa, 0.25);
fillLight.position.set(0, 20, 0);
scene.add(fillLight);

// ---------- La boîte (parois de verre) ----------
const boxGroup = new THREE.Group();
scene.add(boxGroup);

const glassGeo = new THREE.BoxGeometry(BOX_SIZE * 2, BOX_SIZE * 2, BOX_SIZE * 2);
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x2a0a12,
  metalness: 0.0,
  roughness: 0.05,
  transmission: 0.92,
  thickness: 1.2,
  transparent: true,
  opacity: 0.10,
  side: THREE.BackSide,
  ior: 1.4,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});
const glassBox = new THREE.Mesh(glassGeo, glassMat);
boxGroup.add(glassBox);

const edges = new THREE.EdgesGeometry(glassGeo);
const edgeMat = new THREE.LineBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0.55 });
const edgeLines = new THREE.LineSegments(edges, edgeMat);
boxGroup.add(edgeLines);

const floorGeo = new THREE.CircleGeometry(BOX_SIZE * 2.2, 64);
const floorMat = new THREE.MeshBasicMaterial({
  color: 0xff1a1a, transparent: true, opacity: 0.10, side: THREE.DoubleSide
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -BOX_SIZE - 0.01;
scene.add(floor);

// ---------- Poussière atmosphérique ----------
const dustCount = 350;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3]     = (Math.random() - 0.5) * BOX_SIZE * 3.5;
  dustPos[i * 3 + 1] = (Math.random() - 0.5) * BOX_SIZE * 3.5;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * BOX_SIZE * 3.5;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xff6644, size: 0.06, transparent: true, opacity: 0.5,
  blending: THREE.AdditiveBlending, depthWrite: false
});
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// =============================================================
//  Structure subatomique de l'oganesson (Z=118, N=118 approx)
//  Og-294 : 118 protons, ~176 neutrons. Pour la lisibilité on
//  compacte visuellement : un noyau dense + quelques électrons.
// =============================================================
const OGANESSON = {
  Z: 118,            // protons / électrons
  neutrons: 28       // neutrons visuels (compacté pour la lisibilité)
};

// Palette quarks
const QUARK = {
  up:   new THREE.Color(0xff3b3b),   // u — rouge
  down: new THREE.Color(0x36d77f),   // d — vert
  btm:  new THREE.Color(0xff8a3b)    // b — bottom (Og est lourd) / orange
};

const COLOR_CORE = new THREE.Color(0x5a0000);
const COLOR_GLOW = new THREE.Color(0xff1e1e);
const COLOR_HOT  = new THREE.Color(0xff7a5a);

const atomGroup = new THREE.Group();
scene.add(atomGroup);

const atomGeo = new THREE.SphereGeometry(config.atomRadius, 48, 48);
const haloTex = makeRadialTexture();

const atoms = []; // structures atomiques complètes

// ---------- Géométries réutilisées ----------
const protonGeo  = new THREE.SphereGeometry(0.11, 20, 20);
const neutronGeo = new THREE.SphereGeometry(0.11, 20, 20);
const electronGeo = new THREE.SphereGeometry(0.055, 14, 14);
const quarkGeo   = new THREE.SphereGeometry(0.045, 12, 12);

const protonMat = new THREE.MeshStandardMaterial({
  color: 0xff2a2a, emissive: 0xff0000, emissiveIntensity: 2.0,
  metalness: 0.2, roughness: 0.35
});
const neutronMat = new THREE.MeshStandardMaterial({
  color: 0x9a8a86, emissive: 0x44332e, emissiveIntensity: 0.5,
  metalness: 0.3, roughness: 0.5
});
const electronMat = new THREE.MeshStandardMaterial({
  color: 0xfff0e8, emissive: 0xff6a3a, emissiveIntensity: 3.0,
  metalness: 0.0, roughness: 0.2
});
const quarkMats = {
  up:   new THREE.MeshStandardMaterial({ color: QUARK.up, emissive: QUARK.up, emissiveIntensity: 1.8, roughness: 0.4 }),
  down: new THREE.MeshStandardMaterial({ color: QUARK.down, emissive: QUARK.down, emissiveIntensity: 1.8, roughness: 0.4 }),
  btm:  new THREE.MeshStandardMaterial({ color: QUARK.btm, emissive: QUARK.btm, emissiveIntensity: 1.8, roughness: 0.4 })
};

// ---------- Création d'un atome complet ----------
function createAtom(x, y, z) {
  // --- Niveau 0 : l'atome (sphère + halo) ---
  const mat = new THREE.MeshStandardMaterial({
    color: COLOR_CORE.clone(),
    emissive: COLOR_GLOW.clone(),
    emissiveIntensity: 2.4,
    metalness: 0.15,
    roughness: 0.32
  });
  const mesh = new THREE.Mesh(atomGeo, mat);
  mesh.position.set(x, y, z);

  const glowMat = new THREE.SpriteMaterial({
    map: haloTex,
    color: COLOR_HOT.clone(),
    transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(config.atomRadius * 6, config.atomRadius * 6, 1);
  mesh.add(glow);

  // Conteneur pour le noyau (L1) — reste au centre de l'atome
  const nucleusGroup = new THREE.Group();
  mesh.add(nucleusGroup);

  // --- Niveau 1 : noyau (protons + neutrons) ---
  const nucleons = [];
  const nProtons = OGANESSON.Z;
  const nNeutrons = OGANESSON.neutrons;

  // On génère des positions compactes pseudo-aléatoires dans une sphère
  for (let p = 0; p < nProtons; p++) {
    const pos = randomInSphere(0.42);
    const m = new THREE.Mesh(protonGeo, protonMat);
    m.position.copy(pos);
    m.userData.spin = Math.random() * Math.PI * 2;
    m.userData.spinAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    nucleusGroup.add(m);
    nucleons.push({ mesh: m, type: 'proton', basePos: pos.clone() });
  }
  for (let n = 0; n < nNeutrons; n++) {
    const pos = randomInSphere(0.42);
    const m = new THREE.Mesh(neutronGeo, neutronMat);
    m.position.copy(pos);
    m.userData.spin = Math.random() * Math.PI * 2;
    m.userData.spinAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    nucleusGroup.add(m);
    nucleons.push({ mesh: m, type: 'neutron', basePos: pos.clone() });
  }

  // --- Niveau 2 : quarks (3 par nucléon, mais on n'en génère que pour
  //     un sous-ensemble pour la lisibilité/perf — le noyau visible) ---
  const quarkCount = 12; // 4 nucléons × 3 quarks
  const quarks = [];
  for (let i = 0; i < quarkCount; i++) {
    const type = (i % 3 === 0) ? 'up' : (i % 3 === 1) ? 'down' : 'btm';
    const m = new THREE.Mesh(quarkGeo, quarkMats[type]);
    m.visible = false;
    nucleusGroup.add(m);
    const angle = (i / quarkCount) * Math.PI * 2;
    quarks.push({
      mesh: m,
      angle,
      radius: 0.18 + Math.random() * 0.06,
      speed: 0.8 + Math.random() * 1.2,
      tilt: (Math.random() - 0.5) * 0.6
    });
  }

  // --- Niveau 1 : électrons en orbite ---
  const electrons = [];
  const nElectrons = 12; // compacté pour la lisibilité
  for (let e = 0; e < nElectrons; e++) {
    const m = new THREE.Mesh(electronGeo, electronMat);
    const shell = 1 + (e % 3);             // couches K, L, M
    const radius = shell * 0.35 + 0.15;
    const tiltX = (Math.random() - 0.5) * 1.2;
    const tiltZ = (Math.random() - 0.5) * 1.2;
    const phase = Math.random() * Math.PI * 2;
    const speed = 3.0 / shell + Math.random();
    m.userData = { shell, radius, tiltX, tiltZ, phase, speed };
    mesh.add(m);
    electrons.push(m);

    // petite traînée orbitale (cercle)
    if (e < 6) {
      const ringGeo = new THREE.RingGeometry(radius - 0.008, radius + 0.008, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff5544, transparent: true, opacity: 0.15,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.z = tiltZ;
      ring.visible = false;
      mesh.add(ring);
      m.userData.ring = ring;
    }
  }

  atomGroup.add(mesh);

  atoms.push({
    mesh, glow, glowMat, mat,
    nucleusGroup, nucleons, quarks, electrons,
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 0.4 * config.temperature,
      (Math.random() - 0.5) * 0.4 * config.temperature,
      (Math.random() - 0.5) * 0.4 * config.temperature
    )
  });
}

function randomInSphere(r) {
  let v;
  do {
    v = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
  } while (v.lengthSq() > 1);
  return v.multiplyScalar(r);
}

function spawnAtoms(n) {
  while (atoms.length) {
    const a = atoms.pop();
    atomGroup.remove(a.mesh);
    a.mat.dispose();
    a.glowMat.dispose();
  }
  for (let i = 0; i < n; i++) {
    const p = randomPointInBox();
    createAtom(p.x, p.y, p.z);
  }
}

function randomPointInBox() {
  const m = config.atomRadius * 1.5;
  return new THREE.Vector3(
    (Math.random() - 0.5) * (HALF * 2 - m) * 0.8,
    (Math.random() - 0.5) * (HALF * 2 - m) * 0.8,
    (Math.random() - 0.5) * (HALF * 2 - m) * 0.8
  );
}

// Texture radiale pour le halo
function makeRadialTexture() {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,90,60,0.9)');
  g.addColorStop(0.5, 'rgba(255,30,30,0.4)');
  g.addColorStop(1.0, 'rgba(120,0,0,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- Post-traitement (bloom) ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  config.glow, 0.7, 0.15
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- Physique : Lennard-Jones adouci ----------
const tmpDir = new THREE.Vector3();

function physicsStep(dt) {
  const n = atoms.length;
  const sigma = config.sigma;
  const eps = config.epsilon;
  const cutoff = sigma * 2.5;
  const cutoff2 = cutoff * cutoff;

  for (let i = 0; i < n; i++) atoms[i].force = new THREE.Vector3();

  for (let i = 0; i < n; i++) {
    const ai = atoms[i];
    for (let j = i + 1; j < n; j++) {
      const aj = atoms[j];
      tmpDir.subVectors(ai.mesh.position, aj.mesh.position);
      const r2 = tmpDir.lengthSq();
      if (r2 > cutoff2 || r2 < 1e-6) continue;

      const r = Math.sqrt(r2);
      const sr  = sigma / r;
      const sr6 = sr ** 6;
      const sr12 = sr6 * sr6;
      let fmag = (24 * eps / r) * (2 * sr12 - sr6) * config.repulsion;
      fmag = Math.max(-40, Math.min(40, fmag));

      tmpDir.multiplyScalar(fmag / r);
      ai.force.add(tmpDir);
      aj.force.sub(tmpDir);
    }
  }

  const restitution = 0.9;
  for (let i = 0; i < n; i++) {
    const a = atoms[i];
    const p = a.mesh.position;

    a.vel.x += (Math.random() - 0.5) * 0.02 * config.temperature;
    a.vel.y += (Math.random() - 0.5) * 0.02 * config.temperature;
    a.vel.z += (Math.random() - 0.5) * 0.02 * config.temperature;

    a.vel.addScaledVector(a.force, dt);
    a.vel.multiplyScalar(config.damping);

    const vmax = 30;
    if (a.vel.lengthSq() > vmax * vmax) a.vel.setLength(vmax);

    p.addScaledVector(a.vel, dt);

    ['x', 'y', 'z'].forEach(axis => {
      if (p[axis] > HALF) {
        p[axis] = HALF;
        a.vel[axis] = -Math.abs(a.vel[axis]) * restitution;
      } else if (p[axis] < -HALF) {
        p[axis] = -HALF;
        a.vel[axis] = Math.abs(a.vel[axis]) * restitution;
      }
    });
  }
}

// =============================================================
//  Gestion des niveaux de détail selon le zoom
// =============================================================
// Seuils de distance caméra->cible pour basculer de niveau
const LOD = {
  LEVEL_ATOM: 0,    // vue par défaut : atomes
  LEVEL_NUCLEUS: 1,  // protons/neutrons + électrons
  LEVEL_QUARK: 2,   // quarks
  // distances de la cible OrbitControls
  dNucleus: 5.5,    // < 5.5  -> noyau
  dQuark: 2.6       // < 2.6  -> quarks
};

let currentLevel = LOD.LEVEL_ATOM;

function computeLevel() {
  const dist = controls.getDistance();
  if (dist < LOD.dQuark) return LOD.LEVEL_QUARK;
  if (dist < LOD.dNucleus) return LOD.LEVEL_NUCLEUS;
  return LOD.LEVEL_ATOM;
}

function applyLevel(level) {
  if (level === currentLevel) return;
  currentLevel = level;

  for (const a of atoms) {
    const showAtom    = (level === LOD.LEVEL_ATOM);
    const showNucleus = (level >= LOD.LEVEL_NUCLEUS);
    const showQuarks  = (level === LOD.LEVEL_QUARK);
    const showElectrons = (level >= LOD.LEVEL_NUCLEUS);

    // L'atome "enveloppe" : transparent puis masqué quand on zoome dedans
    a.mesh.visible = true; // le group reste, c'est la sphère qui change
    a.mat.opacity = showAtom ? 1.0 : 0.0;
    a.mat.transparent = !showAtom;
    a.glow.visible = showAtom;

    // noyau
    a.nucleusGroup.visible = showNucleus;

    // quarks
    for (const q of a.quarks) q.mesh.visible = showQuarks;

    // électrons + anneaux
    for (const e of a.electrons) {
      e.visible = showElectrons;
      if (e.userData.ring) e.userData.ring.visible = showElectrons;
    }
  }

  // indicateur UI
  const el = document.getElementById('levelLabel');
  if (el) {
    el.textContent = ['Atoms', 'Nucleus & Electrons', 'Quarks'][level];
    el.dataset.level = level;
  }
}

// ---------- Boucle d'animation ----------
const clock = new THREE.Clock();
const tmpE = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const rawDt = clock.getDelta();
  const dt = Math.min(rawDt, 0.033);

  const substeps = 2;
  for (let s = 0; s < substeps; s++) physicsStep(dt / substeps);

  // niveau de détail selon le zoom
  applyLevel(computeLevel());

  const t = clock.elapsedTime;

  // animation subatomique
  for (const a of atoms) {
    const speed = a.vel.length();
    const heat = Math.min(1, speed / 6);
    a.mat.emissiveIntensity = 2.0 + heat * 3.0;
    a.mat.emissive.lerpColors(COLOR_GLOW, COLOR_HOT, heat);
    a.glowMat.opacity = 0.6 + heat * 0.4;

    // électrons en orbite
    for (const e of a.electrons) {
      if (!e.visible) continue;
      const u = e.userData;
      const ang = u.phase + t * u.speed;
      tmpE.set(
        Math.cos(ang) * u.radius,
        Math.sin(t * 0.7 + u.tiltX * 3) * u.radius * 0.3,
        Math.sin(ang) * u.radius
      );
      // applique l'inclinaison
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(u.tiltX, 0, u.tiltZ));
      tmpE.applyQuaternion(q);
      e.position.copy(tmpE);
    }

    // nucléons : léger jitter + spin
    for (const ncl of a.nucleons) {
      ncl.mesh.position.x = ncl.basePos.x + Math.sin(t * 2 + ncl.mesh.userData.spin) * 0.015;
      ncl.mesh.position.y = ncl.basePos.y + Math.cos(t * 1.8 + ncl.mesh.userData.spin) * 0.015;
      ncl.mesh.rotateOnAxis(ncl.mesh.userData.spinAxis, dt * 0.5);
    }

    // quarks : orbite rapide autour du centre du noyau
    for (const q of a.quarks) {
      if (!q.mesh.visible) continue;
      const ang = q.angle + t * q.speed;
      q.mesh.position.set(
        Math.cos(ang) * q.radius,
        Math.sin(ang * 1.3 + q.tilt) * q.radius * 0.5,
        Math.sin(ang) * q.radius
      );
    }
  }

  dust.rotation.y += dt * 0.02;
  dust.rotation.x += dt * 0.01;

  controls.update();
  composer.render();
}

// ---------- UI ----------
const ui = {
  panel: document.getElementById('panel'),
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
  fps: document.getElementById('fps')
};

ui.count.addEventListener('input', e => {
  config.atomCount = +e.target.value;
  ui.countVal.textContent = config.atomCount;
  spawnAtoms(config.atomCount);
});
ui.temp.addEventListener('input', e => {
  config.temperature = +e.target.value;
  ui.tempVal.textContent = config.temperature.toFixed(2);
});
ui.inter.addEventListener('input', e => {
  config.epsilon = +e.target.value;
  ui.interVal.textContent = config.epsilon.toFixed(2);
});
ui.glow.addEventListener('input', e => {
  config.glow = +e.target.value;
  ui.glowVal.textContent = config.glow.toFixed(2);
  bloom.strength = config.glow;
});
ui.rotate.addEventListener('click', () => {
  ui.rotate.classList.toggle('on');
  config.autoRotate = ui.rotate.classList.contains('on');
  controls.autoRotate = config.autoRotate;
});
ui.reset.addEventListener('click', () => {
  spawnAtoms(config.atomCount);
});

// FPS meter
let frames = 0, lastFpsT = performance.now();
setInterval(() => {
  const now = performance.now();
  const fps = (frames * 1000) / (now - lastFpsT);
  ui.fps.textContent = Math.round(fps) + ' fps';
  frames = 0;
  lastFpsT = now;
}, 1000);
function countFrame() { frames++; requestAnimationFrame(countFrame); }
countFrame();

// ---------- Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Démarrage ----------
spawnAtoms(config.atomCount);
applyLevel(LOD.LEVEL_ATOM);
animate();
