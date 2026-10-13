// Placeholder character: a 2D canvas "visor" that blinks, breathes, glows while
// thinking and moves its mouth on spoken words. Phase 3 replaces this with a
// Three.js model behind the same interface:
//   setState('idle' | 'thinking' | 'speaking' | 'error'), mouthPulse(), destroy()

const COLORS = {
  idle: [80, 200, 255],
  thinking: [170, 140, 255],
  speaking: [90, 230, 255],
  error: [255, 110, 110],
};

export function createCharacter(container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'character-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Tutor character');
  container.append(canvas);
  const ctx = canvas.getContext('2d');

  let state = 'idle';
  let color = [...COLORS.idle];
  let mouth = 0; // 0..1, decays every frame, kicked by mouthPulse()
  let nextBlink = performance.now() + 2000;
  let blinkStart = -1;
  let frame = 0;

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, width * dpr);
    canvas.height = Math.max(1, height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  function draw(now) {
    const { width: w, height: h } = container.getBoundingClientRect();
    const t = now / 1000;
    const target = COLORS[state] ?? COLORS.idle;
    color = color.map((c, i) => c + (target[i] - c) * 0.08);
    const rgb = (a) => `rgba(${color.map(Math.round).join(',')},${a})`;

    if (state === 'speaking' && mouth < 0.15) mouth = Math.max(mouth, 0.12 + 0.08 * Math.sin(t * 18));
    mouth *= 0.88;

    ctx.clearRect(0, 0, w, h);
    const size = Math.min(w, h);
    const cx = w / 2 + Math.sin(t * 0.7) * size * 0.01;
    const cy = h / 2 + Math.sin(t * 1.1) * size * 0.012;
    const r = size * 0.32;
    const tilt = Math.sin(t * 0.5) * 0.04 + (state === 'thinking' ? 0.06 : 0);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    // Halo
    const glow = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.6);
    glow.addColorStop(0, rgb(state === 'thinking' ? 0.25 : 0.15));
    glow.addColorStop(1, rgb(0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Rotating rings
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const speed = state === 'thinking' ? 1.6 : 0.4;
      ctx.strokeStyle = rgb(0.35 - i * 0.08);
      ctx.beginPath();
      const start = t * speed * (i % 2 ? -1 : 1) + i;
      ctx.arc(0, 0, r * (1.12 + i * 0.12), start, start + Math.PI * 1.3);
      ctx.stroke();
    }

    // Helmet
    ctx.fillStyle = '#0d1520';
    ctx.strokeStyle = rgb(0.9);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * 0.95, -r, r * 0.95, r * 0.3, r * 0.55, r * 0.85);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.55, r * 0.85);
    ctx.bezierCurveTo(-r * 0.95, r * 0.3, -r * 0.95, -r, 0, -r);
    ctx.fill();
    ctx.stroke();

    // Eyes (blink every few seconds)
    if (now > nextBlink && blinkStart < 0) blinkStart = now;
    let open = 1;
    if (blinkStart >= 0) {
      const p = (now - blinkStart) / 160;
      open = Math.abs(1 - p * 2);
      if (p >= 1) {
        blinkStart = -1;
        nextBlink = now + 2500 + Math.random() * 3500;
      }
    }
    ctx.fillStyle = rgb(1);
    ctx.shadowColor = rgb(1);
    ctx.shadowBlur = 18;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * r * 0.36, -r * 0.12);
      ctx.rotate(side * -0.18);
      ctx.fillRect(-r * 0.22, -r * 0.05 * open, r * 0.44, r * 0.1 * open + 0.5);
      ctx.restore();
    }

    // Mouth
    const mouthH = r * (0.025 + mouth * 0.16);
    ctx.fillRect(-r * 0.2, r * 0.5 - mouthH / 2, r * 0.4, mouthH);
    ctx.restore();

    frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);

  return {
    setState(next) {
      state = COLORS[next] ? next : 'idle';
    },
    mouthPulse() {
      mouth = Math.min(1, mouth + 0.7);
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.remove();
    },
  };
}
