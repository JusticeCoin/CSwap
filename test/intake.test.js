import { describe, it, expect } from 'vitest';
import {
  createIntake, draftAll, draftChunk, setSwap, writeLevel, editDraft, approveLevel, approveAll, progress, toSyntax,
} from '../src/intake.js';
import { parseCSwaps } from '../src/parse.js';

const hard = 'Every adjudicated outcome is weighted seven to three between human and machine reasoning, and the weighting is disclosed alongside each verdict so that no participant must infer how a conclusion was reached.';
const easy = 'The cat sat on the mat. It was a sunny day and we were happy.';
const text = `${hard}\n\n${easy}`;
const fake = async ({ level }) => `draft ${level}`;

describe('automatic mode', () => {
  it('swaps only the hard chunks and drafts every lower level as "ai" (not reviewed)', async () => {
    const doc = createIntake(text);
    expect(doc.chunks.map(c => c.swap)).toEqual([true, false]);
    await draftAll(doc, fake);
    const [c] = doc.chunks;
    expect(c.levels.map(l => l.provenance)).toEqual(['author', 'ai', 'ai']);
    expect(c.levels[1].text).toBe('draft Beginner');
    expect(progress(doc)).toMatchObject({ swaps: 1, notReviewed: 2, missing: 0 });
  });

  it('translator receives the author text, level and audience', async () => {
    const seen = [];
    const doc = createIntake(text);
    await draftAll(doc, async args => { seen.push(args); return 'x'; });
    expect(seen[0]).toMatchObject({ text: hard, level: 'Beginner', index: 1 });
    expect(seen[1].level).toBe('Cub');
    expect(seen[1].audience).toMatch(/young/);
  });

  it('a failing translator marks the level as error and does not crash', async () => {
    const doc = createIntake(text);
    await draftAll(doc, async () => { throw new Error('quota'); });
    expect(doc.chunks[0].levels[1]).toMatchObject({ status: 'error', error: 'quota', text: '' });
    expect(toSyntax(doc)).not.toContain(':::swap'); // incomplete swap stays plain text
  });

  it('never promotes a draft without the author: edit keeps "ai", approve makes "approved"', async () => {
    const doc = createIntake(text);
    await draftAll(doc, fake);
    const id = doc.chunks[0].id;
    editDraft(doc, id, 1, 'fixed by hand');
    expect(doc.chunks[0].levels[1].provenance).toBe('ai');
    approveLevel(doc, id, 1);
    expect(doc.chunks[0].levels[1].provenance).toBe('approved');
    approveAll(doc);
    expect(progress(doc).notReviewed).toBe(0);
  });

  it('never overwrites a level the author already wrote', async () => {
    const doc = createIntake(text);
    writeLevel(doc, doc.chunks[0].id, 1, 'mine');
    await draftChunk(doc, doc.chunks[0].id, fake);
    expect(doc.chunks[0].levels[1]).toMatchObject({ text: 'mine', provenance: 'author' });
    expect(doc.chunks[0].levels[2].provenance).toBe('ai');
  });
});

describe('manual mode', () => {
  it('starts with nothing swapped; hand-written levels are "author"', () => {
    const doc = createIntake(text, { mode: 'manual' });
    expect(doc.chunks.every(c => !c.swap)).toBe(true);
    const id = doc.chunks[1].id;
    setSwap(doc, id, true);
    writeLevel(doc, id, 1, 'Simple.');
    writeLevel(doc, id, 2, 'Simplest.');
    expect(doc.chunks[1].levels.map(l => l.provenance)).toEqual(['author', 'author', 'author']);
  });
});

describe('toSyntax round trip', () => {
  it('writes fences that parseCSwaps reads back, with flags', async () => {
    const doc = createIntake(text);
    await draftAll(doc, fake);
    approveLevel(doc, doc.chunks[0].id, 1);
    const segs = parseCSwaps(toSyntax(doc));
    const swap = segs.find(s => s.type === 'cswap');
    expect(swap.levels.map(l => l.provenance)).toEqual(['author', 'approved', 'ai']);
    expect(swap.levels[0].text).toBe(hard);
    expect(segs.at(-1).text).toContain('The cat sat');
  });
});
