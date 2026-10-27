# C Swap

> so that a mind can remain untamed, without losing itself, or everybody else.

One idea written at several levels of language. The reader taps the block and it swaps in place to the next level. A writer keeps full-strength text and gives readers an easier way in.

The default trio:

| Key | Level | Colour |
| --- | --- | --- |
| A | **Author** | white |
| B | **Beginner** | green |
| C | **Cub** | blue |

"Cub" is the child metaphor and the newsroom word for a rookie who needs things broken down. It is meant as a good thing to be.

Free and open source (Apache-2.0), courtesy of Justice Coin. Working package name: `@justicecoin/cswap` (not published yet).

> Status: v0.1, unpublished. See [docs/ROADMAP.md](docs/ROADMAP.md) for what is intentionally not built yet.

## Install

Not on npm yet. Until then, use the single-file bundle (`bundle/cswap.iife.js`, built with `npm run build`) or import the ES modules from `src/`. Open `demo.html` straight from disk to try it.

```sh
npm install @justicecoin/cswap   # once published
```

## Use: the web component

```html
<script type="module">import '@justicecoin/cswap/element';</script>

<c-swap start="B">
  <c-level label="Author">Full-strength text.</c-level>
  <c-level label="Beginner" provenance="approved">Plainer text.</c-level>
  <c-level label="Cub" provenance="ai">Simplest text.</c-level>
</c-swap>
```

- Any number of levels, any labels. If `label` is missing the defaults are Author, Beginner, Cub, then "Level N".
- **All levels live in the DOM.** Search engines and readers without JavaScript see every level. With JavaScript, the visible one is controlled by state (the others get `hidden`).
- Tap or click advances. Enter / Space advance. Shift+click, Shift+Enter, Shift+Space or the left arrow go back. The right arrow advances. Clicking a level label jumps to it.
- `start` on `<c-swap>`: a letter (`B`), a 1-based number (`2`), or a label/id (`cub`). Default: the first level.
- `id` on `<c-level>` is optional; the event id defaults to a slug of the label.
- JS API: `el.index`, `el.length`, `el.next()`, `el.prev()`, `el.goTo(i)`.

### Events

```js
document.addEventListener('cswap:swap', e => {
  // e.detail: { index, id, label, provenance, previousIndex, total }
  analytics.track('cswap', e.detail);   // which levels do readers stop on?
});
```

The event bubbles and is composed, so one listener on `document` catches every swap.

### Theming

Only CSS custom properties, all with defaults (no dependency on any app's tokens). Colours switch for `prefers-color-scheme`.

| Property | Default (light / dark) | Meaning |
| --- | --- | --- |
| `--cswap-color-1` | `#1a1a1a` / `#f2f2f2` | level 1 text (levels 4+ reuse 1-3; override per level with `color="..."` on `<c-level>`) |
| `--cswap-color-2` | `#1f8f4e` / `#5fd38d` | level 2 text |
| `--cswap-color-3` | `#2563c9` / `#6aa8ff` | level 3 text |
| `--cswap-approved` | `#3fae6c` | "AI-Authored Paraphrase · Author approved" label |
| `--cswap-ai` | `#d9a441` (amber) | "AI-Authored Paraphrase · not reviewed" label |
| `--cswap-muted` | grey | inactive tabs, hint, "written by the author" label |
| `--cswap-line` | grey | top and bottom rules |
| `--cswap-focus` | level 3 colour | focus ring |
| `--cswap-font` | system sans | font family |
| `--cswap-font-size` | `15.5px` | text size |
| `--cswap-line-height` | `1.8` | line height |
| `--cswap-duration` | `170` | half-flip time in ms (`0` disables the flip) |

Shadow parts for deeper styling: `root`, `head`, `tab`, `hint`, `stage`, `provenance`. Style the text itself on `c-level` (it is ordinary light DOM).

## Intake: from a whole text to swaps

Authors should not have to hand-write every swap. `<c-swap-intake>` (see `intake.html`) takes the whole text and has two modes:

- **Automatic.** Paste everything. CSwap breaks it into chunks (`chunkText`), scores each for reading ease, and drafts the Beginner and Cub levels for the hard-to-read chunks only (easy prose, headings, lists and code are left alone). Every drafted level is created as `ai` (not reviewed). It becomes `approved` only when the author clicks Approve. Editing a draft does not approve it.
- **Manual.** CSwap breaks the text into chunks; the author switches on the chunks they want and writes every level (`author`).

```js
import '@justicecoin/cswap/intake-ui';
const intake = document.querySelector('c-swap-intake');
intake.translate = async ({ text, level, audience }) => myModel(text, level, audience); // bring your own
intake.addEventListener('cswap:intake-change', e => save(e.detail.syntax));
```

No model or key is built in. Without a `translate` function the screen uses a no-AI demo translator (simple word swaps) so the flow can be shown. The same steps are available without UI from `@justicecoin/cswap/intake` (`createIntake`, `draftAll`, `approveLevel`, `toSyntax`, ...) and `@justicecoin/cswap/chunk`. The result is `:::swap` text that `parseCSwaps` reads back, with `+` and `~` flags preserved.

## Provenance rules

Every level carries its provenance, always visible under the text. Telling author-approved from merely AI-generated is the top priority.

| Value | Label | Flag |
| --- | --- | --- |
| `author` | Written by the author | none |
| `approved` | ✓ AI-Authored Paraphrase · Author approved | `+` |
| `ai` | ⚠ AI-Authored Paraphrase · not reviewed by the author (amber) | `~` |

1. `author` is the default **only for hand-written text**.
2. In AI-assisted flows an unflagged level must read as not reviewed: set `default-provenance="ai"` on `<c-swap>`, or pass `{ defaultProvenance: 'ai' }` to the parser.
3. An unrecognised `provenance` value fails safe to `ai`.
4. A level only becomes `approved` when the author approves it.

## Use: the text syntax

### Line syntax

```
A. The full-strength sentence from the author.
B+*. Plainer version, AI-Authored Paraphrase, approved, and the one that opens first.
C~. Simplest version, AI-Authored Paraphrase, not reviewed.
```

- Level lines start with `A.`, `B.`, `C.` in that order. Flags go between the letter and the dot: `*` start on this level (default A), `+` approved, `~` not reviewed.
- A blank line ends the C block. A and B blocks may span several lines.
- A short plain list (`A. Author` / `B. Beginner` / `C. Cub`, where the A text is under 20 characters) is **not** a swap.

### Fenced syntax: any number of levels

```
:::swap
Full-strength text.
--- Beginner +
Plainer text.
--- Cub ~*
Simplest text.
:::
```

- Text before the first `---` is level 1 (label "Author"). An explicit `--- Label` first line also works.
- Separator: `--- Label flags`. Label and flags are both optional; same `*` `+` `~` flags.
- Needs at least two non-empty levels, otherwise it stays plain text.

### Parser (pure function)

```js
import { parseCSwaps, cswapsToHtml } from '@justicecoin/cswap/parse';

parseCSwaps(body, { defaultProvenance: 'author' });
// → [{ type: 'text', text }, { type: 'cswap', levels: [{ label, text, provenance }], startIndex }, ...]
// three-level swaps also carry the legacy fields A, B, C, start, provenance { A, B, C }

cswapsToHtml(body);   // text escaped, swaps → <c-swap> markup
```

### Remark plugin

```js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCSwap from '@justicecoin/cswap/remark';

unified().use(remarkParse).use(remarkCSwap /*, { defaultProvenance: 'author' }*/).use(remarkRehype).use(rehypeStringify);
```

Must come after `remark-parse`. Level text is plain text for now (no nested Markdown inside a level).

## Use: React

```jsx
import CSwap from '@justicecoin/cswap/react';

<CSwap A="..." B="..." C="..." start="B" provenance={{ B: 'approved', C: 'ai' }} textStyle={{ fontSize: 17 }} />
// or any number of levels:
<CSwap levels={[{ label: 'Expert', text: '...' }, { label: 'Plain', text: '...', provenance: 'approved' }]} />
```

Same props as the original in-app component (`A`, `B`, `C`, `textStyle`, `start`, `provenance`), plus `levels`, `defaultProvenance` and `className`. It renders `<c-swap>` (React 19 custom element support).

## Accessibility

On hold. Screen-reader behavior and motion (including reduced motion) are deliberately left as the original component had them while the owner decides the approach. There is a `TODO(accessibility)` in `src/element.js`.

## Development

```sh
npm install
npm test        # vitest + jsdom
npm run build   # bundle/cswap.iife.js, used by demo.html
```

The package is self-contained: no imports from outside `packages/cswap/`.

## Naming note

It was "C Roll" (a film term), then "C Flip" (already well established as an immune-system term), and is now "C Swap". Known overlaps: C's own `swap` function, `cswap` as the constant-time conditional-swap primitive in crypto code, and the CSWAP (Fredkin) quantum gate. On 2026-10-26 npm showed `cswap`, `c-swap` and `@justicecoin/cswap` unclaimed, and the `JusticeCoin` GitHub org had no `cswap` repo. Trademark and final package-name checks are still the owner's call before publishing.

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
