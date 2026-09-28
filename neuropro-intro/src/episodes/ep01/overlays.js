// Screen-space graphics for the studio sections: hook question, section labels, "NO KNOCKOUT REQUIRED.",
// "I feel fine!" bubble, clock → calendar, check-in card, and the two takeaway steps.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inCubic, outBack, inOutCubic, clamp, lerp } from '../../engine/anim.js';
import { measureRun, placeRun } from '../../engine/text.js';

const NAVY = '#0B1829';

export function createOverlays(cfg, T) {
  const c = cfg.brand.colors, F = cfg.brand.fonts;
  const hook = cfg.scene.hook.onScreenText;
  const qStyle = { 'font-family': F.display, 'font-weight': 800, 'font-size': 60, fill: NAVY, 'letter-spacing': -0.5 };
  let nWords = 0, qWidth = 0;

  const eyebrow = (id, text) => h('text', { id, x: 110, y: 120, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 5, opacity: 0 }, text);
  const step = (id, n, title, sub, icon) => h('g', { id, opacity: 0 },
    h('rect', { x: 0, y: -70, width: 700, height: 140, rx: 30, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
    h('g', { transform: 'translate(80 0)' }, icon),
    h('text', { x: 160, y: sub ? -8 : 14, 'font-family': F.display, 'font-weight': 800, 'font-size': 44, fill: NAVY }, title),
    sub ? h('text', { x: 160, y: 36, 'font-family': F.body, 'font-weight': 500, 'font-size': 28, fill: '#4A5363' }, sub) : '',
    h('text', { x: 660, y: -34, 'text-anchor': 'end', 'font-family': F.display, 'font-weight': 800, 'font-size': 26, fill: c.teal }, `STEP ${n}`));

  const clockTicks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `M${(Math.cos(a) * 100).toFixed(1)},${(Math.sin(a) * 100).toFixed(1)} L${(Math.cos(a) * (i % 3 ? 112 : 88)).toFixed(1)},${(Math.sin(a) * (i % 3 ? 112 : 88)).toFixed(1)}`;
  }).join(' ');

  const markup = h('g', { id: 'ov-root' },
    // hook question (top centre)
    h('g', { id: 'ov-q', transform: 'translate(960 170)' }, h('rect', { id: 'ov-qbg', x: -100, y: -72, width: 200, height: 104, rx: 52, fill: '#FFFFFF', opacity: 0, filter: 'url(#dropShadow)' }), h('g', { id: 'ov-qw' })),
    eyebrow('ov-e4', 'COMMON SYMPTOMS'), eyebrow('ov-e6', 'TIMING'), eyebrow('ov-e7', 'WHAT TO DO'),
    // NO KNOCKOUT REQUIRED.
    h('g', { id: 'ov-ko', transform: 'translate(1380 420)', opacity: 0 },
      h('g', { id: 'ov-koS' },
        h('rect', { x: -400, y: -150, width: 800, height: 300, rx: 36, fill: '#FFFFFF', stroke: c.coral, 'stroke-width': 12 }),
        h('rect', { x: -380, y: -130, width: 760, height: 260, rx: 26, fill: 'none', stroke: c.coral, 'stroke-width': 3, opacity: 0.5 }),
        h('text', { y: -14, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 104, fill: NAVY, 'letter-spacing': 2 }, 'NO KNOCKOUT'),
        h('text', { y: 92, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 104, fill: c.coral, 'letter-spacing': 2 }, 'REQUIRED.'))),
    h('g', { id: 'ov-kosub', opacity: 0 },
      h('text', { x: 1380, y: 668, 'text-anchor': 'middle', 'font-family': F.body, 'font-weight': 500, 'font-size': 38, fill: NAVY }, 'Most people with concussions'),
      h('text', { x: 1380, y: 718, 'text-anchor': 'middle', 'font-family': F.body, 'font-weight': 500, 'font-size': 38, fill: NAVY }, "don't lose consciousness.")),
    // "I feel fine!" speech bubble
    h('g', { id: 'ov-fine', opacity: 0 },
      h('path', { d: 'M-190,-70 Q-190,-110 -150,-110 L150,-110 Q190,-110 190,-70 L190,10 Q190,50 150,50 L-60,50 L-120,100 L-100,50 L-150,50 Q-190,50 -190,10Z', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 7, 'stroke-linejoin': 'round' }),
      h('text', { y: -14, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 52, fill: NAVY }, 'I feel fine!')),
    // clock → calendar
    h('g', { id: 'ov-clock', transform: 'translate(1400 420)', opacity: 0 },
      h('circle', { r: 130, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 10, filter: 'url(#dropShadow)' }),
      h('path', { d: clockTicks, stroke: NAVY, 'stroke-width': 6, 'stroke-linecap': 'round' }),
      h('path', { id: 'ov-hHour', d: 'M0,0 L0,-58', stroke: NAVY, 'stroke-width': 12, 'stroke-linecap': 'round' }),
      h('path', { id: 'ov-hMin', d: 'M0,0 L0,-92', stroke: c.coral, 'stroke-width': 8, 'stroke-linecap': 'round' }),
      h('circle', { r: 12, fill: NAVY })),
    h('g', { id: 'ov-cal', transform: 'translate(1400 420)', opacity: 0 },
      h('rect', { x: -130, y: -140, width: 260, height: 280, rx: 26, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 10, filter: 'url(#dropShadow)' }),
      h('path', { d: 'M-130,-60 L130,-60 L130,-114 Q130,-140 104,-140 L-104,-140 Q-130,-140 -130,-114Z', fill: c.coral, stroke: NAVY, 'stroke-width': 10, 'stroke-linejoin': 'round' }),
      h('text', { y: -85, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 36, fill: '#FFFFFF', 'letter-spacing': 4 }, 'DAY'),
      h('text', { id: 'ov-calN', y: 90, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 150, fill: NAVY }, '1'),
      h('path', { id: 'ov-page', d: 'M-120,-60 L120,-60 L120,130 L-120,130Z', fill: '#F1EEE8', opacity: 0 }),
      h('path', { d: 'M-70,-160 L-70,-120 M70,-160 L70,-120', stroke: NAVY, 'stroke-width': 12, 'stroke-linecap': 'round' })),
    h('g', { id: 'ov-when', transform: 'translate(1400 640)', opacity: 0 },
      h('rect', { id: 'ov-whenBg', x: -150, y: -40, width: 300, height: 80, rx: 40, fill: c.navy }),
      h('text', { id: 'ov-whenT', y: 14, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 38, fill: '#FFFFFF' }, 'Right away')),
    // check-in card
    h('g', { id: 'ov-check', transform: 'translate(1400 460)', opacity: 0 },
      h('rect', { x: -300, y: -230, width: 600, height: 460, rx: 34, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('text', { x: -240, y: -140, 'font-family': F.display, 'font-weight': 800, 'font-size': 46, fill: NAVY }, 'How do I feel?'),
      h('rect', { x: -240, y: -110, width: 70, height: 7, rx: 3.5, fill: c.teal }),
      ...['Headache or dizziness', 'Sleep or energy changes', 'Trouble focusing'].map((s, i) => h('g', { transform: `translate(-240 ${-30 + i * 90})` },
        h('rect', { x: 0, y: -26, width: 52, height: 52, rx: 12, fill: 'none', stroke: NAVY, 'stroke-width': 5 }),
        h('path', { id: `ov-ck${i}`, d: 'M12,0 l12,12 l20,-24', stroke: c.teal, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }),
        h('text', { x: 80, y: 12, 'font-family': F.body, 'font-weight': 500, 'font-size': 34, fill: NAVY }, s)))),
    // takeaway steps
    h('g', { id: 'ov-s1w', transform: 'translate(1080 390)' }, step('ov-s1', 1, 'Stop the activity', '', h('g', {},
      h('path', { d: 'M-22,-54 L22,-54 L54,-22 L54,22 L22,54 L-22,54 L-54,22 L-54,-22Z', fill: c.coral }),
      h('rect', { x: -30, y: -8, width: 60, height: 16, rx: 6, fill: '#FFFFFF' })))),
    h('g', { id: 'ov-s2w', transform: 'translate(1080 580)' }, step('ov-s2', 2, 'Get evaluated', 'by a qualified professional', h('g', {},
      h('rect', { x: -44, y: -54, width: 88, height: 108, rx: 12, fill: c.teal }),
      h('rect', { x: -22, y: -64, width: 44, height: 22, rx: 8, fill: NAVY }),
      h('path', { d: 'M-22,4 l14,14 l30,-32', stroke: '#FFFFFF', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })))),
  );

  return {
    markup,
    mount(svg) {
      const run = measureRun(svg, hook.split(' '), qStyle, 16);
      const g = svg.querySelector('#ov-qw');
      g.setAttribute('transform', tr(-run.width / 2, 0));
      placeRun(g, run, qStyle, 'ov-w');
      nWords = run.items.length; qWidth = run.width;
      const bg = svg.querySelector('#ov-qbg');
      bg.setAttribute('x', (-qWidth / 2 - 44).toFixed(1)); bg.setAttribute('width', (qWidth + 88).toFixed(1));
    },
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);

      // hook question
      const qOut = prog(t, T.hookTextOut - 0.3, T.hookTextOut, inCubic);
      for (let i = 0; i < nWords; i++) {
        const k = prog(t, T.hookTextIn + i * 0.09, T.hookTextIn + i * 0.09 + 0.5, outCubic);
        set(`ov-w${i}`, 'transform', tr(0, (1 - k) * 36 - qOut * 20));
        set(`ov-w${i}`, 'opacity', (k * (1 - qOut)).toFixed(3));
      }

      const bgK = prog(t, T.hookTextIn - 0.1, T.hookTextIn + 0.3, outCubic) * (1 - qOut);
      set('ov-qbg', 'opacity', (bgK * 0.92).toFixed(3));
      set('ov-qbg', 'transform', `translate(0 ${((1 - bgK) * 12).toFixed(1)})`);

      // section eyebrows
      const eb = (id, a, b) => set(id, 'opacity', (prog(t, a, a + 0.4) * (1 - prog(t, b - 0.3, b))).toFixed(3));
      eb('ov-e4', T.toStudio + 0.6, T.koClear + 0.2); eb('ov-e6', T.koEnd + 0.2, T.timeEnd); eb('ov-e7', T.takeaway + 0.4, T.badgeIn);

      // NO KNOCKOUT REQUIRED.
      const slam = prog(t, T.stamp, T.stamp + 0.28, inCubic);
      const koOut = prog(t, T.koEnd - 0.5, T.koEnd - 0.1, inCubic);
      set('ov-ko', 'opacity', (slam > 0 ? 1 - koOut : 0).toFixed(3));
      const settle = t > T.stamp + 0.28 ? Math.exp(-(t - T.stamp - 0.28) * 9) * Math.cos((t - T.stamp - 0.28) * 30) * 0.05 : 0;
      set('ov-koS', 'transform', `${rot(-5)} ${sc(lerp(2.2, 1, slam) * (1 - settle) * (1 - koOut * 0.2))}`);
      const sub = prog(t, T.inFact, T.inFact + 0.5, outCubic);
      set('ov-kosub', 'opacity', (sub * (1 - koOut)).toFixed(3));
      set('ov-kosub', 'transform', tr(0, (1 - sub) * 20));

      // I feel fine!
      const fine = outBack(prog(t, T.feelFine, T.feelFine + 0.35), 2);
      const fineOut = prog(t, T.feelFineOut - 0.25, T.feelFineOut);
      set('ov-fine', 'opacity', (prog(t, T.feelFine, T.feelFine + 0.1) * (1 - fineOut)).toFixed(3));
      set('ov-fine', 'transform', `translate(930 300) ${sc(fine * (1 - fineOut * 0.3))}`);

      // clock (right away → hours) then calendar (days)
      const clockIn = outBack(prog(t, T.rightAway - 0.3, T.rightAway + 0.1), 1.6);
      const toCal = prog(t, T.days - 0.15, T.days + 0.2, inOutCubic);
      const calOut = prog(t, T.payAttention - 0.4, T.payAttention, inCubic);
      set('ov-clock', 'opacity', (clockIn > 0 ? Math.min(1, clockIn) * (1 - toCal) : 0).toFixed(3));
      set('ov-clock', 'transform', `translate(1400 420) ${sc(clockIn * (1 - toCal * 0.3))}`);
      const spin = prog(t, T.hours - 0.3, T.days, (k) => k * k) * 8;   // hours fly by
      set('ov-hMin', 'transform', rot(90 + spin * 360));
      set('ov-hHour', 'transform', rot(300 + spin * 30));
      set('ov-cal', 'opacity', (toCal * (1 - calOut)).toFixed(3));
      set('ov-cal', 'transform', `translate(1400 420) ${sc((0.7 + 0.3 * outBack(toCal, 1.5)) * (1 - calOut * 0.2))}`);
      const flipK = prog(t, T.days + 0.25, T.days + 1.45);
      const day = 1 + Math.min(2, Math.floor(flipK * 3));
      $('ov-calN').textContent = String(day);
      const pf = (flipK * 3) % 1;
      set('ov-page', 'opacity', flipK > 0 && flipK < 1 ? (1 - pf).toFixed(2) : 0);
      set('ov-page', 'transform', `translate(0 -60) ${sc(1, Math.max(0.01, 1 - pf))} translate(0 60)`);
      const when = t < T.hours ? 'Right away' : t < T.days ? 'Hours later' : 'Days later';
      $('ov-whenT').textContent = when;
      const wIn = prog(t, T.rightAway, T.rightAway + 0.3);
      set('ov-when', 'opacity', (wIn * (1 - calOut)).toFixed(3));
      const bump = [T.rightAway, T.hours, T.days].reduce((m, a) => Math.max(m, Math.max(0, Math.sin(clamp((t - a) / 0.3) * Math.PI))), 0);
      set('ov-when', 'transform', `translate(1400 640) ${sc(1 + bump * 0.08)}`);
      set('ov-whenBg', 'fill', t < T.hours ? c.navy : t < T.days ? c.violet : c.coral);

      // check-in card
      const ck = outBack(prog(t, T.payAttention, T.payAttention + 0.4), 1.5);
      const ckOut = prog(t, T.timeEnd - 0.4, T.timeEnd, inCubic);
      set('ov-check', 'opacity', (prog(t, T.payAttention, T.payAttention + 0.15) * (1 - ckOut)).toFixed(3));
      set('ov-check', 'transform', `translate(1400 460) ${sc(0.85 + 0.15 * ck)}`);
      for (let i = 0; i < 3; i++) set(`ov-ck${i}`, 'stroke-dasharray', `${prog(t, T.payAttention + 0.3 + i * 0.4, T.payAttention + 0.6 + i * 0.4).toFixed(3)} 1`);

      // takeaway steps
      for (const [id, at] of [['ov-s1', T.stop], ['ov-s2', T.evaluate]]) {
        const k = outBack(prog(t, at, at + 0.4), 1.5), out = prog(t, T.chipsOut, T.chipsOut + 0.35, inCubic);
        set(id, 'opacity', (prog(t, at, at + 0.15) * (1 - out)).toFixed(3));
        set(id, 'transform', `translate(${(1 - k) * 80 + out * 200} 0)`);
      }
    },
  };
}
