import { describe, it, expect, beforeEach } from 'vitest';
import '../src/element.js';

const tick = () => new Promise(r => setTimeout(r, 0));

function mount(attrs = '', levels) {
  document.body.innerHTML = `<c-swap ${attrs} style="--cswap-duration:0">${levels ?? `
    <c-level label="Author">one</c-level>
    <c-level label="Beginner" provenance="approved">two</c-level>
    <c-level label="Cub">three</c-level>`}</c-swap>`;
  return document.querySelector('c-swap');
}
const visible = el => [...el.children].filter(c => !c.hidden).map(c => c.textContent);
const root = el => el.shadowRoot.querySelector('.root');

beforeEach(() => { document.body.innerHTML = ''; });

describe('<c-swap>', () => {
  it('keeps all levels in the DOM and shows only the first by default', () => {
    const el = mount();
    expect(el.children).toHaveLength(3);
    expect(visible(el)).toEqual(['one']);
    expect(el.shadowRoot.querySelector('.prov').textContent).toContain('Written by the author');
  });

  it('honours start by letter, number and label', () => {
    expect(visible(mount('start="B"'))).toEqual(['two']);
    expect(visible(mount('start="3"'))).toEqual(['three']);
    expect(visible(mount('start="cub"'))).toEqual(['three']);
  });

  it('advances on click, wraps, and goes backward with shift-click', async () => {
    const el = mount();
    root(el).click(); await tick();
    expect(visible(el)).toEqual(['two']);
    root(el).click(); await tick(); root(el).click(); await tick();
    expect(visible(el)).toEqual(['one']);
    root(el).dispatchEvent(new MouseEvent('click', { shiftKey: true, bubbles: true })); await tick();
    expect(visible(el)).toEqual(['three']);
  });

  it('responds to Enter, Space and ArrowLeft', async () => {
    const el = mount();
    root(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await tick();
    root(el).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })); await tick();
    expect(visible(el)).toEqual(['three']);
    root(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); await tick();
    expect(visible(el)).toEqual(['two']);
  });

  it('dispatches cswap:swap with index and id', async () => {
    const el = mount();
    const events = [];
    document.body.addEventListener('cswap:swap', e => events.push(e.detail));
    root(el).click(); await tick();
    expect(events).toEqual([{ index: 1, id: 'beginner', label: 'Beginner', provenance: 'approved', previousIndex: 0, total: 3 }]);
  });

  it('shows provenance for the visible level, with approved and ai distinct', async () => {
    const el = mount('', '<c-level>a</c-level><c-level provenance="approved">b</c-level><c-level provenance="ai">c</c-level>');
    const prov = () => el.shadowRoot.querySelector('.prov');
    root(el).click(); await tick();
    expect(prov().textContent).toBe('✓ AI-Authored Paraphrase · Author approved');
    root(el).click(); await tick();
    expect(prov().textContent).toBe('⚠ AI-Authored Paraphrase · not reviewed by the author');
    expect(prov().classList.contains('ai')).toBe(true);
  });

  it('defaults unflagged levels via default-provenance, and unknown values fail safe to ai', () => {
    const el = mount('default-provenance="ai"', '<c-level>a</c-level><c-level>b</c-level>');
    expect(el.shadowRoot.querySelector('.prov').textContent).toContain('not reviewed');
    const el2 = mount('', '<c-level provenance="bogus">a</c-level><c-level>b</c-level>');
    expect(el2.shadowRoot.querySelector('.prov').textContent).toContain('not reviewed');
  });

  it('supports any number of custom-labelled levels and goTo()', async () => {
    const el = mount('', '<c-level label="Expert">x</c-level><c-level label="Plain">y</c-level><c-level label="Kid">z</c-level><c-level label="Emoji">w</c-level>');
    expect(el.length).toBe(4);
    el.goTo(3); await tick();
    expect(visible(el)).toEqual(['w']);
    expect(el.shadowRoot.querySelectorAll('.tab')[3].textContent).toBe('D · Emoji');
  });

  it('picks up levels added later', async () => {
    const el = mount('', '<c-level>a</c-level><c-level>b</c-level>');
    el.insertAdjacentHTML('beforeend', '<c-level>c</c-level>');
    await tick();
    expect(el.length).toBe(3);
  });
});
