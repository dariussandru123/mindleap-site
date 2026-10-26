import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import devApiPlugin from './scripts/vite-dev-api.js';

function tablerFontDisplayPlugin() {
  return {
    name: 'tabler-font-display-swap',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css') && chunk.source?.includes('tabler-icons')) {
          chunk.source = chunk.source.replace(
            /@font-face\{font-family:tabler-icons;/g,
            '@font-face{font-display:swap;font-family:tabler-icons;'
          );
        }
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://mindleap.ro',
  trailingSlash: 'never',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  publicDir: 'public',
  vite: {
    plugins: [devApiPlugin(), tablerFontDisplayPlugin()],
    build: {
      cssMinify: true,
      minify: 'terser',
    },
    server: {
      https: false,
      strictPort: false,
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'tap',
  },
});
