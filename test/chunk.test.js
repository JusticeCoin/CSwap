import { describe, it, expect } from 'vitest';
import { chunkText, splitSentences, readingEase } from '../src/chunk.js';

describe('chunkText', () => {
  const hard = 'Every adjudicated outcome is weighted seven to three between human and machine reasoning, and the weighting is disclosed alongside each verdict so that no participant must infer how a conclusion was reached.';
  const easy = 'The cat sat on the mat. It was a sunny day and we were happy.';

  it('splits on blank lines and keeps short lines and headings out of swaps', () => {
    const c = chunkText(`# Title\n\n${hard}\n\nYes.\n\n- one\n- two`);
    expect(c.map(x => x.kind)).toEqual(['heading', 'text', 'text', 'list']);
    expect(c.map(x => x.swappable)).toEqual([false, true, false, false]);
  });

  it('marks hard prose and leaves easy prose alone', () => {
    const [h, e] = chunkText(`${hard}\n\n${easy}`);
    expect(h.hard).toBe(true);
    expect(e.swappable).toBe(true);
    expect(e.hard).toBe(false);
    expect(readingEase(easy)).toBeGreaterThan(readingEase(hard));
  });

  it('keeps fenced code whole', () => {
    const c = chunkText('```js\nconst a = 1;\n\nconst b = 2;\n```');
    expect(c).toHaveLength(1);
    expect(c[0].kind).toBe('code');
  });

  it('splits by sentence, and splits long paragraphs in auto mode', () => {
    const para = Array.from({ length: 8 }, (_, i) => `Sentence number ${i + 1} says something fairly long here.`).join(' ');
    expect(chunkText(para, { granularity: 'sentence' })).toHaveLength(8);
    expect(chunkText(para).length).toBeGreaterThan(1);
    expect(chunkText(para, { granularity: 'paragraph' })).toHaveLength(1);
  });

  it('gives stable ids and handles empty input', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText(`${hard}\n\n${easy}`).map(c => c.id)).toEqual(['c1', 'c2']);
  });

  it('splits sentences', () => {
    expect(splitSentences('One thing. Two things! Three?')).toHaveLength(3);
  });
});
