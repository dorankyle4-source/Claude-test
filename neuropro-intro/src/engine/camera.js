// World camera: look-at + zoom + roll, keyed in storyboard.json.
import { keys, inOutSine, clamp, fnoise } from './anim.js';

export function createCamera(cam, W = 1920, H = 1080) {
  const ks = cam.keys.map((k) => [k.t, { cx: k.cx, cy: k.cy, zoom: k.zoom }, inOutSine]);
  const wb = cam.wobble;

  const at = (t) => {
    const v = keys(t, ks);
    let roll = 0;
    if (wb && t > wb.start && t < wb.end + 0.6) {
      const env = clamp((t - wb.start) / 0.35) * clamp((wb.end + 0.6 - t) / 0.9);
      roll = env * (Math.sin((t - wb.start) * Math.PI * 2 * wb.hz) * wb.rollDeg + fnoise(t * 1.7, 4) * wb.rollDeg * 0.35);
    }
    return { ...v, roll };
  };

  /** SVG transform for a layer at parallax depth d (1 = character plane, <1 = further away). */
  const layer = (c, d = 1) => {
    const z = 1 + (c.zoom - 1) * d;
    const cx = W / 2 + (c.cx - W / 2) * d, cy = H / 2 + (c.cy - H / 2) * d;
    return `translate(${W / 2} ${H / 2}) rotate(${(c.roll * d).toFixed(3)}) scale(${z.toFixed(5)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;
  };

  /** Project a world point on the character plane into screen space. */
  const project = (c, x, y) => {
    const r = (c.roll * Math.PI) / 180;
    const dx = (x - c.cx) * c.zoom, dy = (y - c.cy) * c.zoom;
    return [W / 2 + dx * Math.cos(r) - dy * Math.sin(r), H / 2 + dx * Math.sin(r) + dy * Math.cos(r)];
  };

  return { at, layer, project };
}
