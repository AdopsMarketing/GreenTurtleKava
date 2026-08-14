# Keystatic CMS — Events

Keystatic manages the **events** collection only. Blog, locations and pages are still edited as
files by hand.

## Where things live

| Thing | Path |
| --- | --- |
| CMS config | [`keystatic.config.ts`](../keystatic.config.ts) |
| Event content | `src/content/events/*.md` |
| Uploaded artwork | `public/images/events/` |
| Astro schema | [`src/content.config.ts`](../src/content.config.ts) |
| Shared event helpers | [`src/data/events.ts`](../src/data/events.ts) |

The dashboard route (`/keystatic`) and its API (`/api/keystatic/*`) are injected by the
`@keystatic/astro` integration and marked `prerender: false` — there are no page files for them,
and they run as Vercel serverless functions. `/keystatic` is excluded from the sitemap.

## Local editing

```bash
npm run dev
```

Then open http://localhost:4321/keystatic. Local dev uses `storage: { kind: 'local' }`, so saving
writes directly to `src/content/events/` — commit the result yourself. No GitHub app or env vars
are needed for this.

## Production

Production uses `storage: { kind: 'github' }` against `AdopsMarketing/GreenTurtleKava`, so saving
in the CMS opens a commit against the repo and Vercel rebuilds. That needs a GitHub App and four
environment variables — see [`.env.example`](../.env.example) for how to create them and what to
set in Vercel.

## Fields

| Field | Notes |
| --- | --- |
| **Title** | Also generates the URL slug. The slug is the filename, and the page is `/event/<slug>/`. Changing it on a published event breaks existing links. |
| **Event date & time** | When the event happens. Drives the countdown, the ordering on `/events/`, and the date badge on the card. |
| **Location** | Groups the event on `/events/`. "Auto-detect" reads the bar name out of the body copy, which is how the imported events work. |
| **Featured image** | Uploads to `public/images/events/`. Takes priority over the imported path. |
| **Imported image path** | The `/images/media/...` path carried over from WordPress. See below. |
| **Meta description** | Search-result snippet. |
| **Content** | The event body. |
| **Published date** | Legacy WordPress publish date; only used to order events that have no event date. |

Read the image and date through `eventImage()` / `resolveEventDate()` in `src/data/events.ts`
rather than off `event.data` directly, so the fallbacks stay in one place.

## Why there are two image fields

Keystatic's `fields.image` indexes exactly one flat directory. The ~190 imported events point at
nested `/images/media/<year>/<month>/` paths (194 MB of artwork) that it cannot see, so a single
image field would show "no image" on every imported event and silently blank out `ogImage` the
first time someone saved one.

Keeping the imported path in its own text field makes saving non-destructive. New events use the
uploader and leave the imported field blank.

To collapse this to a single field later, move the 187 referenced images into
`public/images/events/` (11 filenames collide across month folders and need renaming), repoint
each `ogImage`, then replace both fields with one `fields.image`.

## Notes on the imported content

- **Bodies were converted from WordPress HTML to Markdown** (via `turndown`, one-off), so every
  event edits as rich text in the CMS. Verified by diffing the rendered `<article>` of all 191
  pages before and after: visible text is identical on every page. The only structural changes
  were dropping empty markup (`<p>&nbsp;</p>`, an empty `<h2>`, two `src`-less `<img>` tags),
  unwrapping styling-free `<div>`/`<span>`/`<article>` nesting, and unwrapping `<a>` tags that
  had no `href`. One `src`-less `<iframe>` in `daytona-beach-grand-opening` was kept as raw HTML.
- **Event dates are stored as UTC wall-clock.** Keystatic writes the time the editor typed with a
  `Z` suffix, so `resolveEventDate()` re-anchors it to `America/New_York`. Without that the
  countdown fires hours early. Format event dates with `formatEventDate()`, which pins the same
  zone so the day shown never depends on the build machine.
- `date:` values were normalised to full ISO-8601 (`2023-07-04T22:00:35.000Z`). Keystatic's
  datetime field rejects the bare `2023-07-04T22:00:35` form the import produced and refuses to
  save the entry.
