// Intake step 1: split a whole text into chunks, and say which chunks are worth a C Swap.
// Pure functions, no DOM, no dependencies.

const SENTENCE_END = /(?<=[.!?…])["')\]]*\s+(?=[A-Z"'(\[0-9])/;

/** Split a paragraph into sentences (a plain heuristic, good enough for prose; the author can always merge or split by hand). */
export function splitSentences(text) {
  return String(text).trim().split(SENTENCE_END).map(s => s.trim()).filter(Boolean);
}

const syllables = w => {
  const m = w.toLowerCase().replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, m ? m.length : 1);
};

/**
 * Flesch reading ease, 0-100+: higher is easier. About 60-70 is plain English; under 40 is difficult.
 * English-oriented; for other languages pass your own `score` to chunkText.
 */
export function readingEase(text) {
  const sentences = Math.max(1, splitSentences(text).length);
  const words = String(text).match(/[\p{L}\p{N}'’-]+/gu) || [];
  if (!words.length) return 100;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length);
}

/**
 * Split text into chunks.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {'auto'|'paragraph'|'sentence'} [options.granularity='auto']
 *   paragraph: one chunk per paragraph. sentence: one per sentence.
 *   auto: one per paragraph, but a paragraph over `maxChars` is split into sentence groups.
 * @param {number} [options.maxChars=320]  auto mode: longest chunk before splitting.
 * @param {number} [options.minChars=40]   shorter chunks are never swappable (headings, one-liners).
 * @param {number} [options.hardBelow=60]  chunks scoring under this reading ease are marked `hard`.
 * @param {(text:string)=>number} [options.score=readingEase]
 * @returns {Array<{id:string, text:string, kind:'text'|'heading'|'code'|'list', swappable:boolean, hard:boolean, ease:number|null}>}
 *   `swappable`: prose long enough to be worth a swap. `hard`: swappable and difficult to read; automated mode
 *   swaps those by default and leaves easy prose alone.
 */
export function chunkText(text, options = {}) {
  const { granularity = 'auto', maxChars = 320, minChars = 40, hardBelow = 60, score = readingEase } = options;
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');

  // 1. blocks separated by blank lines; fenced code stays together
  const blocks = [];
  let cur = [];
  let fence = false;
  const close = () => { if (cur.length) blocks.push(cur.join('\n')); cur = []; };
  for (const line of lines) {
    if (/^\s*```/.test(line)) { fence = !fence; cur.push(line); continue; }
    if (!fence && !line.trim()) { close(); continue; }
    cur.push(line);
  }
  close();

  // 2. classify, and split long prose
  const chunks = [];
  const add = (t, kind) => {
    const swappable = kind === 'text' && t.length >= minChars;
    const ease = swappable ? score(t) : null;
    chunks.push({ id: `c${chunks.length + 1}`, text: t, kind, swappable, hard: swappable && ease < hardBelow, ease });
  };
  for (const b of blocks) {
    if (/^\s*```/.test(b)) add(b, 'code');
    else if (/^\s*#{1,6}\s/.test(b)) add(b, 'heading');
    else if (/^\s*([-*+]|\d+\.)\s/.test(b)) add(b, 'list');
    else if (granularity === 'sentence') splitSentences(b.replace(/\s*\n\s*/g, ' ')).forEach(s => add(s, 'text'));
    else if (granularity === 'auto' && b.length > maxChars) {
      let group = '';
      for (const s of splitSentences(b.replace(/\s*\n\s*/g, ' '))) {
        if (group && (group + ' ' + s).length > maxChars) { add(group, 'text'); group = s; }
        else group = group ? `${group} ${s}` : s;
      }
      if (group) add(group, 'text');
    } else add(b.replace(/\s*\n\s*/g, ' '), 'text');
  }
  return chunks;
}
