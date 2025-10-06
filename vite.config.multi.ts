import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build configuration for MultiSelect-only bundle
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index-multi.ts'),
      name: 'MultiSelect',
      formats: ['es'],
      fileName: () => 'custom-select-multi.js',
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: 'custom-select-multi.css',
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
