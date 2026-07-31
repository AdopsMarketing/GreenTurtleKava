// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://greenturtlekava.co',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    sitemap({
      filter: (page) =>
        !['/shop/', '/cart/', '/checkout/', '/my-account/'].some((p) => page.includes(p)),
    }),
  ],
});