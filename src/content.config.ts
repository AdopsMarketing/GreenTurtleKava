import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seoFields = {
  metaDescription: z.string().default(''),
  canonical: z.string().url(),
  ogImage: z.string().default(''),
};

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    link: z.string().url(),
    ...seoFields,
  }),
});

// Events are managed through Keystatic (see keystatic.config.ts), which derives the URL slug
// from the filename rather than a frontmatter field — so entries it creates carry no `slug`,
// `link` or `canonical` key. Use `event.id` for the slug and `eventUrl()` for the absolute URL.
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // The date the event actually happens. Optional: the ~190 events imported from WordPress
    // predate this field and fall back to the slug/publish-date heuristics in /events/.
    eventDate: z.coerce.date().optional(),
    // Empty string means "auto-detect from the body copy" — same fallback as above.
    location: z.string().default(''),
    metaDescription: z.string().default(''),
    // `featuredImage` is the Keystatic upload; `ogImage` is the path inherited from the
    // WordPress import. Read them through `eventImage()` rather than directly.
    featuredImage: z.string().default(''),
    ogImage: z.string().default(''),
  }),
});

const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    shortName: z.string(),
    slug: z.string(),
    link: z.string().url(),
    address: z.string(),
    phone: z.string(),
    phoneNote: z.string().optional(),
    mapEmbedQuery: z.string(),
    ...seoFields,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date().optional(),
    link: z.string().url(),
    ...seoFields,
  }),
});

export const collections = { blog, events, locations, pages };
