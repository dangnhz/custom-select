import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CustomSelect',
      formats: ['es', 'umd'],
      fileName: (format) => `custom-select.${format === 'es' ? 'js' : 'umd.js'}`,
    },
    rollupOptions: {
      // No external dependencies - bundle everything
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles.min.css';
          return assetInfo.name || 'assets/[name][extname]';
        },
      },
    },
    sourcemap: true,
    minify: false, // We handle JS minification in post-build script
    target: 'es2020',
    cssCodeSplit: false,
    cssMinify: 'lightningcss', // Minify CSS during build
    emptyOutDir: true, // Clean dist folder before build
  },
  server: {
    open: '/examples/index.html',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
