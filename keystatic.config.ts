import { config, collection, fields } from '@keystatic/core';

// Local storage keeps `npm run dev` working with no GitHub app configured — no sign-in, and
// edits land straight on disk. Production talks to GitHub so the CMS can commit to the repo and
// trigger a Vercel rebuild; access there is whoever has write permission on the repo.
// See docs/keystatic-events.md for the env vars the GitHub mode needs.
const storage = import.meta.env.DEV
  ? ({ kind: 'local' } as const)
  : ({
      kind: 'github',
      repo: { owner: 'AdopsMarketing', name: 'GreenTurtleKava' },
    } as const);

export default config({
  storage,
  ui: {
    brand: { name: 'Green Turtle Kava Events' },
  },
  collections: {
    events: collection({
      label: 'Events',
      path: 'src/content/events/*',
      // `title` doubles as the slug field: the text goes to frontmatter `title`, and the
      // slugified half becomes the filename, which is the `event.id` the site routes on.
      slugField: 'title',
      entryLayout: 'content',
      // Writes the body below the frontmatter. `extension: 'md'` keeps files as `.md` so the
      // 190+ events already in src/content/events stay readable by both Keystatic and Astro.
      format: { contentField: 'content' },
      columns: ['title', 'eventDate'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Shown on the event card, the event page, and the countdown.',
            validation: { isRequired: true },
          },
          slug: {
            label: 'URL slug',
            description:
              'The event lives at /event/<slug>/. Changing it on a published event breaks existing links.',
          },
        }),
        eventDate: fields.datetime({
          label: 'Event date & time',
          description:
            'When the event actually happens. Drives the countdown, the ordering on /events/, and the date badge on the card.',
        }),
        location: fields.select({
          label: 'Location',
          description: 'Which bar the event is at. Groups the event on the /events/ page.',
          options: [
            { label: 'Auto-detect from content', value: '' },
            { label: 'St. Augustine', value: 'St. Augustine' },
            { label: 'Daytona Beach', value: 'Daytona Beach' },
            { label: 'Ormond Beach', value: 'Ormond Beach' },
            { label: 'Other / Coming soon', value: 'Other' },
          ],
          defaultValue: '',
        }),
        featuredImage: fields.image({
          label: 'Featured image',
          description:
            'Event card artwork, the hero image on the event page, and the social share image. Roughly 350x434 crops best on the cards. Overrides the imported path below.',
          directory: 'public/images/events',
          publicPath: '/images/events/',
        }),
        // `fields.image` only indexes one flat directory, so it cannot see the nested
        // `/images/media/<year>/<month>/` artwork the ~190 imported events point at. Keeping
        // that path in its own text field means saving an imported event never silently drops
        // its image — uploading a replacement above is what supersedes it.
        ogImage: fields.text({
          label: 'Imported image path',
          description:
            'Artwork path carried over from the old WordPress site. Leave blank on new events and use the upload above.',
        }),
        metaDescription: fields.text({
          label: 'Meta description (SEO)',
          description: 'Search-result snippet. Around 150-160 characters.',
          multiline: true,
        }),
        date: fields.datetime({
          label: 'Published date',
          description: 'When this entry was published. Used as a fallback when no event date is set.',
          defaultValue: { kind: 'now' },
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
        }),
      },
    }),
  },
});
