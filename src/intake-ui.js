// <c-swap-intake>: the author-facing intake screen. Paste a whole text, pick Automatic or Manual,
// review each chunk, approve what you stand behind, copy out the result.
//
//   const el = document.querySelector('c-swap-intake');
//   el.translate = async ({ text, level, audience }) => '...';   // bring your own; defaults to the no-AI demo translator
//   el.addEventListener('cswap:intake-change', e => e.detail.syntax);
//
// TODO(accessibility): ON HOLD along with the rest of the package; no new patterns here yet.
import './element.js';
import {
  createIntake, setSwap, writeLevel, editDraft, approveLevel, approveAll, draftChunk, draftAll, progress, toSyntax,
  demoTranslator,
} from './intake.js';

const MARK = { author: '', approved: '✓ ', ai: '⚠ ' };
const CHIP = { author: 'Written by the author', approved: 'AI-drafted · Author approved', ai: 'AI generated · not reviewed by the author' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const SAMPLE_TEXT = `The Protocol

Every adjudicated outcome is weighted seven to three between human and machine reasoning, and the weighting is disclosed alongside each verdict so that no participant must infer how a conclusion was reached.

Appeals remain open for a fixed window. A verdict is provisional until that window closes, and subsequently it becomes final unless additional evidence is presented that demonstrates a material error.

You can join today.

Participation does not require approximately any prior experience with distributed systems; however, sufficient familiarity with the published rules is expected before an adjudicator commences a ruling.`;

const CSS = `
:host { --cswap-color-1: #1a1a1a; --cswap-color-2: #1f8f4e; --cswap-color-3: #2563c9; }
@media (prefers-color-scheme: dark) { :host { --cswap-color-1: #f2f2f2; --cswap-color-2: #5fd38d; --cswap-color-3: #6aa8ff; } }
:host { display: block; font-family: var(--cswap-font, system-ui, -apple-system, 'Segoe UI', sans-serif); color: var(--cswap-color-1);
  --ink: var(--cswap-color-1); --panel: var(--cswap-panel, rgba(127,127,127,.08)); max-width: 780px; }
* { box-sizing: border-box; }
h2 { margin: 0 0 4px; font-size: 20px; } .sub { margin: 0 0 18px; opacity: .65; font-size: 14px; line-height: 1.5; }
.modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.mode { text-align: left; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--cswap-line, rgba(127,127,127,.35));
  background: transparent; color: inherit; font: inherit; cursor: pointer; }
.mode b { display: block; font-size: 14px; margin-bottom: 2px; } .mode span { font-size: 12.5px; opacity: .65; line-height: 1.4; }
.mode.on { border-color: var(--cswap-color-2); background: var(--panel); } .mode.on b { color: var(--cswap-color-2); }
textarea { width: 100%; font: inherit; font-size: 14.5px; line-height: 1.6; color: inherit; background: var(--panel);
  border: 1px solid var(--cswap-line, rgba(127,127,127,.35)); border-radius: 8px; padding: 10px 12px; resize: vertical; }
textarea:focus { outline: 2px solid var(--cswap-color-3); outline-offset: 1px; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 12px 0; }
.row .grow { flex: 1; }
label.sel { font-size: 12.5px; opacity: .8; display: flex; gap: 6px; align-items: center; }
select { font: inherit; font-size: 13px; color: inherit; background: var(--panel); border: 1px solid var(--cswap-line, rgba(127,127,127,.35)); border-radius: 6px; padding: 4px 6px; }
button.btn { font: inherit; font-size: 13.5px; font-weight: 600; padding: 8px 14px; border-radius: 8px; cursor: pointer; color: inherit;
  background: transparent; border: 1px solid var(--cswap-line, rgba(127,127,127,.5)); }
button.btn.primary { background: var(--cswap-color-2); border-color: var(--cswap-color-2); color: #06140b; }
button.btn.small { padding: 4px 10px; font-size: 12px; }
button.btn:disabled { opacity: .45; cursor: default; }
.summary { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 10px; background: var(--panel); margin-bottom: 14px; font-size: 13.5px; }
.summary .grow { flex: 1; } .warn { color: var(--cswap-ai, #d9a441); } .ok { color: var(--cswap-approved, #3fae6c); }
.chunk { border: 1px solid var(--cswap-line, rgba(127,127,127,.3)); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; }
.chunk.off { border-style: dashed; opacity: .85; }
.chead { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12px; letter-spacing: .5px; opacity: .8; }
.chead .grow { flex: 1; } .tag { padding: 1px 7px; border-radius: 99px; border: 1px solid currentColor; font-size: 11px; }
.orig { font-size: 14.5px; line-height: 1.6; white-space: pre-line; margin: 0 0 4px; }
.lvl { margin-top: 12px; }
.lvlhead { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
.lvlhead .grow { flex: 1; }
.chip { font-weight: 500; letter-spacing: .8px; font-size: 10.5px; }
.chip.approved { color: var(--cswap-approved, #3fae6c); } .chip.ai { color: var(--cswap-ai, #d9a441); } .chip.author, .chip.empty { opacity: .6; }
.drafting { opacity: .6; font-size: 13px; padding: 8px 0; }
.err { color: #e5645b; font-size: 12.5px; }
.preview { margin-top: 10px; }
.out { margin-top: 18px; } .out h3 { font-size: 13px; letter-spacing: 1.4px; text-transform: uppercase; opacity: .65; margin: 0 0 6px; }
.out textarea { font-family: ui-monospace, Menlo, monospace; font-size: 12.5px; }
.note { font-size: 12px; opacity: .55; margin-top: 8px; line-height: 1.5; }
`;

export class CSwapIntakeElement extends HTMLElement {
  #doc = null;
  #mode = 'automatic';
  #gran = 'auto';
  #text = '';
  #busy = false;
  #translate = demoTranslator;
  #usingDemo = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const s = this.shadowRoot;
    s.addEventListener('click', e => this.#click(e));
    s.addEventListener('input', e => this.#input(e));
    s.addEventListener('change', e => this.#change(e));
  }

  connectedCallback() { if (!this.shadowRoot.firstChild) this.#render(); }

  /** async ({ text, level, audience, label, index }) => string. Bring your own. */
  set translate(fn) { this.#translate = fn; this.#usingDemo = false; this.#render(); }
  get translate() { return this.#translate; }
  get document() { return this.#doc; }
  get syntax() { return this.#doc ? toSyntax(this.#doc) : ''; }
  set text(t) { this.#text = String(t ?? ''); this.#render(); }
  set mode(m) { this.#mode = m === 'manual' ? 'manual' : 'automatic'; this.#render(); }

  /** Run the whole thing from code (used by the demo page). */
  async start(text, mode) {
    if (text != null) this.#text = text;
    if (mode) this.#mode = mode;
    await this.#begin();
  }

  #emit() {
    this.dispatchEvent(new CustomEvent('cswap:intake-change', { bubbles: true, composed: true, detail: { syntax: this.syntax, progress: progress(this.#doc) } }));
  }

  async #begin() {
    if (!this.#text.trim()) return;
    this.#doc = createIntake(this.#text, { mode: this.#mode, chunk: { granularity: this.#gran } });
    this.#busy = this.#mode === 'automatic';
    this.#render();
    if (this.#mode === 'automatic') {
      // mark swaps as drafting up front so the screen shows work in progress
      this.#doc.chunks.filter(c => c.swap).forEach(c => c.levels.slice(1).forEach(l => { l.status = 'drafting'; }));
      this.#render();
      await draftAll(this.#doc, this.#translate, () => this.#render());
      this.#busy = false;
      this.#render();
    }
    this.#emit();
  }

  #click(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const { act, id } = el.dataset;
    const i = Number(el.dataset.i);
    if (act === 'mode') { this.#mode = el.dataset.mode; this.#render(); }
    else if (act === 'sample') { this.#text = SAMPLE_TEXT; this.#render(); }
    else if (act === 'begin') this.#begin();
    else if (act === 'restart') { this.#doc = null; this.#busy = false; this.#render(); }
    else if (act === 'approve') { approveLevel(this.#doc, id, i); this.#render(); this.#emit(); }
    else if (act === 'approve-all') { approveAll(this.#doc); this.#render(); this.#emit(); }
    else if (act === 'draft') { this.#draftOne(id); }
    else if (act === 'copy') { navigator.clipboard?.writeText(this.syntax); el.textContent = 'Copied'; }
  }

  async #draftOne(id) {
    const c = this.#doc.chunks.find(x => x.id === id);
    c.levels.slice(1).forEach(l => { if (!l.text.trim()) l.status = 'drafting'; });
    this.#render();
    await draftChunk(this.#doc, id, this.#translate);
    this.#render();
    this.#emit();
  }

  #input(e) {
    const t = e.target;
    if (t.dataset.field === 'source') { this.#text = t.value; return; }
    if (t.dataset.field === 'level') {
      const { id, i } = t.dataset;
      const lv = this.#doc.chunks.find(c => c.id === id).levels[Number(i)];
      if (lv.provenance === 'ai' || lv.status === 'drafting') editDraft(this.#doc, id, Number(i), t.value);
      else writeLevel(this.#doc, id, Number(i), t.value);
      this.#refreshLight(id, Number(i));
    }
  }

  #change(e) {
    const t = e.target;
    if (t.dataset.field === 'gran') this.#gran = t.value;
    else if (t.dataset.field === 'swap') { setSwap(this.#doc, t.dataset.id, t.checked); this.#render(); this.#emit(); }
  }

  // typing must not rebuild the screen (it would drop focus), so update only what depends on the text
  #refreshLight(id, i) {
    const s = this.shadowRoot;
    const lv = this.#doc.chunks.find(c => c.id === id).levels[i];
    const chip = s.querySelector(`[data-chip="${id}:${i}"]`);
    if (chip) { const k = lv.text.trim() ? lv.provenance : 'empty'; chip.className = `chip ${k}`; chip.textContent = k === 'empty' ? 'Empty' : MARK[k] + CHIP[k]; }
    const ap = s.querySelector(`[data-approve="${id}:${i}"]`);
    if (ap) ap.hidden = lv.provenance !== 'ai' || !lv.text.trim();
    const sum = s.querySelector('.summary .stat'); if (sum) sum.innerHTML = this.#statHtml();
    const out = s.querySelector('textarea[data-field="out"]'); if (out) out.value = this.syntax;
    const pv = s.querySelector(`[data-preview="${id}"]`); if (pv) pv.innerHTML = this.#previewHtml(this.#doc.chunks.find(c => c.id === id));
    this.#emit();
  }

  #statHtml() {
    const p = progress(this.#doc);
    if (!p.swaps) return 'No swaps yet. Switch on “Swap this” for the chunks you want.';
    const bits = [`<b>${p.swaps}</b> swap${p.swaps === 1 ? '' : 's'}`];
    bits.push(p.notReviewed ? `<span class="warn">${p.notReviewed} draft${p.notReviewed === 1 ? '' : 's'} not reviewed</span>` : '<span class="ok">every level reviewed</span>');
    if (p.missing) bits.push(`${p.missing} level${p.missing === 1 ? '' : 's'} still empty`);
    return bits.join(' · ');
  }

  #previewHtml(c) {
    if (!c.swap || !c.levels.every(l => l.text.trim())) return '';
    const lv = c.levels.map(l => `<c-level label="${esc(l.label)}" provenance="${l.provenance}">${esc(l.text)}</c-level>`).join('');
    return `<c-swap>${lv}</c-swap>`;
  }

  #levelHtml(c, l, i) {
    const k = l.text.trim() ? l.provenance : 'empty';
    if (l.status === 'drafting') return `<div class="lvl"><div class="lvlhead">${i < 3 ? 'ABC'[i] + ' · ' : ''}${esc(l.label)}</div><div class="drafting">Drafting…</div></div>`;
    return `<div class="lvl">
      <div class="lvlhead"><span>${i < 3 ? 'ABC'[i] + ' · ' : ''}${esc(l.label)}</span><span class="grow"></span>
        <span class="chip ${k}" data-chip="${c.id}:${i}">${k === 'empty' ? 'Empty' : MARK[k] + CHIP[k]}</span>
        <button class="btn small" data-act="approve" data-id="${c.id}" data-i="${i}" data-approve="${c.id}:${i}" ${l.provenance === 'ai' && l.text.trim() ? '' : 'hidden'}>Approve</button>
      </div>
      <textarea rows="3" data-field="level" data-id="${c.id}" data-i="${i}" placeholder="Write the ${esc(l.label)} version, or use “Draft levels”">${esc(l.text)}</textarea>
      ${l.status === 'error' ? `<div class="err">The translator failed${l.error ? ': ' + esc(l.error) : ''}. Write it yourself or try again.</div>` : ''}
    </div>`;
  }

  #chunkHtml(c, n) {
    const plain = !c.swappable;
    const kind = c.kind === 'text' ? '' : c.kind;
    const head = `<div class="chead"><span>${n}</span>
      ${c.hard ? '<span class="tag warn" title="Reading ease score is low">hard to read</span>' : ''}
      ${kind ? `<span class="tag">${kind}</span>` : ''}<span class="grow"></span>
      ${plain ? '<span>Left as written</span>' : `<label><input type="checkbox" data-field="swap" data-id="${c.id}" ${c.swap ? 'checked' : ''}> Swap this</label>`}</div>`;
    if (plain || !c.swap) return `<div class="chunk off">${head}<p class="orig">${esc(c.text)}</p></div>`;
    const needsDraft = c.levels.slice(1).some(l => !l.text.trim() && l.status !== 'drafting');
    return `<div class="chunk">${head}
      ${c.levels.map((l, i) => i === 0 ? `<div class="lvl"><div class="lvlhead"><span>A · ${esc(l.label)}</span><span class="grow"></span><span class="chip author">Your text, as written</span></div><p class="orig">${esc(l.text)}</p></div>` : this.#levelHtml(c, l, i)).join('')}
      ${needsDraft ? `<div class="row"><button class="btn small" data-act="draft" data-id="${c.id}">Draft the empty levels</button><span class="note">Drafts arrive as “not reviewed” until you approve them.</span></div>` : ''}
      <div class="preview" data-preview="${c.id}">${this.#previewHtml(c)}</div>
    </div>`;
  }

  #render() {
    const s = this.shadowRoot;
    const auto = this.#mode === 'automatic';
    // keep scroll/focus stable for the source textarea while typing is not re-rendered
    let body;
    if (!this.#doc) {
      body = `
        <div class="modes">
          <button class="mode ${auto ? 'on' : ''}" data-act="mode" data-mode="automatic"><b>Automatic</b><span>Give us the whole text. We find the hard parts and draft the easier levels. You review.</span></button>
          <button class="mode ${auto ? '' : 'on'}" data-act="mode" data-mode="manual"><b>Manual</b><span>We break it into chunks. You choose which to swap and write every level yourself.</span></button>
        </div>
        <textarea rows="11" data-field="source" placeholder="Paste or type your whole text here…">${esc(this.#text)}</textarea>
        <div class="row">
          <label class="sel">Chunk by
            <select data-field="gran">
              ${[['auto', 'Paragraphs (long ones split)'], ['paragraph', 'Paragraphs'], ['sentence', 'Sentences']].map(([v, t]) => `<option value="${v}" ${this.#gran === v ? 'selected' : ''}>${t}</option>`).join('')}
            </select></label>
          <span class="grow"></span>
          <button class="btn" data-act="sample">Use sample text</button>
          <button class="btn primary" data-act="begin">${auto ? 'Find the hard parts and draft levels' : 'Break into chunks'}</button>
        </div>
        ${this.#usingDemo && auto ? '<div class="note">Demo translator: no AI is connected, so drafts here are only simple word swaps and shortening. Plug in your own translator to get real drafts.</div>' : ''}`;
    } else {
      const chunks = this.#doc.chunks;
      let n = 0;
      body = `
        <div class="summary"><span class="stat">${this.#busy ? 'Drafting levels…' : this.#statHtml()}</span><span class="grow"></span>
          <button class="btn small" data-act="approve-all" ${this.#busy ? 'disabled' : ''}>Approve all drafts</button>
          <button class="btn small" data-act="restart">Start over</button></div>
        ${chunks.map(c => this.#chunkHtml(c, ++n)).join('')}
        <div class="out"><h3>Result</h3>
          <textarea rows="8" readonly data-field="out">${esc(this.syntax)}</textarea>
          <div class="row"><button class="btn small" data-act="copy">Copy</button><span class="note">Unreviewed drafts keep their <code>~</code> flag, so readers always see which levels the author has not checked.</span></div></div>`;
    }
    s.innerHTML = `<style>${CSS}</style>
      <h2>C Swap intake</h2>
      <p class="sub">${this.#doc ? (auto ? 'Automatic mode: review each draft, edit it, and approve what you stand behind.' : 'Manual mode: choose the chunks to swap and write each level.') : 'Turn a whole text into swaps. Every level is labeled with who stands behind it.'}</p>
      ${body}`;
  }
}

export function defineCSwapIntake() {
  if (typeof customElements !== 'undefined' && !customElements.get('c-swap-intake')) customElements.define('c-swap-intake', CSwapIntakeElement);
}
defineCSwapIntake();
