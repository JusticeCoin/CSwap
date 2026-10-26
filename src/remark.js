// Remark plugin: turns C Swap syntax (A./B./C. lines and :::swap fences) into <c-swap> elements.
//
//   unified().use(remarkParse).use(remarkCSwap).use(remarkRehype).use(rehypeStringify)
//
// It must come after remark-parse: it wraps the parser, splits the source with parseCSwaps, parses the
// ordinary text with the original parser, and drops swap nodes in between. Level text is kept as plain
// text, as in the app today (no nested Markdown inside a level yet).
import { parseCSwaps } from './parse.js';

function swapNode(swap) {
  return {
    type: 'cswap',
    data: { hName: 'c-swap', hProperties: swap.startIndex ? { start: String(swap.startIndex + 1) } : {} },
    children: swap.levels.map(l => ({
      type: 'cswapLevel',
      data: { hName: 'c-level', hProperties: { label: l.label, provenance: l.provenance } },
      children: [{ type: 'text', value: l.text }],
    })),
  };
}

/** @param {{ defaultProvenance?: 'author'|'approved'|'ai' }} [options] */
export default function remarkCSwap(options = {}) {
  const parse = this.parser;
  if (typeof parse !== 'function') throw new Error('remarkCSwap must be used after remark-parse');
  this.parser = (doc, file) => {
    const root = { type: 'root', children: [] };
    for (const seg of parseCSwaps(String(doc), options)) {
      if (seg.type === 'cswap') root.children.push(swapNode(seg));
      else root.children.push(...parse(seg.text, file).children);
    }
    return root;
  };
}

export { remarkCSwap };
