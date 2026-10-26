// <c-swap> web component. No dependencies.
//
//   <c-swap start="B">
//     <c-level label="Author">Full-strength text.</c-level>
//     <c-level label="Beginner" provenance="approved">Plainer text.</c-level>
//     <c-level label="Cub" provenance="ai">Simplest text.</c-level>
//   </c-swap>
//
// Every level stays in the light DOM (search engines and no-JavaScript readers see all of them);
// the visible one is controlled by state, via the `hidden` attribute on the others.
//
// TODO(accessibility): ON HOLD. The owner has their own plan for screen-reader behavior and motion
// (including prefers-reduced-motion). Existing behavior is kept as-is; do not add new patterns here.

const HALF_MS_DEFAULT = 170;
const PROVENANCE_TEXT = {
  author: { text: 'Written by the author', mark: '' },
  approved: { text: 'AI-drafted · Author approved', mark: '✓ ' },
  ai: { text: 'AI generated · not reviewed by the author', mark: '⚠ ' },
};
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const CSS = `
:host { display: block; margin: 22px 0; font-family: var(--cswap-font, system-ui, -apple-system, 'Segoe UI', sans-serif); }
.root {
  padding: 16px 0; cursor: pointer; perspective: 900px; outline: none;
  border-top: 1px solid var(--cswap-line, rgba(127,127,127,.35));
  border-bottom: 1px solid var(--cswap-line, rgba(127,127,127,.35));
}
.root:focus-visible { outline: 2px solid var(--cswap-focus, var(--cswap-color-3, #6aa8ff)); outline-offset: 4px; }
.head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.tab {
  font-size: 9.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--cswap-muted, rgba(127,127,127,.9)); opacity: .45; padding-bottom: 2px;
  border-bottom: 2px solid transparent; transition: all .2s ease;
}
.tab.on { opacity: 1; color: var(--c); border-bottom-color: var(--c); }
.spacer { flex: 1; }
.hint { font-size: 10px; letter-spacing: 1px; color: var(--cswap-muted, rgba(127,127,127,.9)); }
.stage {
  font-size: var(--cswap-font-size, 15.5px); line-height: var(--cswap-line-height, 1.8);
  color: var(--c); transform-origin: 50% 50%; backface-visibility: hidden;
}
.prov {
  margin-top: 10px; font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase;
  color: var(--cswap-muted, rgba(127,127,127,.9));
}
.prov.approved { color: var(--cswap-approved, #3fae6c); }
.prov.ai { color: var(--cswap-ai, #d9a441); }
::slotted(c-level) { display: block; white-space: pre-line; }
::slotted(c-level[hidden]) { display: none; }
`;

const LIGHT_DEFAULTS = `
:host {
  --cswap-color-1: #1a1a1a; --cswap-color-2: #1f8f4e; --cswap-color-3: #2563c9;
}
@media (prefers-color-scheme: dark) {
  :host { --cswap-color-1: #f2f2f2; --cswap-color-2: #5fd38d; --cswap-color-3: #6aa8ff; }
}
`;

let sharedSheet;
function applyStyles(root) {
  const css = LIGHT_DEFAULTS + CSS;
  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in root && CSSStyleSheet.prototype.replaceSync) {
    try {
      if (!sharedSheet) { sharedSheet = new CSSStyleSheet(); sharedSheet.replaceSync(css); }
      root.adoptedStyleSheets = [sharedSheet];
      return;
    } catch { /* fall through to a style element */ }
  }
  const style = document.createElement('style');
  style.textContent = css;
  root.appendChild(style);
}

const slug = s => String(s).toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

function provenanceFor(levelEl, fallback) {
  const raw = levelEl.getAttribute('provenance');
  const v = raw == null || raw === '' ? fallback : raw;
  return Object.hasOwn(PROVENANCE_TEXT, v) ? v : 'ai'; // unknown values fail safe to "not reviewed"
}

export class CSwapElement extends HTMLElement {
  static observedAttributes = ['start'];

  #index = 0;
  #busy = false;
  #levels = [];
  #observer;
  #rendered = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    applyStyles(root);
    const wrap = document.createElement('div');
    wrap.className = 'root';
    wrap.setAttribute('part', 'root');
    wrap.setAttribute('role', 'button');
    wrap.tabIndex = 0;
    wrap.title = 'Tap to swap this idea';
    wrap.innerHTML =
      '<div class="head" part="head"><span class="tabs" style="display:contents"></span><span class="spacer"></span>' +
      '<span class="hint" part="hint">TAP ↻</span></div>' +
      '<div class="stage" part="stage"><slot></slot></div>' +
      '<div class="prov" part="provenance"></div>';
    root.appendChild(wrap);
    this._wrap = wrap;
    this._tabs = wrap.querySelector('.tabs');
    this._stage = wrap.querySelector('.stage');
    this._prov = wrap.querySelector('.prov');

    wrap.addEventListener('click', e => this.#go(e.shiftKey ? -1 : 1));
    wrap.addEventListener('keydown', e => {
      const activate = e.key === 'Enter' || e.key === ' ';
      if (activate) { e.preventDefault(); this.#go(e.shiftKey ? -1 : 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.#go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.#go(-1); }
    });
    // Clicking a level label jumps straight to that level (and does not also advance).
    this._tabs.addEventListener('click', e => {
      const tab = e.target.closest?.('.tab');
      if (!tab) return;
      e.stopPropagation();
      this.goTo(Number(tab.dataset.i));
    });
  }

  connectedCallback() {
    this.#sync(true);
    this.#observer = new MutationObserver(() => this.#sync(false));
    this.#observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['label', 'provenance'] });
  }

  disconnectedCallback() { this.#observer?.disconnect(); }

  attributeChangedCallback(name) { if (name === 'start' && this.#rendered) { this.#index = this.#startIndex(); this.#render(); } }

  /** Number of levels. */
  get length() { return this.#levels.length; }
  /** Zero-based index of the visible level. */
  get index() { return this.#index; }
  set index(i) { this.goTo(i); }
  next() { this.#go(1); }
  prev() { this.#go(-1); }
  goTo(i) {
    const n = this.#levels.length;
    if (!Number.isInteger(i) || i < 0 || i >= n || i === this.#index) return;
    this.#go(i > this.#index ? 1 : -1, i);
  }

  #startIndex() {
    const v = (this.getAttribute('start') || '').trim();
    const n = this.#levels.length;
    if (!v) return 0;
    let i = -1;
    if (/^\d+$/.test(v)) i = Number(v) - 1; // 1-based number
    else if (/^[A-Za-z]$/.test(v) && v.toUpperCase() <= LETTERS[Math.max(0, n - 1)]) i = LETTERS.indexOf(v.toUpperCase());
    if (i < 0 || i >= n) i = this.#levels.findIndex(l => l.id === v.toLowerCase() || l.label.toLowerCase() === v.toLowerCase());
    return i >= 0 && i < n ? i : 0;
  }

  #read() {
    const fallback = this.getAttribute('default-provenance');
    const defaultProv = fallback && Object.hasOwn(PROVENANCE_TEXT, fallback) ? fallback : fallback ? 'ai' : 'author';
    return [...this.children].filter(el => el.localName === 'c-level').map((el, i) => {
      const label = el.getAttribute('label') || ['Author', 'Beginner', 'Cub'][i] || `Level ${i + 1}`;
      return {
        el, label,
        id: el.getAttribute('id') || slug(label) || `level-${i + 1}`,
        provenance: provenanceFor(el, defaultProv),
        color: el.getAttribute('color'),
      };
    });
  }

  #sync(initial) {
    const prevCount = this.#levels.length;
    this.#levels = this.#read();
    if (initial || !this.#rendered) this.#index = this.#startIndex();
    else if (this.#index >= this.#levels.length) this.#index = Math.max(0, this.#levels.length - 1);
    this.#rendered = true;
    if (prevCount !== this.#levels.length || initial) this.#buildTabs();
    this.#render();
  }

  #color(i) {
    return this.#levels[i]?.color || `var(--cswap-color-${(i % 3) + 1})`;
  }

  #buildTabs() {
    this._tabs.replaceChildren(...this.#levels.map((l, i) => {
      const t = document.createElement('span');
      t.className = 'tab';
      t.dataset.i = String(i);
      t.setAttribute('part', 'tab');
      return t;
    }));
  }

  #render() {
    const lv = this.#levels;
    if (!lv.length) return;
    lv.forEach((l, i) => { l.el.hidden = i !== this.#index; });
    [...this._tabs.children].forEach((t, i) => {
      if (!lv[i]) return;
      t.textContent = `${LETTERS[i] ?? i + 1} · ${lv[i].label}`;
      t.style.setProperty('--c', this.#color(i));
      t.classList.toggle('on', i === this.#index);
    });
    const cur = lv[this.#index];
    this._wrap.style.setProperty('--c', this.#color(this.#index));
    const p = PROVENANCE_TEXT[cur.provenance];
    this._prov.textContent = p.mark + p.text;
    this._prov.className = `prov ${cur.provenance}`;
    this._wrap.title = lv.length > 1 ? 'Tap to swap this idea' : '';
  }

  #halfMs() {
    const v = parseFloat(getComputedStyle(this).getPropertyValue('--cswap-duration'));
    return Number.isFinite(v) && v >= 0 ? v : HALF_MS_DEFAULT;
  }

  async #go(dir, to) {
    const n = this.#levels.length;
    if (n < 2 || this.#busy) return;
    const target = to ?? (this.#index + dir + n) % n;
    const from = this.#index;
    const stage = this._stage;
    const canAnimate = typeof stage.animate === 'function';
    const half = this.#halfMs();
    this.#busy = true;
    try {
      if (canAnimate && half > 0) {
        await stage.animate(
          [{ transform: 'rotateX(0deg)', opacity: 1 }, { transform: `rotateX(${90 * dir}deg)`, opacity: 0 }],
          { duration: half, easing: 'ease-in', fill: 'forwards' }).finished;
      }
      this.#index = target;
      this.#render();
      if (canAnimate && half > 0) {
        await stage.animate(
          [{ transform: `rotateX(${-90 * dir}deg)`, opacity: 0 }, { transform: 'rotateX(0deg)', opacity: 1 }],
          { duration: half, easing: 'ease-out' }).finished;
        stage.getAnimations().forEach(a => a.cancel());
      }
    } catch { /* animation cancelled (e.g. element removed): still land on the target */
      this.#index = target;
      this.#render();
    } finally {
      this.#busy = false;
    }
    const cur = this.#levels[this.#index];
    this.dispatchEvent(new CustomEvent('cswap:swap', {
      bubbles: true, composed: true,
      detail: { index: this.#index, id: cur.id, label: cur.label, provenance: cur.provenance, previousIndex: from, total: n },
    }));
  }
}

/** Register <c-swap> (and the inert <c-level>) once. Safe to call repeatedly and during SSR. */
export function defineCSwap() {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get('c-swap')) customElements.define('c-swap', CSwapElement);
}

defineCSwap();
