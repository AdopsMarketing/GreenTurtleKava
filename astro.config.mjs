// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://greenturtlekava.co',
  // Static by default; only the checkout API route opts into server rendering
  // (via `export const prerender = false`), which Vercel runs as a serverless function.
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    sitemap({
      // Keep transactional / functional pages out of the sitemap; shop + product pages stay in.
      filter: (page) =>
        !['/cart/', '/checkout/', '/my-account/', '/shop/thank-you/', '/api/'].some((p) =>
          page.includes(p)
        ),
    }),
  ],
});