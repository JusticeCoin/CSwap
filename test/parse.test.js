import { describe, it, expect } from 'vitest';
import { parseCSwaps, cswapsToHtml, normalizeProvenance } from '../src/parse.js';

const A = 'A. This is a full-strength sentence from the author.';

describe('line syntax', () => {
  it('parses A/B/C into a swap with legacy fields', () => {
    const [s] = parseCSwaps(`${A}\nB. Plainer.\nC. Simplest.`);
    expect(s.type).toBe('cswap');
    expect([s.A, s.B, s.C]).toEqual(['This is a full-strength sentence from the author.', 'Plainer.', 'Simplest.']);
    expect(s.start).toBe('A');
    expect(s.startIndex).toBe(0);
    expect(s.provenance).toEqual({ A: 'author', B: 'author', C: 'author' });
    expect(s.levels.map(l => l.label)).toEqual(['Author', 'Beginner', 'Cub']);
  });

  it('reads the * + ~ flags', () => {
    const [s] = parseCSwaps(`${A}\nB+*. Plainer.\nC~. Simplest.`);
    expect(s.start).toBe('B');
    expect(s.provenance).toEqual({ A: 'author', B: 'approved', C: 'ai' });
  });

  it('keeps text around the swap and ends the C block at a blank line', () => {
    const segs = parseCSwaps(`Intro\n\n${A}\nB. Plainer.\nC. Simplest.\n\nOutro`);
    expect(segs.map(s => s.type)).toEqual(['text', 'cswap', 'text']);
    expect(segs[2].text).toBe('\nOutro');
  });

  it('a short plain A/B/C list is not a swap', () => {
    const segs = parseCSwaps('A. Author\nB. Beginner\nC. Cub');
    expect(segs).toHaveLength(1);
    expect(segs[0].type).toBe('text');
  });

  it('needs B and C', () => {
    expect(parseCSwaps(`${A}\nB. Only two.`)[0].type).toBe('text');
  });
});

describe('fenced syntax', () => {
  const fence = `:::swap
Full-strength text here.
--- Beginner +
Plainer text.
--- Cub ~*
Simplest text.
:::`;

  it('parses levels, labels, flags and start', () => {
    const [s] = parseCSwaps(fence);
    expect(s.levels).toEqual([
      { label: 'Author', text: 'Full-strength text here.', provenance: 'author' },
      { label: 'Beginner', text: 'Plainer text.', provenance: 'approved' },
      { label: 'Cub', text: 'Simplest text.', provenance: 'ai' },
    ]);
    expect(s.startIndex).toBe(2);
  });

  it('supports any number of levels with custom labels', () => {
    const [s] = parseCSwaps(':::swap\nOne\n--- Two\nb\n--- Three\nc\n--- Four\nd\n:::');
    expect(s.levels.map(l => l.label)).toEqual(['Author', 'Two', 'Three', 'Four']);
  });

  it('allows an explicit first separator', () => {
    const [s] = parseCSwaps(':::swap\n--- Expert\nHard.\n--- Plain\nEasy.\n:::');
    expect(s.levels.map(l => l.label)).toEqual(['Expert', 'Plain']);
  });

  it('leaves an unterminated or single-level fence as text', () => {
    expect(parseCSwaps(':::swap\nOne\n--- Two\nb')[0].type).toBe('text');
    expect(parseCSwaps(':::swap\nOnly one\n:::')[0].type).toBe('text');
  });
});

describe('provenance defaults', () => {
  it('hand-written text defaults to author', () => {
    expect(parseCSwaps(`${A}\nB. x\nC. y`)[0].provenance.B).toBe('author');
  });
  it('AI-assisted flows default unflagged levels to ai (not reviewed)', () => {
    const [s] = parseCSwaps(`${A}\nB+. x\nC. y`, { defaultProvenance: 'ai' });
    expect(s.provenance).toEqual({ A: 'ai', B: 'approved', C: 'ai' });
  });
  it('unknown values fail safe to ai', () => {
    expect(normalizeProvenance('bogus')).toBe('ai');
    expect(normalizeProvenance(undefined)).toBe('author');
  });
});

describe('html', () => {
  it('escapes text and emits all levels', () => {
    const html = cswapsToHtml(`${A.replace('sentence', '<b>')}\nB+*. a & b\nC. c`);
    expect(html).toContain('<c-swap start="2">');
    expect(html).toContain('&lt;b&gt;');
    expect(html).toContain('provenance="approved">a &amp; b</c-level>');
    expect(html.match(/<c-level/g)).toHaveLength(3);
  });
});
