// Thin React wrapper around <c-swap>. Keeps the props of the original CSwap component:
//   A, B, C        the three level texts
//   textStyle      style object applied to each level's text
//   start          "A" | "B" | "C" (default "A")
//   provenance     { A, B, C } each "author" | "approved" | "ai"
// Extra: `levels` ([{ label, text, provenance }]) for any number of levels; `defaultProvenance` ("author" by default;
// pass "ai" in AI-assisted flows so a level with no provenance reads as not reviewed).
import './element.js';
import { DEFAULT_LABELS } from './parse.js';

export default function CSwap({ A, B, C, textStyle, start = 'A', provenance, levels, defaultProvenance, className }) {
  const items = levels ?? [A, B, C].map((text, i) => ({
    label: DEFAULT_LABELS[i], text, provenance: provenance?.['ABC'[i]],
  }));
  return (
    <c-swap start={start} default-provenance={defaultProvenance} class={className}>
      {items.map((l, i) => (
        <c-level key={i} label={l.label} provenance={l.provenance} style={textStyle}>{l.text}</c-level>
      ))}
    </c-swap>
  );
}

export { CSwap };
