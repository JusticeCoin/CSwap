// C Swap parser: pure functions, no DOM, no dependencies.
//
// Two syntaxes produce the same segments:
//
//  1. Line syntax. An "A. ..." block followed by "B. ..." and "C. ..." blocks, in that order.
//     Optional flags between the letter and the dot:
//        *  start on this level (default is the first)
//        +  AI-drafted, author approved
//        ~  AI generated, not reviewed by the author
//     e.g.  B+*. Plain-language version that opens first.
//     A blank line ends the C block. A short plain "A. Author" list (A under 20 chars) is not a swap.
//
//  2. Fenced block. Any number of levels, custom labels:
//        :::swap
//        Full-strength text.
//        --- Beginner +
//        Plainer text.
//        --- Cub ~*
//        Simplest text.
//        :::
//     The text before the first "---" is the first level (label "Author"). A separator is
//     "--- Label flags"; the label and the flags are both optional.

export const PROVENANCE = {
  author: { text: 'Written by the author' },
  approved: { text: 'AI-drafted · Author approved' },
  ai: { text: 'AI generated · not reviewed by the author' },
};

export const DEFAULT_LABELS = ['Author', 'Beginner', 'Cub'];
const KEYS = ['A', 'B', 'C'];
const MARK = /^\s*([ABC])([*+~]*)\.\s+(.*)$/;
const MIN_AUTHOR_CHARS = 20;

/** Normalise a provenance value. Anything unrecognised fails safe to "ai" (not reviewed). */
export function normalizeProvenance(value, fallback = 'author') {
  if (value == null || value === '') return fallback;
  return Object.hasOwn(PROVENANCE, value) ? value : 'ai';
}

// `defaultProvenance` is what a level with no flag gets. "author" is right only for hand-written text;
// AI-assisted flows must pass "ai" so an unflagged level reads as not reviewed.
function provenanceOf(flags, defaultProvenance) {
  if (flags.includes('~')) return 'ai';
  if (flags.includes('+')) return 'approved';
  return normalizeProvenance(defaultProvenance);
}

function makeSwap(levels, startIndex) {
  const swap = { type: 'cswap', levels, startIndex };
  // Legacy shape used by the original parseCSwaps (three fixed levels).
  if (levels.length === 3) {
    swap.A = levels[0].text; swap.B = levels[1].text; swap.C = levels[2].text;
    swap.start = KEYS[startIndex];
    swap.provenance = { A: levels[0].provenance, B: levels[1].provenance, C: levels[2].provenance };
  }
  return swap;
}

const SEPARATOR = /^---(?:\s+(.*))?\s*$/;

function parseSeparator(line, defaultProvenance) {
  const m = SEPARATOR.exec(line);
  if (!m) return null;
  let rest = (m[1] || '').trim();
  let flags = '';
  const fm = /(?:^|\s)([*+~]+)$/.exec(rest);
  if (fm) { flags = fm[1]; rest = rest.slice(0, fm.index).trim(); }
  return { label: rest, flags, provenance: provenanceOf(flags, defaultProvenance) };
}

function parseFenced(blockLines, defaultProvenance) {
  const levels = [];
  let cur = { label: '', flags: '', provenance: provenanceOf('', defaultProvenance), lines: [] };
  const push = () => levels.push(cur);
  for (const line of blockLines) {
    const sep = parseSeparator(line, defaultProvenance);
    if (sep) {
      // an empty lead-in before an explicit first separator is not a level
      if (levels.length === 0 && !cur.lines.join('').trim()) cur = { ...sep, lines: [] };
      else { push(); cur = { ...sep, lines: [] }; }
    } else cur.lines.push(line);
  }
  push();
  const out = levels.map((l, i) => ({
    label: l.label || DEFAULT_LABELS[i] || `Level ${i + 1}`,
    text: l.lines.join('\n').trim(),
    provenance: l.provenance,
    start: l.flags.includes('*'),
  }));
  if (out.length < 2 || out.some(l => !l.text)) return null;
  const startIndex = Math.max(0, out.findIndex(l => l.start));
  return makeSwap(out.map(({ start, ...l }) => l), startIndex);
}

function parseLineGroup(lines, i, defaultProvenance) {
  const m = MARK.exec(lines[i]);
  if (m?.[1] !== 'A') return null;
  const parts = { A: [m[3]], B: [], C: [] };
  const meta = { A: m[2], B: '', C: '' };
  let cur = 'A';
  let j = i + 1;
  for (; j < lines.length; j++) {
    const n = MARK.exec(lines[j]);
    if (n && ((cur === 'A' && n[1] === 'B') || (cur === 'B' && n[1] === 'C'))) {
      cur = n[1];
      meta[cur] = n[2];
      parts[cur].push(n[3]);
    } else if (cur === 'C' && !lines[j].trim()) {
      break; // blank line ends the C block
    } else {
      parts[cur].push(lines[j]);
    }
  }
  const clean = k => parts[k].join('\n').trim();
  // A short A. / B. / C. list (e.g. "A. Author") is a plain list, not a swap.
  if (!(parts.B.length && parts.C.length && clean('B') && clean('C') && clean('A').length >= MIN_AUTHOR_CHARS)) return null;
  const levels = KEYS.map((k, idx) => ({
    label: DEFAULT_LABELS[idx], text: clean(k), provenance: provenanceOf(meta[k], defaultProvenance),
  }));
  const startIndex = Math.max(0, KEYS.findIndex(k => meta[k].includes('*')));
  return { swap: makeSwap(levels, startIndex), next: j };
}

/**
 * Split a body of text into plain-text segments and C Swap groups.
 * @param {string} body
 * @param {{ defaultProvenance?: 'author'|'approved'|'ai' }} [options]
 *   defaultProvenance: provenance of a level with no flag. Default "author" (hand-written text).
 *   Pass "ai" for AI-assisted flows so unflagged levels read "not reviewed".
 * @returns {Array<{type:'text', text:string} | {type:'cswap', levels:Array<{label:string,text:string,provenance:string}>, startIndex:number}>}
 */
export function parseCSwaps(body, options = {}) {
  const { defaultProvenance = 'author' } = options;
  const lines = String(body ?? '').split('\n');
  const segments = [];
  let text = [];
  const flush = () => {
    if (text.length) segments.push({ type: 'text', text: text.join('\n') });
    text = [];
  };

  for (let i = 0; i < lines.length; i++) {
    if (/^:::swap\s*$/.test(lines[i])) {
      const end = lines.findIndex((l, k) => k > i && /^:::\s*$/.test(l));
      if (end > i) {
        const swap = parseFenced(lines.slice(i + 1, end), defaultProvenance);
        if (swap) { flush(); segments.push(swap); i = end; continue; }
      }
    }
    const group = parseLineGroup(lines, i, defaultProvenance);
    if (group) { flush(); segments.push(group.swap); i = group.next - 1; continue; }
    text.push(lines[i]);
  }
  flush();
  return segments;
}

const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Render one parsed swap segment as <c-swap> markup (text is HTML-escaped). */
export function renderCSwap(swap) {
  const start = swap.startIndex ? ` start="${swap.startIndex + 1}"` : '';
  const levels = swap.levels.map(l =>
    `<c-level label="${escapeHtml(l.label)}" provenance="${l.provenance}">${escapeHtml(l.text)}</c-level>`).join('');
  return `<c-swap${start}>${levels}</c-swap>`;
}

/** Convert a body of text to HTML: swaps become <c-swap>, other text is escaped and left as-is. */
export function cswapsToHtml(body, options) {
  return parseCSwaps(body, options)
    .map(s => (s.type === 'cswap' ? renderCSwap(s) : escapeHtml(s.text)))
    .join('\n');
}
