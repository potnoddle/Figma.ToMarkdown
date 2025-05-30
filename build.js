const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const watchMode = process.argv.includes('--watch');

const uiHTML = fs.readFileSync(path.join(__dirname, 'ui.html'), 'utf-8');
console.log(`[build.js] Read ui.html. Length: ${uiHTML.length} characters.`); // Added log

const esbuildOptions = {
  entryPoints: ['code.ts'], // Your main plugin code
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser', // Figma's plugin environment is browser-like
  target: 'es6',
  define: {
    '__html__': JSON.stringify(uiHTML), // Injects ui.html content as a string
  },
  logLevel: 'info', // Provides more feedback during build
};

async function build() {
  if (watchMode) {
    const ctx = await esbuild.context(esbuildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(esbuildOptions);
    // The "Build successful!" message will come from esbuild's logLevel: 'info'
    // if not overridden by other console output.
  }
}

build().catch((e) => {
  if (!watchMode) { // Avoid exiting in watch mode for a single build failure
    console.error('Build script error:', e);
    process.exit(1);
  }
});