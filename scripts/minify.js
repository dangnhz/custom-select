#!/usr/bin/env node

/**
 * Post-build minification script
 *
 * Vite's library mode doesn't properly minify JavaScript output even with minify: 'terser',
 * so we handle JS minification as a post-build step using Terser directly.
 *
 * CSS is minified by Vite using LightningCSS during the build process.
 */

import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, '../dist');

/**
 * Minify JavaScript file using Terser
 */
async function minifyJS(inputFile, outputFile) {
  const inputPath = resolve(distDir, inputFile);
  const outputPath = resolve(distDir, outputFile);

  if (!existsSync(inputPath)) {
    console.log(`⚠ Skipping ${inputFile} - file not found`);
    return;
  }

  const code = readFileSync(inputPath, 'utf8');

  const result = await minify(code, {
    compress: {
      drop_console: true,
      drop_debugger: true,
      passes: 2,
    },
    mangle: true,
    format: {
      comments: false,
    },
    sourceMap: {
      filename: outputFile,
      url: `${outputFile}.map`,
    },
  });

  writeFileSync(outputPath, result.code, 'utf8');
  if (result.map) {
    writeFileSync(`${outputPath}.map`, result.map, 'utf8');
  }

  const minifiedSize = (result.code.length / 1024).toFixed(2);
  const savings = (((code.length - result.code.length) / code.length) * 100).toFixed(1);

  console.log(`✓ ${outputFile} - ${minifiedSize}KB (${savings}% smaller)`);
}

// Main execution
console.log('📦 Minifying JavaScript files...\n');

const jsFiles = [
  // Main bundle (both components) - ES and UMD
  { from: 'custom-select.js', to: 'custom-select.min.js' },
  { from: 'custom-select.umd.js', to: 'custom-select.umd.min.js' },
  // MultiSelect-only bundle - ES only
  { from: 'multi-select.js', to: 'multi-select.min.js' },
  // SingleSelect-only bundle - ES only
  { from: 'single-select.js', to: 'single-select.min.js' },
];

(async () => {
  // Rename CSS file from custom-select.css to styles.min.css
  const cssFrom = resolve(distDir, 'custom-select.css');
  const cssTo = resolve(distDir, 'styles.min.css');
  if (existsSync(cssFrom)) {
    renameSync(cssFrom, cssTo);
    console.log('✓ Renamed custom-select.css → styles.min.css');
  }

  console.log('');

  for (const { from, to } of jsFiles) {
    await minifyJS(from, to);

    // Remove unminified file after minification
    const unminifiedPath = resolve(distDir, from);
    if (existsSync(unminifiedPath)) {
      unlinkSync(unminifiedPath);
    }

    // Remove unminified sourcemap
    const unminifiedMapPath = `${unminifiedPath}.map`;
    if (existsSync(unminifiedMapPath)) {
      unlinkSync(unminifiedMapPath);
    }
  }

  console.log('\n🧹 Cleaned up unminified files');
  console.log('✅ Build complete!');
})();
