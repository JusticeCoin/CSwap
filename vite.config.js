import { defineConfig } from 'vite';

// Builds the single-file bundle (bundle/cswap.iife.js) that demo.html loads from a file:// URL.
export default defineConfig({
  build: {
    outDir: 'bundle',
    emptyOutDir: true,
    lib: { entry: 'src/bundle.js', name: 'CSwap', formats: ['iife'], fileName: () => 'cswap.iife.js' },
  },
});
