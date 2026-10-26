# C Swap roadmap

Intentionally **not built yet** in v0.1.

## AI translator (pluggable)

- `translate({ text, level, audience })` interface, bring-your-own-key, no model baked in.
- **Authoring-time drafting:** output is created as provenance `ai` (not reviewed). It becomes `approved` only when the author approves it. Nothing is ever auto-promoted.
- **Optional reader-time mode**, server-proxied so keys never reach the browser. Always labeled "AI generated · not reviewed by the author".
- Per-author and per-post configuration of the B and C levels.

- The intake screen ships with a no-AI demo translator only; wiring a real model (keys, rate limits, a proxy) is not done.
- Chunking and reading ease are English-oriented heuristics; other languages need their own `score` and sentence splitter.

## Publishing integrations

- WordPress, Hugo and Jekyll shortcodes.

## Social export

- Carousel images, or a hosted share page with an Open Graph preview.

## Faithfulness check

- Back-translate a drafted level and compare to the Author level, to flag drift before the author approves.

## Accessibility (on hold)

- Screen-reader behavior and motion (reduced motion) are on hold; the owner has their own plan. Current behavior is kept as-is. See the `TODO(accessibility)` in `src/element.js`.

## Smaller items

- Markdown inside a level (the remark plugin keeps level text plain).
- Localised provenance and UI strings.
- Publish to npm and copy into the public `JusticeCoin` GitHub repo (owner decides name, trademark check, copyright holder).
