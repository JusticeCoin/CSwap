// Intake: from "here is my whole text" to a document of C Swaps the author has reviewed.
//
// Two modes:
//   automatic  the text is chunked, and a translator drafts the lower levels of every chunk worth swapping.
//              Every drafted level is created as provenance "ai" (not reviewed). It becomes "approved" only
//              when the author approves it. Nothing is ever promoted automatically.
//   manual     the text is chunked, the author picks which chunks to swap and writes every level themselves
//              (provenance "author").
//
// The translator is yours to bring: any async function  translate({ text, level, audience, label, index }) => string.
// No model, key or network call is built in. `demoTranslator` below is a no-AI placeholder for the demo page.

import { chunkText } from './chunk.js';
import { DEFAULT_LABELS } from './parse.js';

export const DEFAULT_LEVELS = DEFAULT_LABELS.map((label, index) => ({
  label,
  // what the translator is asked to write for each lower level
  audience: ['the author', 'a reader new to the subject', 'a young reader (a child, or anyone who needs it broken down)'][index],
}));

/**
 * Create the intake document: chunks plus, for each swappable chunk, empty lower levels.
 * @param {string} text
 * @param {{ mode?: 'automatic'|'manual', levels?: Array<{label:string, audience?:string}>, chunk?: object }} [options]
 *   In automatic mode only chunks marked `hard` start with swap on; in manual mode nothing does.
 */
export function createIntake(text, options = {}) {
  const { mode = 'automatic', levels = DEFAULT_LEVELS, chunk = {} } = options;
  const chunks = chunkText(text, chunk).map(c => ({
    ...c,
    swap: mode === 'automatic' && c.hard,
    // levels[0] is the author's own text, verbatim
    levels: levels.map((l, i) => ({
      label: l.label, audience: l.audience,
      text: i === 0 ? c.text : '',
      provenance: 'author',
      status: i === 0 ? 'done' : 'empty', // empty | drafting | done | error
    })),
  }));
  return { mode, levels, chunks };
}

const find = (doc, id) => doc.chunks.find(c => c.id === id);

/** Turn a chunk's swap on or off. */
export function setSwap(doc, id, on) { find(doc, id).swap = !!on; return doc; }

/** The author types a level by hand: provenance is "author". */
export function writeLevel(doc, id, index, text) {
  const l = find(doc, id).levels[index];
  l.text = text;
  l.provenance = 'author';
  l.status = text.trim() ? 'done' : 'empty';
  return doc;
}

/**
 * The author edits an AI draft. It stays "ai" (not reviewed) until they approve it,
 * so a fixed-up draft is never passed off as reviewed.
 */
export function editDraft(doc, id, index, text) {
  const l = find(doc, id).levels[index];
  l.text = text;
  if (l.provenance === 'author' && l.status !== 'empty') return doc; // hand-written stays hand-written
  l.provenance = 'ai';
  return doc;
}

/** The author approves an AI-drafted level: "ai" becomes "approved". Hand-written levels are unchanged. */
export function approveLevel(doc, id, index) {
  const l = find(doc, id).levels[index];
  if (l.provenance === 'ai' && l.text.trim()) l.provenance = 'approved';
  return doc;
}

export function approveAll(doc) {
  doc.chunks.forEach(c => c.swap && c.levels.forEach((_, i) => approveLevel(doc, c.id, i)));
  return doc;
}

/**
 * Ask the translator for the lower levels of one chunk. Drafts are created as "ai" (not reviewed).
 * Each level is drafted from the author's own text (level 0), not from another draft, so errors don't compound.
 * A failure marks that level `error` and leaves the rest untouched.
 */
export async function draftChunk(doc, id, translate) {
  const chunk = find(doc, id);
  const source = chunk.levels[0].text;
  await Promise.all(chunk.levels.map(async (l, i) => {
    if (i === 0 || l.text.trim()) return; // never overwrite existing work
    l.status = 'drafting';
    try {
      const out = await translate({ text: source, level: l.label, audience: l.audience, label: l.label, index: i });
      l.text = String(out ?? '').trim();
      l.provenance = 'ai';
      l.status = l.text ? 'done' : 'error';
    } catch (err) {
      l.status = 'error';
      l.error = String(err?.message ?? err);
    }
  }));
  return doc;
}

/** Automatic mode: draft every chunk that has swap on. `onProgress(doc, chunk)` fires after each chunk. */
export async function draftAll(doc, translate, onProgress) {
  for (const c of doc.chunks.filter(c => c.swap)) {
    await draftChunk(doc, c.id, translate);
    onProgress?.(doc, c);
  }
  return doc;
}

/** How far along is the review? */
export function progress(doc) {
  const swaps = doc.chunks.filter(c => c.swap);
  const lower = swaps.flatMap(c => c.levels.slice(1));
  return {
    swaps: swaps.length,
    levels: lower.length,
    reviewed: lower.filter(l => l.provenance !== 'ai' && l.text.trim()).length,
    notReviewed: lower.filter(l => l.provenance === 'ai').length,
    missing: lower.filter(l => !l.text.trim()).length,
  };
}

const FLAG = { author: '', approved: '+', ai: '~' };

/**
 * Serialise to text: plain chunks as they were, swap chunks as `:::swap` fences. parseCSwaps reads it back.
 * Swap chunks with missing levels are left as plain text (an incomplete swap is not a swap).
 */
export function toSyntax(doc) {
  return doc.chunks.map(c => {
    if (!(c.swap && c.levels.every(l => l.text.trim()))) return c.text;
    const parts = c.levels.map((l, i) => {
      const flag = FLAG[l.provenance] ?? '~'; // unknown fails safe to "not reviewed"
      // the first level needs no separator unless it carries a flag
      return i === 0 && !flag ? l.text : `--- ${l.label}${flag ? ' ' + flag : ''}\n${l.text}`;
    });
    return `:::swap\n${parts.join('\n')}\n:::`;
  }).join('\n\n');
}

/**
 * A stand-in translator for demos and tests. It does NOT use AI: it only shortens sentences and swaps a few
 * long words, so the review flow can be shown without a key. Replace it with your own translate().
 */
export async function demoTranslator({ text, index }) {
  await new Promise(r => setTimeout(r, 250 + Math.random() * 350));
  const plain = { utilize: 'use', approximately: 'about', demonstrate: 'show', facilitate: 'help', subsequently: 'then',
    commence: 'start', therefore: 'so', however: 'but', additional: 'more', obtain: 'get', sufficient: 'enough',
    adjudicated: 'decided', disclosed: 'shown', provisional: 'not final', regarding: 'about', nevertheless: 'still' };
  let t = text.replace(/\b[A-Za-z]+\b/g, w => plain[w.toLowerCase()] ?? w).replace(/\([^)]*\)/g, '').replace(/;\s*/g, '. ');
  let sentences = t.split(/(?<=[.!?])\s+/).map(s => s.replace(/,\s+(which|who|and|but)\b.*$/i, '.'));
  if (index >= 2) sentences = sentences.map(s => s.split(/\s+/).slice(0, 9).join(' ').replace(/[,;:]$/, '')).map(s => (/[.!?]$/.test(s) ? s : s + '.'));
  return sentences.join(' ').replace(/\s+/g, ' ').trim();
}
