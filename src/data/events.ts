import type { CollectionEntry } from 'astro:content';

export type EventLocation = 'St. Augustine' | 'Daytona Beach' | 'Ormond Beach' | 'Other';

export const EVENT_LOCATIONS = [
  'St. Augustine',
  'Daytona Beach',
  'Ormond Beach',
  'Other',
] as const satisfies readonly EventLocation[];

export const EVENT_LOCATION_LABELS: Record<EventLocation, string> = {
  'St. Augustine': 'St Augustine Events',
  'Daytona Beach': 'Daytona Beach Events',
  'Ormond Beach': 'Ormond Beach Events',
  Other: 'Coming Soon Events',
};

type Event = CollectionEntry<'events'>;

/** All three bars are in Florida, so event times are always Eastern. */
export const SITE_TIME_ZONE = 'America/New_York';

/** How far `date` is ahead of UTC in `timeZone`, in milliseconds, at that instant. */
function zoneOffset(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const at = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)!.value);
  const asUtc = Date.UTC(at('year'), at('month') - 1, at('day'), at('hour') % 24, at('minute'), at('second'));
  return asUtc - date.getTime();
}

/**
 * Keystatic's datetime field writes the wall-clock time the editor typed with a `Z` suffix
 * ("8:00 PM" becomes `20:00:00.000Z`), so the parsed Date is that wall clock misread as UTC.
 * Re-anchor it to Eastern, otherwise the countdown fires hours early and the card can show
 * the wrong day. Applied twice so the offset is taken on the correct side of a DST boundary.
 */
function fromSiteWallClock(stored: Date): Date {
  const wallMs = stored.getTime();
  const firstPass = new Date(wallMs - zoneOffset(stored, SITE_TIME_ZONE));
  return new Date(wallMs - zoneOffset(firstPass, SITE_TIME_ZONE));
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/** The ~190 events imported from WordPress name their bar in the body copy. */
function detectLocationFromBody(body: string): EventLocation {
  if (/Daytona Beach/i.test(body)) return 'Daytona Beach';
  if (/Ormond Beach/i.test(body)) return 'Ormond Beach';
  if (/St\.?\s?Augustine/i.test(body)) return 'St. Augustine';
  return 'Other';
}

/**
 * Many imported slugs encode the real event date (e.g. "massage-and-dry-needling-july-25"),
 * which is far more reliable than the WordPress post-creation date.
 */
function detectDateFromSlug(id: string, fallback: Date): Date {
  const match = id.match(/-([a-z]+)-(\d{1,2})$/i);
  if (match) {
    const monthIndex = MONTHS.indexOf(match[1].toLowerCase());
    const day = parseInt(match[2], 10);
    if (monthIndex >= 0 && day >= 1 && day <= 31) {
      return new Date(fallback.getFullYear(), monthIndex, day, 12, 0, 0);
    }
  }
  return fallback;
}

/** Prefer the location picked in Keystatic; fall back to the imported-content heuristic. */
export function resolveEventLocation(event: Event): EventLocation {
  const explicit = event.data.location;
  if ((EVENT_LOCATIONS as readonly string[]).includes(explicit)) {
    return explicit as EventLocation;
  }
  return detectLocationFromBody(event.body ?? '');
}

/** Prefer the date entered in Keystatic; fall back to the slug/publish-date heuristic. */
export function resolveEventDate(event: Event): Date {
  return event.data.eventDate
    ? fromSiteWallClock(event.data.eventDate)
    : detectDateFromSlug(event.id, new Date(event.data.date));
}

/** Formats in Eastern so the day shown never depends on the build machine's time zone. */
export function formatEventDate(event: Event): string {
  return resolveEventDate(event).toLocaleDateString('en-US', {
    timeZone: SITE_TIME_ZONE,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** An uploaded featured image wins; otherwise fall back to the imported WordPress artwork. */
export const eventImage = (event: Event) => event.data.featuredImage || event.data.ogImage;

/** Keystatic derives the slug from the filename, which is exactly `event.id`. */
export const eventHref = (event: Event) => `/event/${event.id}/`;

export const eventCanonical = (event: Event) =>
  `https://greenturtlekava.co/event/${event.id}/`;
