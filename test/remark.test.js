import { it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCSwap from '../src/remark.js';

const run = src => String(unified().use(remarkParse).use(remarkCSwap).use(remarkRehype).use(rehypeStringify).processSync(src));

it('turns swaps into c-swap markup and leaves other markdown alone', () => {
  const html = run('# Title\n\nA. This is a full-strength sentence from the author.\nB+*. Plain.\nC~. Simple.\n\nAfter **bold**.');
  expect(html).toContain('<h1>Title</h1>');
  expect(html).toContain('<c-swap start="2">');
  expect(html).toContain('<c-level label="Beginner" provenance="approved">Plain.</c-level>');
  expect(html).toContain('provenance="ai">Simple.</c-level>');
  expect(html).toContain('<strong>bold</strong>');
});

it('handles fenced blocks', () => {
  const html = run(':::swap\nHard text.\n--- Beginner +\nEasy.\n:::');
  expect(html).toContain('<c-level label="Author" provenance="author">Hard text.</c-level>');
});
