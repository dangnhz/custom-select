import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build configuration for SingleSelect-only bundle
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index-single.ts'),
      name: 'SingleSelect',
      formats: ['es'],
      fileName: () => 'single-select.js',
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: 'single-select.css',
      },
    },
    sourcemap: true,
    minify: false,
    target: 'es2020',
    cssCodeSplit: false,
    cssMinify: 'lightningcss',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
