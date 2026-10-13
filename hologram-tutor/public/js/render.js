// Renders the tutor's Markdown safely: raw HTML from the model is shown as
// text, and links may only point at http(s) URLs.

import { Marked } from '/vendor/marked/marked.esm.js';

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!/^https?:\/\//i.test(href)) return label;
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    },
    image({ text }) {
      return escapeHtml(text ?? '');
    },
  },
});

export function renderMarkdown(text) {
  return marked.parse(text ?? '');
}

export function renderPlain(text) {
  return escapeHtml(text ?? '').replace(/\n/g, '<br>');
}
