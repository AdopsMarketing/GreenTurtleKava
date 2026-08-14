// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://greenturtlekava.co',
  // Static by default; only the checkout API route and Keystatic's admin/API routes opt into
  // server rendering (via `export const prerender = false`), which Vercel runs as serverless
  // functions. Keystatic injects `/keystatic/[...params]` and `/api/keystatic/[...params]`
  // itself, already marked `prerender: false` — no page files needed for them.
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    // Keystatic's admin UI is a React app rendered with `client:only="react"`.
    react(),
    keystatic(),
    sitemap({
      // Keep transactional / functional pages out of the sitemap; shop + product pages stay in.
      filter: (page) =>
        !['/cart/', '/checkout/', '/my-account/', '/shop/thank-you/', '/thank-you/', '/api/', '/keystatic'].some(
          (p) => page.includes(p)
        ),
    }),
  ],
});