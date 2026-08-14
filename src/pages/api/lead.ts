import type { APIRoute } from 'astro';

// Server-rendered on Vercel (a serverless function). Never prerender this.
export const prerender = false;

// GoHighLevel / LeadConnector API v2
const UPSERT_URL = 'https://services.leadconnectorhq.com/contacts/upsert';
const GHL_VERSION = '2021-07-28';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const readEnv = (key: string): string | undefined =>
  (import.meta.env as any)[key] ?? (globalThis as any).process?.env?.[key];

// Field names treated as "core" (mapped onto the contact) — everything else becomes a note.
const CORE = new Set([
  'email', 'your-email', 'name', 'your-name', 'first_name', 'firstName',
  'last_name', 'lastName', 'phone', 'source', '_gotcha',
]);

// Friendlier labels for the note we attach to the contact.
const LABELS: Record<string, string> = {
  'your-subject': 'Subject',
  'your-message': 'Message',
  message: 'Message',
  'your-education': 'Education',
  'your-experience': 'Experience',
  days_available: 'Days available',
  sms_opt_in: 'SMS opt-in',
};

// Attribution fields captured client-side (UTMs, Google Ads ValueTrack, click IDs).
const ATTR = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_adgroup', 'utm_term', 'utm_content',
  'matchtype', 'network', 'device', 'placement', 'loc_physical_ms', 'targetid',
  'gclid', 'fbclid', 'msclkid', 'page_url', 'landing_page', 'referrer',
]);
const ATTR_LABELS: Record<string, string> = {
  utm_source: 'UTM Source',
  utm_medium: 'UTM Medium',
  utm_campaign: 'UTM Campaign',
  utm_adgroup: 'Ad Group ID',
  utm_term: 'Keyword / Term',
  utm_content: 'Creative / Content',
  matchtype: 'Match type',
  network: 'Network',
  device: 'Device',
  placement: 'Placement',
  loc_physical_ms: 'Physical location ID',
  targetid: 'Target ID',
  gclid: 'Google Click ID',
  fbclid: 'Facebook Click ID',
  msclkid: 'Microsoft Click ID',
  landing_page: 'Landing page',
  page_url: 'Submitted from',
  referrer: 'Referrer',
};

// Map captured attribution params -> GHL contact custom-field keys (created in the location).
// gclid is a GHL standard field that can't be set this way, so it stays in the note only.
const CF_KEYS: Record<string, string> = {
  utm_source: 'contact.utm_source',
  utm_medium: 'contact.utm_medium',
  utm_campaign: 'contact.utm_campaign',
  utm_adgroup: 'contact.utm_adgroup',
  utm_term: 'contact.utm_term',
  utm_content: 'contact.utm_content',
  matchtype: 'contact.matchtype',
  network: 'contact.network',
  device: 'contact.device',
  placement: 'contact.placement',
  loc_physical_ms: 'contact.loc_physical_ms',
  targetid: 'contact.target_id',
  fbclid: 'contact.fbclid',
};

// Cache the location's custom-field ids (fieldKey -> id) across warm invocations.
let cfCache: Record<string, string> | null = null;
async function getCustomFieldIds(locationId: string, headers: Record<string, string>) {
  if (cfCache) return cfCache;
  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/locations/${locationId}/customFields?model=contact`,
      { headers }
    );
    const data: any = await res.json();
    const map: Record<string, string> = {};
    for (const f of data.customFields || []) if (f.fieldKey && f.id) map[f.fieldKey] = f.id;
    cfCache = map;
    return map;
  } catch {
    return {};
  }
}

export const POST: APIRoute = async ({ request }) => {
  const token = readEnv('GHL_API_TOKEN');
  const locationId = readEnv('GHL_LOCATION_ID');
  if (!token || !locationId) {
    return json({ ok: false, error: 'Lead capture isn’t set up yet. Please call us or try again later.' }, 503);
  }

  // Parse JSON (from the AJAX handler) or urlencoded/multipart (no-JS fallback).
  let data: Record<string, any> = {};
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      for (const [k, v] of fd.entries()) {
        const key = k.endsWith('[]') ? k.slice(0, -2) : k;
        if (data[key] !== undefined) data[key] = ([] as any[]).concat(data[key], v);
        else data[key] = v;
      }
    }
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  // Honeypot: if a bot filled the hidden field, accept silently without saving.
  if (data._gotcha) return json({ ok: true });

  const str = (v: any) => (v == null ? '' : String(v)).trim();
  const email = str(data.email || data['your-email']);
  const phone = str(data.phone);
  if (!email && !phone) {
    return json({ ok: false, error: 'Please provide an email or phone number.' }, 400);
  }

  const rawName = str(data.name || data['your-name']);
  let firstName = str(data.first_name || data.firstName);
  let lastName = str(data.last_name || data.lastName);
  if (!firstName && rawName) {
    const parts = rawName.split(/\s+/);
    firstName = parts.shift() || '';
    lastName = parts.join(' ');
  }
  const formSource = str(data.source) || 'Website';
  const utmSource = str(data.utm_source);
  const utmMedium = str(data.utm_medium);
  // GHL "Source" field: ad/UTM attribution when present, otherwise the form type.
  const ghlSource = utmSource ? (utmMedium ? `${utmSource} / ${utmMedium}` : utmSource) : formSource;

  const ghlHeaders = {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Map captured attribution to the location's custom fields (by id).
  const cfIds = await getCustomFieldIds(locationId, ghlHeaders);
  const customFields: Array<{ id: string; value: string }> = [];
  for (const [param, key] of Object.entries(CF_KEYS)) {
    const v = str((data as any)[param]);
    const id = cfIds[key];
    if (v && id) customFields.push({ id, value: v });
  }

  const payload: Record<string, any> = {
    locationId,
    email: email || undefined,
    phone: phone || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    name: rawName || undefined,
    source: ghlSource,
    tags: ['website-lead', formSource.toLowerCase().replace(/\s+/g, '-')],
    ...(customFields.length ? { customFields } : {}),
  };

  let res: Response;
  try {
    res = await fetch(UPSERT_URL, { method: 'POST', headers: ghlHeaders, body: JSON.stringify(payload) });
  } catch {
    return json({ ok: false, error: 'Could not reach the CRM. Please try again.' }, 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return json(
      { ok: false, error: 'Could not save your details. Please try again.', status: res.status, detail: detail.slice(0, 300) },
      502
    );
  }

  const result = await res.json().catch(() => ({} as any));
  const contactId = result?.contact?.id || result?.id;

  // Capture form-specific fields (subject, message, education, days, etc.) as a note on the contact.
  const noteLines: string[] = [`Source: ${formSource}`];
  for (const [k, v] of Object.entries(data)) {
    if (CORE.has(k) || ATTR.has(k) || v == null || v === '') continue;
    const val = Array.isArray(v) ? v.join(', ') : String(v);
    if (val.trim()) noteLines.push(`${LABELS[k] || k}: ${val}`);
  }
  const attrLines: string[] = [];
  for (const k of ATTR) {
    const v = str((data as any)[k]);
    if (v) attrLines.push(`${ATTR_LABELS[k] || k}: ${v}`);
  }
  if (attrLines.length) noteLines.push('', 'Attribution', ...attrLines);

  if (contactId && noteLines.length > 1) {
    try {
      await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: ghlHeaders,
        body: JSON.stringify({ body: noteLines.join('\n') }),
      });
    } catch {
      /* best-effort — the contact is already saved */
    }
  }

  return json({ ok: true });
};
