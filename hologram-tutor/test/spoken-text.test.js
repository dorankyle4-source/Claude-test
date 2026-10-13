import { test } from 'node:test';
import assert from 'node:assert/strict';
import { takeSentences, toSpeakable, latexToWords } from '../public/js/spoken-text.js';

test('takeSentences returns complete sentences and keeps the unfinished tail', () => {
  const { chunks, rest } = takeSentences('Gravity pulls masses together. It weakens with dist');
  assert.deepEqual(chunks, ['Gravity pulls masses together.']);
  assert.equal(rest, ' It weakens with dist');
});

test('takeSentences merges very short sentences with the next one', () => {
  const { chunks } = takeSentences('Yes. That is exactly how a capacitor stores energy. ');
  assert.deepEqual(chunks, ['Yes. That is exactly how a capacitor stores energy.']);
});

test('takeSentences does not split inside inline maths or decimals', () => {
  const { chunks, rest } = takeSentences('The value of $x = 3.5. y$ is what we');
  assert.deepEqual(chunks, []);
  assert.equal(rest, 'The value of $x = 3.5. y$ is what we');
});

test('takeSentences waits for a code block to close', () => {
  const partial = 'Here is code:\n```py\nprint(1)\n';
  assert.deepEqual(takeSentences(partial).chunks, []);
});

test('takeSentences flushes everything when final', () => {
  const { chunks, rest } = takeSentences('Short one', { final: true });
  assert.deepEqual(chunks, ['Short one']);
  assert.equal(rest, '');
});

test('latexToWords reads common notation', () => {
  assert.equal(latexToWords('a^2 + b^2 = c^2'), 'a squared plus b squared equals c squared');
  assert.equal(latexToWords('\\frac{1}{2}'), '1 over 2');
  assert.equal(latexToWords('\\sqrt{x}'), 'the square root of x');
  assert.equal(latexToWords('e^{i\\pi}'), 'e to the power i pi');
});

test('toSpeakable strips Markdown and speaks maths', () => {
  const md = '## Pythagoras\n- **Rule:** $a^2 + b^2 = c^2$\n- See [docs](https://example.com)';
  assert.equal(toSpeakable(md), 'Pythagoras Rule: a squared plus b squared equals c squared See docs');
});

test('toSpeakable replaces code blocks with a pointer to the screen', () => {
  assert.equal(toSpeakable('Try this:\n```js\nlet x = 1;\n```'), 'Try this: (see the code on screen)');
});
