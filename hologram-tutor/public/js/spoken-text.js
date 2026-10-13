// Pure text helpers for speech. No browser APIs here, so they run in Node tests.

const MIN_CHUNK_CHARS = 24;

// Pulls complete sentences off the front of a streaming buffer so speech can
// start before the whole answer has arrived. Returns { chunks, rest }.
// Never splits inside an unfinished code block or $...$ maths.
export function takeSentences(buffer, { final = false } = {}) {
  const chunks = [];
  let start = 0;
  let pending = '';

  for (let i = 0; i < buffer.length; i++) {
    const ch = buffer[i];
    const isBreak =
      ch === '\n' ||
      ((ch === '.' || ch === '!' || ch === '?' || ch === ':' || ch === ';') && /\s/.test(buffer[i + 1] ?? ''));
    if (!isBreak) continue;

    const candidate = pending + buffer.slice(start, i + 1);
    if (insideCodeOrMath(candidate)) continue;

    start = i + 1;
    if (candidate.trim().length < MIN_CHUNK_CHARS) {
      pending = candidate; // too short to sound natural on its own; merge with the next one
      continue;
    }
    chunks.push(candidate.trim());
    pending = '';
  }

  let rest = pending + buffer.slice(start);
  if (final) {
    if (rest.trim()) chunks.push(rest.trim());
    rest = '';
  }
  return { chunks, rest };
}

function insideCodeOrMath(text) {
  const fences = (text.match(/```/g) ?? []).length;
  if (fences % 2 === 1) return true;
  const withoutCode = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const dollars = (withoutCode.match(/(?<!\\)\$/g) ?? []).length;
  return dollars % 2 === 1;
}

const GREEK = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'rho', 'sigma', 'tau', 'phi', 'omega',
];

// Turns a little LaTeX into words. Deliberately simple; a later phase will ask
// the model for separate spoken text for complex equations.
export function latexToWords(tex) {
  let s = tex;
  for (let pass = 0; pass < 3; pass++) {
    s = s
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $1 over $2 ')
      .replace(/\\sqrt\{([^{}]*)\}/g, ' the square root of $1 ')
      .replace(/\^\{?2\}?(?![0-9])/g, ' squared ')
      .replace(/\^\{?3\}?(?![0-9])/g, ' cubed ')
      .replace(/\^\{([^{}]*)\}/g, ' to the power $1 ')
      .replace(/\^(\w)/g, ' to the power $1 ')
      .replace(/_\{([^{}]*)\}/g, ' sub $1 ')
      .replace(/_(\w)/g, ' sub $1 ');
  }
  s = s
    .replace(/\\(cdot|times)/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\\(leq|le)\b/g, ' is less than or equal to ')
    .replace(/\\(geq|ge)\b/g, ' is greater than or equal to ')
    .replace(/\\(neq|ne)\b/g, ' is not equal to ')
    .replace(/\\approx/g, ' is approximately ')
    .replace(/\\infty/g, ' infinity ')
    .replace(/\\int/g, ' the integral of ')
    .replace(/\\sum/g, ' the sum of ')
    .replace(new RegExp(`\\\\(${GREEK.join('|')})\\b`, 'gi'), ' $1 ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/=/g, ' equals ')
    .replace(/</g, ' is less than ')
    .replace(/>/g, ' is greater than ')
    .replace(/\+/g, ' plus ')
    .replace(/(\s)-(\s)/g, '$1minus$2')
    .replace(/\//g, ' over ');
  return s.replace(/\s+/g, ' ').trim();
}

// Converts Markdown + inline LaTeX into something pleasant to hear.
export function toSpeakable(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' (see the code on screen) ')
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => ` ${latexToWords(tex)} `)
    .replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_, tex) => ` ${latexToWords(tex)} `)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(?<![\w*])[*_](?!\s)(.+?)(?<!\s)[*_](?![\w*])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
