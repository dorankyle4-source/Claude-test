// Picks the character renderer. Every renderer has the same interface:
//   setState('idle' | 'thinking' | 'speaking' | 'error'), mouthPulse(), destroy()
// Add ?character=2d to the URL to force the lightweight 2D fallback.

import { createCharacter2D } from './character-2d.js';

export async function createCharacter(container) {
  const forced2D = new URLSearchParams(location.search).get('character') === '2d';
  if (!forced2D && webglAvailable()) {
    try {
      const { createCharacter3D } = await import('./character-3d.js');
      return createCharacter3D(container);
    } catch (err) {
      console.warn('3D character failed to load; using the 2D fallback.', err);
    }
  }
  return createCharacter2D(container);
}

function webglAvailable() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}
