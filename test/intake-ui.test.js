import { it, expect } from 'vitest';
import '../src/intake-ui.js';

const settle = () => new Promise(r => setTimeout(r, 20));

it('automatic mode drafts, shows not-reviewed chips, and approving flips the chip', async () => {
  document.body.innerHTML = '<c-swap-intake></c-swap-intake>';
  const el = document.querySelector('c-swap-intake');
  el.translate = async ({ level }) => `draft ${level}`;
  await el.start('Every adjudicated outcome is weighted seven to three between human and machine reasoning, and the weighting is disclosed alongside each verdict so that no participant must infer how a conclusion was reached.', 'automatic');
  await settle();
  const root = el.shadowRoot;
  expect(root.textContent).toContain('2 drafts not reviewed');
  expect(root.querySelectorAll('.chip.ai')).toHaveLength(2);
  expect(el.syntax).toContain('--- Beginner ~');
  root.querySelector('[data-act="approve"]').click();
  expect(root.querySelectorAll('.chip.ai')).toHaveLength(1);
  expect(el.syntax).toContain('--- Beginner +');
});

it('manual mode starts with no swaps', async () => {
  document.body.innerHTML = '<c-swap-intake></c-swap-intake>';
  const el = document.querySelector('c-swap-intake');
  await el.start('A long enough paragraph of ordinary text that could be a swap if the author asked for one.', 'manual');
  expect(el.shadowRoot.textContent).toContain('No swaps yet');
});
