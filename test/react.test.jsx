import { it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CSwap from '../src/react.jsx';

it('renders every level as c-level children, honouring the old props', () => {
  const html = renderToStaticMarkup(
    <CSwap A="alpha" B="beta" C="gamma" start="B" provenance={{ B: 'approved', C: 'ai' }} textStyle={{ fontSize: 20 }} />,
  );
  expect(html).toContain('<c-swap');
  expect(html).toContain('start="B"');
  expect(html).toContain('>alpha</c-level>');
  expect(html).toContain('provenance="approved"');
  expect(html).toContain('provenance="ai"');
  expect(html).toContain('font-size:20px');
});

it('accepts an arbitrary levels array', () => {
  const html = renderToStaticMarkup(<CSwap levels={[{ label: 'X', text: 'x' }, { label: 'Y', text: 'y' }]} defaultProvenance="ai" />);
  expect(html).toContain('default-provenance="ai"');
  expect(html.match(/<c-level/g)).toHaveLength(2);
});
