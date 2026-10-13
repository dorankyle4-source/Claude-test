// 3D character: an original red-and-gold armored mentor bust, built from
// simple shapes with Three.js (no external model files). Glowing parts use a
// bloom effect so they read as light on a normal monitor and later on the
// Looking Glass display.
//
// Interface (same as the 2D fallback):
//   setState('idle' | 'thinking' | 'speaking' | 'error'), mouthPulse(), destroy()

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

const FOV = 32;
const LOOK_AT = new THREE.Vector3(0, 0.22, 0);
const HALF_WIDTH_TO_FIT = 1.0; // keep both shoulders in view on tall/narrow panels
const HEAD_SCALE = new THREE.Vector3(0.88, 1.08, 0.98);

export function createCharacter3D(container) {
  // ---- renderer, scene, camera -------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
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

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.25, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- materials ----------------------------------------------------------
  const red = new THREE.MeshPhysicalMaterial({
    color: '#a0111a',
    metalness: 0.55,
    roughness: 0.35,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
  });
  const gold = new THREE.MeshPhysicalMaterial({
    color: '#b8862f',
    metalness: 1,
    roughness: 0.36,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  });
  const gunmetal = new THREE.MeshStandardMaterial({ color: '#2b3038', metalness: 0.9, roughness: 0.38 });
  const visorMat = new THREE.MeshStandardMaterial({ color: '#07090d', metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide });
  const glow = (color, intensity) =>
    new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: intensity });
  const eyeMat = glow(LOOK.idle.eyes, 3.5);
  const mouthMat = glow(LOOK.idle.eyes, 0.6);
  const coreMat = glow(LOOK.idle.core, 3);
  const accentMat = glow(LOOK.idle.core, 2.5);
  const ringMat = new THREE.MeshBasicMaterial({
    color: LOOK.idle.rings,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  eyeMat.side = THREE.DoubleSide;
  mouthMat.side = THREE.DoubleSide;
  for (const m of [red, gold]) m.side = THREE.DoubleSide;

  // Part of a sphere, centred on the front (+z) of the head.
  // `halfWidth` is the angle either side of centre; theta runs 0 (top) to PI (bottom).
  const shell = (radius, halfWidth, thetaStart, thetaEnd, phiCenter = Math.PI / 2) =>
    new THREE.SphereGeometry(radius, 96, 64, phiCenter - halfWidth, halfWidth * 2, thetaStart, thetaEnd - thetaStart);
  const mesh = (geometry, material) => new THREE.Mesh(geometry, material);

  // ---- build the bust -----------------------------------------------------
  const root = new THREE.Group();
  scene.add(root);

  // Torso
  const torso = new THREE.Group();
  root.add(torso);
  // Armour torso: a lathe (turned) profile, flattened front-to-back.
  const profile = (points) => points.map(([r, y]) => new THREE.Vector2(r, y));
  const TORSO_DEPTH = 0.62;
  const chest = mesh(
    new THREE.LatheGeometry(
      profile([
        [0, 0.0], [0.2, 0.0], [0.36, -0.05], [0.54, -0.13], [0.66, -0.26], [0.68, -0.42],
        [0.64, -0.62], [0.55, -0.85], [0.45, -1.1], [0.43, -1.5], [0, -1.5],
      ]),
      128,
    ),
    red,
  );
  chest.scale.z = TORSO_DEPTH;
  torso.add(chest);

  // Gold gorget (collar plate) over the top of the chest
  const gorget = mesh(
    new THREE.LatheGeometry(profile([[0.17, 0.05], [0.24, 0.02], [0.38, -0.04], [0.5, -0.11], [0.49, -0.13]]), 128),
    gold,
  );
  gorget.scale.z = TORSO_DEPTH;
  torso.add(gorget);

  // Gold rib band under the chest
  const band = mesh(new THREE.TorusGeometry(0.6, 0.018, 16, 128), gold);
  band.rotation.x = Math.PI / 2;
  band.scale.y = TORSO_DEPTH;
  band.position.y = -0.7;
  torso.add(band);

  // Hexagonal chest core with a gold frame and its own light
  const coreY = -0.36;
  const coreZ = 0.67 * TORSO_DEPTH + 0.005;
  const coreFrame = mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.05, 6), gold);
  coreFrame.rotation.x = Math.PI / 2;
  coreFrame.position.set(0, coreY, coreZ);
  const core = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 6), coreMat);
  core.rotation.x = Math.PI / 2;
  core.position.set(0, coreY, coreZ + 0.012);
  const coreLight = new THREE.PointLight(LOOK.idle.core, 1.6, 1.6, 2);
  coreLight.position.set(0, coreY, coreZ + 0.2);
  torso.add(coreFrame, core, coreLight);

  // Shoulder armour with gold trim
  for (const side of [-1, 1]) {
    const pauldron = mesh(new THREE.SphereGeometry(0.26, 64, 48), red);
    pauldron.scale.set(1.15, 0.8, 1);
    pauldron.position.set(side * 0.66, -0.24, -0.04);
    pauldron.rotation.z = side * -0.35;
    const trim = mesh(new THREE.TorusGeometry(0.235, 0.018, 16, 96), gold);
    trim.rotation.set(Math.PI / 2, side * 0.35, 0);
    trim.position.set(side * 0.68, -0.31, -0.04);
    torso.add(pauldron, trim);
  }

  // Collar and neck
  const collar = mesh(new THREE.TorusGeometry(0.21, 0.045, 24, 96), gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.05;
  const neck = mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.3, 48), gunmetal);
  neck.position.y = 0.13;
  torso.add(collar, neck);
  for (const y of [0.1, 0.18]) {
    const band = mesh(new THREE.TorusGeometry(0.162, 0.01, 12, 64), gunmetal);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    torso.add(band);
  }

  // Head: pivots at the top of the neck
  const head = new THREE.Group();
  head.position.y = 0.24;
  root.add(head);
  const skull = new THREE.Group();
  skull.position.y = 0.38;
  skull.scale.copy(HEAD_SCALE);
  head.add(skull);

  skull.add(mesh(new THREE.SphereGeometry(0.42, 96, 64), red));
  // Gold face mask from brow to upper lip
  skull.add(mesh(shell(0.428, 0.66, 0.98, 2.17), gold));
  // Hinged jaw plate (opens slightly while speaking)
  const jaw = new THREE.Group();
  jaw.add(mesh(shell(0.431, 0.56, 2.21, 2.72), gold));
  skull.add(jaw);
  // Mouth glow, visible in the seam between mask and jaw
  const mouth = mesh(shell(0.424, 0.42, 2.15, 2.27), mouthMat);
  skull.add(mouth);

  // Dark visor band behind the eyes, for contrast
  for (const side of [-1, 1]) {
    const recess = mesh(shell(0.431, 0.22, 1.31, 1.53, Math.PI / 2 + side * 0.27), visorMat);
    recess.rotation.z = side * 0.13;
    skull.add(recess);
  }

  // Angled eye slits
  for (const side of [-1, 1]) {
    const eye = mesh(shell(0.434, 0.16, 1.395, 1.445, Math.PI / 2 + side * 0.27), eyeMat);
    eye.rotation.z = side * 0.13;
    skull.add(eye);
  }

  // Crest running over the top of the helmet
  const crest = mesh(new THREE.TorusGeometry(0.425, 0.02, 16, 128, Math.PI * 0.62), gold);
  crest.rotation.set(0, Math.PI / 2, Math.PI * 0.2);
  skull.add(crest);

  // Side pods with a small light ring
  for (const side of [-1, 1]) {
    const pod = mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.07, 48), gold);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(side * 0.41, 0, -0.02);
    const ring = mesh(new THREE.TorusGeometry(0.06, 0.008, 12, 48), accentMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 0.448, 0, -0.02);
    skull.add(pod, ring);
  }

  // Holographic rings behind the bust
  const rings = new THREE.Group();
  rings.position.set(0, 0.5, -0.7);
  scene.add(rings);
  const ringMeshes = [
    [0.95, 0.008, Math.PI * 1.3],
    [1.08, 0.006, Math.PI * 0.9],
    [1.2, 0.005, Math.PI * 1.5],
  ].map(([radius, width, arc], i) => {
    const r = mesh(new THREE.RingGeometry(radius, radius + width, 128, 1, i, arc), ringMat);
    rings.add(r);
    return r;
  });

  // ---- lights ---------------------------------------------------------------
  const key = new THREE.DirectionalLight('#fff1e0', 1.3);
  key.position.set(4, 3, 2.5);
  const rim = new THREE.DirectionalLight('#4fb8ff', 2.2);
  rim.position.set(-3, 2, -3);
  const rim2 = new THREE.DirectionalLight('#ff8a5c', 1.2);
  rim2.position.set(3, 1, -2);
  const fill = new THREE.DirectionalLight('#9fc4ff', 0.5);
  fill.position.set(-3, 0.5, 3);
  scene.add(key, fill, rim, rim2, new THREE.AmbientLight('#203040', 0.6));

  // ---- sizing ---------------------------------------------------------------
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const halfHeightAtUnit = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const distance = Math.max(3.1, HALF_WIDTH_TO_FIT / (halfHeightAtUnit * aspect));
    camera.aspect = aspect;
    camera.position.set(0, 0.38, distance);
    camera.lookAt(LOOK_AT);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

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

  // ---- animation ------------------------------------------------------------
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timer = new THREE.Timer();
  const colors = {
    eyes: new THREE.Color(LOOK.idle.eyes),
    core: new THREE.Color(LOOK.idle.core),
    rings: new THREE.Color(LOOK.idle.rings),
  };
  const target = { eyes: new THREE.Color(), core: new THREE.Color(), rings: new THREE.Color() };
  let state = 'idle';
  let stateSince = 0;
  let mouthLevel = 0;
  let nextBlink = 2;
  let blinkStart = -1;
  let frame = 0;
  const angles = { yaw: 0, pitch: 0, roll: 0 };

  const approach = (current, goal, rate, dt) => current + (goal - current) * (1 - Math.exp(-rate * dt));

  function animate() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.1);
    const t = timer.getElapsed();
    const look = LOOK[state];
    const motion = reduceMotion ? 0.3 : 1;

    // Colours ease toward the current state's palette.
    target.eyes.set(look.eyes);
    target.core.set(look.core);
    target.rings.set(look.rings);
    for (const k of ['eyes', 'core', 'rings']) colors[k].lerp(target[k], 1 - Math.exp(-6 * dt));

    // Mouth: kicked by spoken words, decays quickly, with a gentle flutter while speaking.
    if (state === 'speaking' && mouthLevel < 0.12) mouthLevel = Math.max(mouthLevel, 0.1 + 0.06 * Math.sin(t * 17));
    mouthLevel *= Math.exp(-9 * dt);
    jaw.rotation.x = mouthLevel * 0.16;
    mouthMat.emissive.copy(colors.eyes);
    mouthMat.emissiveIntensity = 0.6 + mouthLevel * 3;

    // Blink: the eye lights dip briefly every few seconds.
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

    // Chest core breathes; faster while thinking.
    const coreRate = state === 'thinking' ? 4 : state === 'speaking' ? 2.4 : 1.3;
    coreMat.emissive.copy(colors.core);
    coreMat.emissiveIntensity = 3 + 1 * Math.sin(t * coreRate);
    accentMat.emissive.copy(colors.core);
    coreLight.color.copy(colors.core);
    coreLight.intensity = 0.8 + 0.3 * Math.sin(t * coreRate);
    ringMat.color.copy(colors.rings);

    // Head motion: idle wander + glance at pointer + per-state pose.
    let yaw = (Math.sin(t * 0.31) * 0.6 + Math.sin(t * 0.17 + 1.3) * 0.4) * 0.16 * motion + pointer.x * 0.22;
    let pitch = Math.sin(t * 0.23 + 0.5) * 0.05 * motion + pointer.y * 0.1;
    let roll = Math.sin(t * 0.19) * 0.03 * motion;
    if (state === 'thinking') {
      pitch -= 0.1;
      roll += 0.12;
      yaw += 0.12;
    } else if (state === 'speaking') {
      pitch += (mouthLevel * 0.06 + Math.sin(t * 2.7) * 0.02) * motion;
    } else if (state === 'error') {
      yaw += Math.sin(t * 22) * 0.05 * Math.exp(-(t - stateSince) * 3);
    }
    angles.yaw = approach(angles.yaw, yaw, 4, dt);
    angles.pitch = approach(angles.pitch, pitch, 4, dt);
    angles.roll = approach(angles.roll, roll, 3, dt);
    head.rotation.set(angles.pitch, angles.yaw, angles.roll, 'YXZ');

    // Breathing and a slight body follow-through.
    root.position.y = Math.sin(t * 1.5) * 0.008 * motion;
    torso.rotation.y = angles.yaw * 0.15;

    // Rings
    ringMeshes.forEach((r, i) => {
      r.rotation.z += dt * look.ringSpeed * (i % 2 ? -1 : 1) * (1 + i * 0.3);
    });

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
