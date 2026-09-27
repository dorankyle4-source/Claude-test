// Shared SVG <defs>: filters and gradients used across scenes.
import { h } from './svg.js';

export function sharedDefs(c) {
  return h('defs', {},
    h('filter', { id: 'softBlur', x: '-50%', y: '-50%', width: '200%', height: '200%' }, h('feGaussianBlur', { stdDeviation: 8 })),
    h('filter', { id: 'blur3', x: '-20%', y: '-20%', width: '140%', height: '140%' }, h('feGaussianBlur', { stdDeviation: 3 })),
    h('filter', { id: 'blur14', x: '-50%', y: '-50%', width: '200%', height: '200%' }, h('feGaussianBlur', { stdDeviation: 14 })),
    h('filter', { id: 'glow', x: '-60%', y: '-60%', width: '220%', height: '220%' },
      h('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 10, result: 'b' }),
      h('feMerge', {}, h('feMergeNode', { in: 'b' }), h('feMergeNode', { in: 'SourceGraphic' }))),
    h('filter', { id: 'dropShadow', x: '-40%', y: '-40%', width: '180%', height: '180%' },
      h('feDropShadow', { dx: 0, dy: 8, stdDeviation: 10, 'flood-color': c.navy, 'flood-opacity': 0.18 })),
  );
}
