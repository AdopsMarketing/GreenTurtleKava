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

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    link: z.string().url(),
    ...seoFields,
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
