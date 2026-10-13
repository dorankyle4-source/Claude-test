// 3D character: an original full-body armored mentor in red, champagne gold and
// gunmetal, built from simple shapes with Three.js (no external model files).
// A small joint hierarchy lets him hold poses and gesture; glowing parts use a
// bloom effect so they read as light on a monitor and later on the Looking Glass.
//
// Interface (same as the 2D fallback, plus optional extras):
//   setState('idle' | 'thinking' | 'speaking' | 'error'), mouthPulse(), destroy()
//   gesture('greet'), setFraming('full' | 'closeup')

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const LOOK = {
  idle: { eyes: '#9fe6ff', core: '#5fd4ff', rings: '#3aa8ff', ringSpeed: 0.15 },
  thinking: { eyes: '#b9a0ff', core: '#a98bff', rings: '#8f73ff', ringSpeed: 0.9 },
  speaking: { eyes: '#c4f3ff', core: '#7fe3ff', rings: '#4fc8ff', ringSpeed: 0.3 },
  error: { eyes: '#ff5a5a', core: '#ff5a5a', rings: '#ff5a5a', ringSpeed: 0.15 },
};

const FOV = 30;
// Where the camera looks and how much of the figure must fit, per framing.
const FRAMINGS = {
  full: { target: new THREE.Vector3(0, 0.98, 0), halfHeight: 1.08, halfWidth: 0.62, height: 1.15 },
  closeup: { target: new THREE.Vector3(0, 1.6, 0), halfHeight: 0.4, halfWidth: 0.4, height: 1.66 },
};
const GREET_SECONDS = 2.8;

export function createCharacter3D(container, { framing: initialFraming = 'full' } = {}) {
  // ---- renderer, scene, camera -------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.className = 'character-canvas';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Tutor character');
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#060a11');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.3;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 50);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.25, 1.0));
  composer.addPass(new OutputPass());

  // ---- materials ----------------------------------------------------------
  const red = new THREE.MeshPhysicalMaterial({
    color: '#b0121b',
    metalness: 0.55,
    roughness: 0.32,
    clearcoat: 0.8,
    clearcoatRoughness: 0.18,
    side: THREE.DoubleSide,
  });
  const gold = new THREE.MeshPhysicalMaterial({
    color: '#c39a5a',
    metalness: 1,
    roughness: 0.34,
    clearcoat: 0.4,
    side: THREE.DoubleSide,
  });
  const gunmetal = new THREE.MeshStandardMaterial({ color: '#2a2e35', metalness: 0.9, roughness: 0.42 });
  const visorMat = new THREE.MeshStandardMaterial({ color: '#07090d', metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide });
  const glow = (color, intensity) =>
    new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: intensity, side: THREE.DoubleSide });
  const eyeMat = glow(LOOK.idle.eyes, 3.5);
  const mouthMat = glow(LOOK.idle.eyes, 0.6);
  const coreMat = glow(LOOK.idle.core, 3);
  const accentMat = glow(LOOK.idle.core, 2);
  const palmMat = glow(LOOK.idle.core, 1.5);
  const holoMat = new THREE.MeshBasicMaterial({
    color: LOOK.idle.rings,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // ---- geometry helpers ---------------------------------------------------
  const mesh = (geometry, material) => new THREE.Mesh(geometry, material);
  const v2 = (points) => points.map(([r, y]) => new THREE.Vector2(r, y));

  // A rounded, tapered limb hanging down from its joint (local -Y), optionally
  // only a slice of it (phi: 0 = front, PI/2 = +x side).
  function limb(length, rTop, rMid, rBottom, { phiStart = 0, phiLength = Math.PI * 2, grow = 1 } = {}) {
    const points = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const s = i / steps;
      const taper = s < 0.5 ? THREE.MathUtils.lerp(rTop, rMid, s * 2) : THREE.MathUtils.lerp(rMid, rBottom, (s - 0.5) * 2);
      const cap = Math.sqrt(Math.min(1, Math.sin(Math.PI * s) * 6));
      points.push(new THREE.Vector2(taper * cap * grow, -s * length));
    }
    return new THREE.LatheGeometry(points, 48, phiStart, phiLength);
  }

  // Part of a sphere, centred on the front (+z). Used for the face.
  const shell = (radius, halfWidth, thetaStart, thetaEnd, phiCenter = Math.PI / 2) =>
    new THREE.SphereGeometry(radius, 96, 64, phiCenter - halfWidth, halfWidth * 2, thetaStart, thetaEnd - thetaStart);

  const joint = (parent, x, y, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  // ---- build the figure (y = 0 at the feet, about 1.9 units tall) --------
  const root = new THREE.Group();
  scene.add(root);
  const hips = joint(root, 0, 1.0);

  // Pelvis and waist
  const pelvis = mesh(
    new THREE.LatheGeometry(v2([[0, 0.06], [0.12, 0.06], [0.138, 0], [0.128, -0.06], [0.08, -0.11], [0, -0.12]]), 64),
    red,
  );
  pelvis.scale.z = 0.75;
  hips.add(pelvis);
  const waist = mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.07, 48), gunmetal);
  waist.scale.z = 0.75;
  waist.position.y = 0.09;
  hips.add(waist);

  // Spine → abdomen → chest
  const spine = joint(hips, 0, 0.12);
  const abdomen = mesh(new THREE.LatheGeometry(v2([[0, 0], [0.118, 0], [0.122, 0.06], [0.135, 0.12], [0.15, 0.17], [0, 0.17]]), 64), red);
  abdomen.scale.z = 0.72;
  spine.add(abdomen);
  for (const y of [0.08]) {
    const line = mesh(new THREE.TorusGeometry(0.124 + y * 0.12, 0.005, 8, 64), gunmetal);
    line.rotation.x = Math.PI / 2;
    line.scale.y = 0.72;
    line.position.y = y;
    spine.add(line);
  }

  const chest = joint(spine, 0, 0.17);
  const CHEST_DEPTH = 0.68;
  const chestProfile = [[0, -0.01], [0.15, -0.01], [0.195, 0.07], [0.235, 0.16], [0.24, 0.22], [0.2, 0.28], [0.09, 0.305], [0, 0.31]];
  const torso = mesh(new THREE.LatheGeometry(v2(chestProfile), 96), red);
  torso.scale.z = CHEST_DEPTH;
  chest.add(torso);
  // Gold side panels and gunmetal seams down the flanks
  for (const side of [-1, 1]) {
    const phi = side > 0 ? Math.PI / 2 : Math.PI * 1.5;
    const panel = mesh(
      new THREE.LatheGeometry(v2(chestProfile.slice(1, 5).map(([r, y]) => [r * 1.015, y])), 32, phi - 0.42, 0.84),
      gold,
    );
    panel.scale.z = CHEST_DEPTH;
    chest.add(panel);
    const seam = mesh(
      new THREE.LatheGeometry(v2(chestProfile.slice(1, 6).map(([r, y]) => [r * 1.02, y])), 4, phi + side * 0.5 - 0.03, 0.06),
      gunmetal,
    );
    seam.scale.z = CHEST_DEPTH;
    chest.add(seam);
  }
  // Pectoral line
  const pecLine = mesh(new THREE.TorusGeometry(0.228, 0.005, 8, 96, Math.PI * 0.7), gunmetal);
  pecLine.rotation.set(Math.PI / 2, 0, Math.PI * 0.15);
  pecLine.scale.y = CHEST_DEPTH;
  pecLine.position.y = 0.09;
  chest.add(pecLine);

  // Hexagonal chest core
  const coreY = 0.19;
  const coreZ = 0.232 * CHEST_DEPTH + 0.004;
  const coreFrame = mesh(new THREE.CylinderGeometry(0.05, 0.054, 0.02, 6), gold);
  coreFrame.rotation.x = Math.PI / 2;
  coreFrame.position.set(0, coreY, coreZ);
  const core = mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 6), coreMat);
  core.rotation.x = Math.PI / 2;
  core.position.set(0, coreY, coreZ + 0.006);
  const coreLight = new THREE.PointLight(LOOK.idle.core, 0.4, 0.8, 2);
  coreLight.position.set(0, coreY, coreZ + 0.08);
  chest.add(coreFrame, core, coreLight);

  // Collar, neck and head
  const collar = mesh(new THREE.TorusGeometry(0.075, 0.016, 16, 64), gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.3;
  const neckMesh = mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.1, 32), gunmetal);
  neckMesh.position.y = 0.34;
  chest.add(collar, neckMesh);

  const neck = joint(chest, 0, 0.35);
  const skull = new THREE.Group();
  skull.position.y = 0.12;
  skull.scale.set(0.88 * 0.31, 1.08 * 0.31, 0.98 * 0.31);
  neck.add(skull);
  skull.add(mesh(new THREE.SphereGeometry(0.42, 96, 64), red));
  skull.add(mesh(shell(0.428, 0.66, 0.98, 2.17), gold)); // face mask
  const jaw = new THREE.Group();
  jaw.add(mesh(shell(0.431, 0.56, 2.21, 2.72), gold));
  skull.add(jaw);
  skull.add(mesh(shell(0.424, 0.42, 2.15, 2.27), mouthMat));
  for (const side of [-1, 1]) {
    const recess = mesh(shell(0.431, 0.22, 1.31, 1.53, Math.PI / 2 + side * 0.27), visorMat);
    recess.rotation.z = side * 0.13;
    const eye = mesh(shell(0.434, 0.16, 1.395, 1.445, Math.PI / 2 + side * 0.27), eyeMat);
    eye.rotation.z = side * 0.13;
    const pod = mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.07, 48), gold);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(side * 0.41, 0, -0.02);
    const ring = mesh(new THREE.TorusGeometry(0.06, 0.008, 12, 48), accentMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 0.448, 0, -0.02);
    skull.add(recess, eye, pod, ring);
  }
  const crest = mesh(new THREE.TorusGeometry(0.425, 0.02, 16, 128, Math.PI * 0.62), gold);
  crest.rotation.set(0, Math.PI / 2, Math.PI * 0.2);
  skull.add(crest);

  // Arms. side = +1 is the figure's left (viewer's right).
  const arms = {};
  for (const side of [-1, 1]) {
    const shoulder = joint(chest, side * 0.262, 0.215);
    const pauldron = mesh(new THREE.SphereGeometry(0.078, 48, 32), red);
    pauldron.scale.set(1.12, 0.92, 1.05);
    pauldron.position.set(side * 0.018, 0.012, 0);
    shoulder.add(pauldron);
    const pauldronTrim = mesh(new THREE.TorusGeometry(0.072, 0.007, 8, 48), gunmetal);
    pauldronTrim.rotation.set(Math.PI / 2, 0, 0);
    pauldronTrim.position.set(side * 0.018, -0.035, 0);
    shoulder.add(pauldronTrim);

    shoulder.add(mesh(limb(0.3, 0.062, 0.064, 0.046), gold)); // upper arm
    const outerPlate = mesh(limb(0.27, 0.062, 0.064, 0.046, { phiStart: side > 0 ? Math.PI * 0.2 : Math.PI * 1.2, phiLength: Math.PI * 0.6, grow: 1.06 }), red);
    outerPlate.position.y = -0.02;
    shoulder.add(outerPlate);

    const elbow = joint(shoulder, 0, -0.3);
    elbow.add(mesh(new THREE.SphereGeometry(0.044, 32, 24), gunmetal));
    elbow.add(mesh(limb(0.27, 0.05, 0.056, 0.04), red)); // forearm
    const cuff = mesh(new THREE.TorusGeometry(0.041, 0.007, 8, 32), gunmetal);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.245;
    elbow.add(cuff);

    const wrist = joint(elbow, 0, -0.27);
    const hand = buildHand(side);
    wrist.add(hand.group);
    arms[side] = { shoulder, elbow, wrist, hand };
  }

  // Legs
  const legs = {};
  for (const side of [-1, 1]) {
    const hip = joint(hips, side * 0.09, -0.06);
    hip.add(mesh(limb(0.47, 0.092, 0.084, 0.056), gold)); // thigh
    const thighFront = mesh(limb(0.43, 0.092, 0.084, 0.056, { phiStart: -0.42, phiLength: 0.84, grow: 1.05 }), red);
    thighFront.position.y = -0.03;
    hip.add(thighFront);

    const knee = joint(hip, 0, -0.47);
    knee.add(mesh(new THREE.SphereGeometry(0.055, 32, 24), gunmetal));
    const kneeCap = mesh(new THREE.SphereGeometry(0.048, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2), red);
    kneeCap.rotation.x = Math.PI / 2;
    kneeCap.position.z = 0.03;
    knee.add(kneeCap);
    knee.add(mesh(limb(0.44, 0.058, 0.066, 0.045), red)); // shin
    const shinSeam = mesh(new THREE.TorusGeometry(0.06, 0.006, 8, 32), gunmetal);
    shinSeam.rotation.x = Math.PI / 2;
    shinSeam.position.y = -0.3;
    knee.add(shinSeam);

    const ankle = joint(knee, 0, -0.44);
    const foot = mesh(new THREE.CapsuleGeometry(0.045, 0.13, 8, 24), red);
    foot.rotation.x = Math.PI / 2;
    foot.scale.set(1.05, 1, 0.75);
    foot.position.set(0, -0.045, 0.05);
    const sole = mesh(new THREE.BoxGeometry(0.09, 0.012, 0.21), gunmetal);
    sole.position.set(0, -0.08, 0.05);
    ankle.add(foot, sole);
    legs[side] = { hip, knee, ankle };
  }

  // A hand whose palm faces the body at rest, fingers pointing down.
  function buildHand(side) {
    const group = new THREE.Group();
    const palm = mesh(new THREE.BoxGeometry(0.032, 0.085, 0.075), red);
    palm.position.y = -0.045;
    group.add(palm);
    const glowDisc = mesh(new THREE.CircleGeometry(0.02, 32), palmMat);
    glowDisc.position.set(-side * 0.0165, -0.048, 0);
    glowDisc.rotation.y = -side * Math.PI / 2;
    group.add(glowDisc);
    const fingers = [];
    [-0.027, -0.009, 0.009, 0.027].forEach((z, i) => {
      const finger = joint(group, 0, -0.088, z);
      finger.add(mesh(new THREE.CapsuleGeometry(0.0095, i === 0 || i === 3 ? 0.042 : 0.052, 4, 12), i % 2 ? gunmetal : red));
      finger.children[0].position.y = -0.03;
      fingers.push(finger);
    });
    const thumb = joint(group, -side * 0.006, -0.035, 0.038);
    thumb.add(mesh(new THREE.CapsuleGeometry(0.01, 0.04, 4, 12), red));
    thumb.children[0].position.y = -0.025;
    thumb.rotation.x = 0.7;
    return { group, fingers, thumb, glowDisc };
  }

  // Holographic projector base and rings behind the upper body
  const base = mesh(new THREE.RingGeometry(0.42, 0.44, 128), holoMat);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.002;
  const baseInner = mesh(new THREE.RingGeometry(0.3, 0.305, 128), holoMat);
  baseInner.rotation.x = -Math.PI / 2;
  baseInner.position.y = 0.002;
  scene.add(base, baseInner);
  const rings = new THREE.Group();
  rings.position.set(0, 1.5, -0.45);
  scene.add(rings);
  const ringMeshes = [
    [0.42, 0.004, Math.PI * 1.3],
    [0.48, 0.003, Math.PI * 0.9],
    [0.54, 0.003, Math.PI * 1.5],
  ].map(([radius, width, arc], i) => {
    const r = mesh(new THREE.RingGeometry(radius, radius + width, 128, 1, i, arc), holoMat);
    rings.add(r);
    return r;
  });

  // ---- lights ---------------------------------------------------------------
  const key = new THREE.DirectionalLight('#fff1e0', 1.4);
  key.position.set(4, 4, 3);
  const fill = new THREE.DirectionalLight('#9fc4ff', 0.5);
  fill.position.set(-3, 1.5, 3);
  const rim = new THREE.DirectionalLight('#4fb8ff', 2.2);
  rim.position.set(-3, 3, -3);
  const rim2 = new THREE.DirectionalLight('#ff8a5c', 1.1);
  rim2.position.set(3, 2, -2);
  scene.add(key, fill, rim, rim2, new THREE.AmbientLight('#203040', 0.6));

  // ---- camera framing ---------------------------------------------------------
  let framing = FRAMINGS[initialFraming] ? initialFraming : 'full';
  const cam = { target: FRAMINGS[framing].target.clone(), distance: 4, height: FRAMINGS[framing].height };
  let aspect = 1;

  function desiredDistance(f) {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    return Math.max(f.halfHeight / tanHalf, f.halfWidth / (tanHalf * aspect));
  }

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  cam.distance = desiredDistance(FRAMINGS[framing]);

  // The head glances toward the mouse pointer.
  const pointer = new THREE.Vector2();
  const onPointer = (e) => {
    const rect = container.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1.5, 1.5),
      THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1.5, 1.5),
    );
  };
  window.addEventListener('pointermove', onPointer);

  // ---- poses ----------------------------------------------------------------
  // Each pose sets target joint angles; the animation eases toward them.
  // R = figure's right arm (side -1, viewer's left), L = left arm (side +1).
  const R = arms[-1];
  const L = arms[1];
  const JOINTS = {
    hipsY: [hips.position, 'y'],
    hipsX: [hips.position, 'x'],
    hipsRoll: [hips.rotation, 'z'],
    spineX: [spine.rotation, 'x'],
    spineY: [spine.rotation, 'y'],
    chestX: [chest.rotation, 'x'],
    headX: [neck.rotation, 'x'],
    headY: [neck.rotation, 'y'],
    headZ: [neck.rotation, 'z'],
  };
  for (const [name, side] of [['R', -1], ['L', 1]]) {
    const a = arms[side];
    const l = legs[side];
    Object.assign(JOINTS, {
      [`${name}shX`]: [a.shoulder.rotation, 'x'],
      [`${name}shY`]: [a.shoulder.rotation, 'y'],
      [`${name}shZ`]: [a.shoulder.rotation, 'z'],
      [`${name}elX`]: [a.elbow.rotation, 'x'],
      [`${name}elY`]: [a.elbow.rotation, 'y'],
      [`${name}wrX`]: [a.wrist.rotation, 'x'],
      [`${name}wrY`]: [a.wrist.rotation, 'y'],
      [`${name}wrZ`]: [a.wrist.rotation, 'z'],
      [`${name}curl`]: [a.hand, 'curl'],
      [`${name}hipX`]: [l.hip.rotation, 'x'],
      [`${name}hipZ`]: [l.hip.rotation, 'z'],
      [`${name}knX`]: [l.knee.rotation, 'x'],
      [`${name}anX`]: [l.ankle.rotation, 'x'],
      [`${name}anZ`]: [l.ankle.rotation, 'z'],
    });
  }
  for (const side of [-1, 1]) arms[side].hand.curl = 0.4;

  // Relaxed heroic stance; the other poses are layered on top of this.
  function basePose(t, motion) {
    const sway = Math.sin(t * 0.6) * motion;
    return {
      hipsY: 1.0 + Math.sin(t * 1.5) * 0.004 * motion,
      hipsX: sway * 0.012,
      hipsRoll: sway * 0.015,
      spineX: 0.02,
      spineY: 0,
      chestX: Math.sin(t * 1.5) * 0.01 * motion,
      headX: 0,
      headY: 0,
      headZ: 0,
      RshX: 0.05, RshY: 0, RshZ: -0.13 - sway * 0.01, RelX: -0.25, RelY: 0, RwrX: 0, RwrY: 0, RwrZ: 0.05, Rcurl: 0.45,
      LshX: 0.05, LshY: 0, LshZ: 0.13 - sway * 0.01, LelX: -0.25, LelY: 0, LwrX: 0, LwrY: 0, LwrZ: -0.05, Lcurl: 0.45,
      RhipX: -0.02, RhipZ: -0.07 - sway * 0.01, RknX: 0.05, RanX: -0.03, RanZ: 0.07,
      LhipX: 0.02, LhipZ: 0.07 - sway * 0.01, LknX: 0.03, LanX: -0.05, LanZ: -0.07,
    };
  }

  function thinkingPose(p, t) {
    // Right hand raised to the chin, head tilted, weight on one leg.
    Object.assign(p, {
      RshX: -0.95, RshZ: 0.35, RshY: 0.25, RelX: -2.35, RelY: -0.2, RwrX: 0.3, RwrZ: 0.25, Rcurl: 1.1,
      LshX: -0.25, LshZ: 0.35, LelX: -1.35, LelY: 0.3, Lcurl: 0.9,
      headX: 0.08, headZ: 0.12, headY: -0.1,
      hipsX: 0.02, hipsRoll: 0.03,
    });
    p.headY += Math.sin(t * 0.8) * 0.04;
  }

  function speakingPose(p, t, mouth) {
    // Explaining with the left hand, palm up, moving with the speech.
    const beat = Math.sin(t * 2.1) * 0.12 + mouth * 0.15;
    Object.assign(p, {
      LshX: -0.45 - beat * 0.3, LshZ: 0.22, LelX: -1.25 - beat, LelY: 0.9, LwrX: 0.15, LwrZ: -0.2, Lcurl: 0.25,
      RshX: -0.12 + Math.sin(t * 1.3) * 0.05, RelX: -0.45 + Math.sin(t * 1.7) * 0.08,
    });
    p.headX += mouth * 0.06 + Math.sin(t * 2.7) * 0.02;
  }

  function greetPose(p, t, weight) {
    // Right arm raised, palm toward the viewer, with a small wave.
    const wave = Math.sin(t * 7) * 0.18 * weight;
    const target = {
      RshX: -1.45, RshZ: -0.22, RshY: 0, RelX: -0.3, RelY: 0, RwrX: -1.35, RwrY: Math.PI / 2, RwrZ: wave, Rcurl: 0,
      spineY: -0.08, headY: -0.05,
    };
    for (const [k, v] of Object.entries(target)) p[k] = THREE.MathUtils.lerp(p[k], v, weight);
  }

  function errorPose(p, t, since) {
    p.headY += Math.sin(t * 22) * 0.06 * Math.exp(-since * 3);
    p.headX -= 0.05;
  }

  function applyHand(hand, curl) {
    // Fingers curl toward the palm, which faces the body.
    hand.fingers.forEach((f, i) => (f.rotation.z = (hand === R.hand ? 1 : -1) * curl * (0.9 + i * 0.08)));
  }

  // ---- animation ------------------------------------------------------------
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timer = new THREE.Timer();
  const colors = {
    eyes: new THREE.Color(LOOK.idle.eyes),
    core: new THREE.Color(LOOK.idle.core),
    rings: new THREE.Color(LOOK.idle.rings),
  };
  const targetColor = new THREE.Color();
  let state = 'idle';
  let stateSince = 0;
  let mouthLevel = 0;
  let nextBlink = 2;
  let blinkStart = -1;
  let greetStart = -Infinity;
  let greetLength = GREET_SECONDS;
  let frame = 0;
  const current = {};
  let first = true;

  const ease = (rate, dt) => 1 - Math.exp(-rate * dt);

  function animate() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.1);
    const t = timer.getElapsed();
    const look = LOOK[state];
    const motion = reduceMotion ? 0.3 : 1;

    // Colours ease toward the state's palette.
    for (const k of ['eyes', 'core', 'rings']) colors[k].lerp(targetColor.set(look[k]), ease(6, dt));

    // Mouth and jaw
    if (state === 'speaking' && mouthLevel < 0.12) mouthLevel = Math.max(mouthLevel, 0.1 + 0.06 * Math.sin(t * 17));
    mouthLevel *= Math.exp(-9 * dt);
    jaw.rotation.x = mouthLevel * 0.16;
    mouthMat.emissive.copy(colors.eyes);
    mouthMat.emissiveIntensity = 0.6 + mouthLevel * 3;

    // Blink
    if (t > nextBlink && blinkStart < 0) blinkStart = t;
    let open = 1;
    if (blinkStart >= 0) {
      const p = (t - blinkStart) / 0.16;
      open = Math.min(1, Math.abs(1 - p * 2) * 1.2);
      if (p >= 1) {
        blinkStart = -1;
        nextBlink = t + 2.5 + Math.random() * 3.5;
      }
    }
    const eyePulse = state === 'thinking' ? 0.6 + 0.4 * Math.sin(t * 5) : 1;
    eyeMat.emissive.copy(colors.eyes);
    eyeMat.emissiveIntensity = 3.5 * open * eyePulse;

    // Chest core, palms, holograms
    const coreRate = state === 'thinking' ? 4 : state === 'speaking' ? 2.4 : 1.3;
    coreMat.emissive.copy(colors.core);
    coreMat.emissiveIntensity = 2.2 + 0.7 * Math.sin(t * coreRate);
    accentMat.emissive.copy(colors.core);
    coreLight.color.copy(colors.core);
    const greetAge = t - greetStart;
    const greetWeight =
      greetAge < 0 || greetAge > greetLength ? 0 : Math.min(1, greetAge / 0.45, (greetLength - greetAge) / 0.6);
    palmMat.emissive.copy(colors.core);
    palmMat.emissiveIntensity = 0.35 + greetWeight * 4.5;
    holoMat.color.copy(colors.rings);
    ringMeshes.forEach((r, i) => (r.rotation.z += dt * look.ringSpeed * (i % 2 ? -1 : 1) * (1 + i * 0.3)));
    base.rotation.z += dt * 0.2;

    // Body pose
    const pose = basePose(t, motion);
    if (state === 'thinking') thinkingPose(pose, t);
    else if (state === 'speaking') speakingPose(pose, t, mouthLevel);
    else if (state === 'error') errorPose(pose, t, t - stateSince);
    if (greetWeight > 0) greetPose(pose, t, greetWeight);

    // Head follows the pointer and wanders a little.
    pose.headY += (Math.sin(t * 0.31) * 0.6 + Math.sin(t * 0.17 + 1.3) * 0.4) * 0.14 * motion + pointer.x * 0.25;
    pose.headX += Math.sin(t * 0.23 + 0.5) * 0.04 * motion + pointer.y * 0.12;
    pose.headZ += Math.sin(t * 0.19) * 0.03 * motion;

    const k = first ? 1 : ease(5, dt);
    for (const [name, value] of Object.entries(pose)) {
      current[name] = first ? value : current[name] + (value - current[name]) * k;
      const [obj, prop] = JOINTS[name];
      obj[prop] = current[name];
    }
    first = false;
    applyHand(R.hand, R.hand.curl);
    applyHand(L.hand, L.hand.curl);

    // Camera eases toward the chosen framing.
    const f = FRAMINGS[framing];
    const ck = ease(3, dt);
    cam.target.lerp(f.target, ck);
    cam.distance += (desiredDistance(f) - cam.distance) * ck;
    cam.height += (f.height - cam.height) * ck;
    camera.position.set(0, cam.height, cam.distance);
    camera.lookAt(cam.target);

    composer.render(dt);
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  return {
    setState(next) {
      const valid = LOOK[next] ? next : 'idle';
      if (valid !== state) {
        state = valid;
        stateSince = timer.getElapsed();
      }
    },
    mouthPulse() {
      mouthLevel = Math.min(1, mouthLevel + 0.45);
    },
    gesture(name, { seconds = GREET_SECONDS } = {}) {
      if (name === 'greet') {
        greetStart = timer.getElapsed();
        greetLength = seconds;
      }
    },
    setFraming(next) {
      if (FRAMINGS[next]) framing = next;
    },
    get framing() {
      return framing;
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
        mats.forEach((m) => m.dispose());
      });
      timer.dispose();
      envTexture.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
    // Exposed for the Looking Glass integration in Phase 6.
    three: { renderer, scene, camera },
  };
}
