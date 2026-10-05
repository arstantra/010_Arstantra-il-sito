// netlify/functions/references.js
// This function is a secure proxy between the website and Airtable.
// The token lives in Netlify environment variables — never in public code.
//
// ── WHY THE CACHING MATTERS ───────────────────────────────────────
// The Airtable Free plan allows 1,000 API calls per month across the
// whole workspace. Without caching, every single visit to the home
// page (EN *and* IT) burned one call, so roughly 1,000 monthly visits
// would silently kill the References section.
//
// Two layers now sit in front of Airtable:
//   1. An in-process memo, reused while a Lambda container stays warm.
//   2. Netlify's edge CDN cache (Netlify-CDN-Cache-Control), which
//      serves thousands of visitors from one single upstream call.
//
// References only change when Andrea approves one in Airtable, so a
// few hours of staleness costs nothing and saves the whole quota.
// ──────────────────────────────────────────────────────────────────

const AT_TOKEN   = process.env.AIRTABLE_TOKEN;
const AT_BASE_ID = 'appHyYd3O72ecuPwK';
const AT_TABLE   = 'References';
const AT_URL     = `https://api.airtable.com/v0/${AT_BASE_ID}/${encodeURIComponent(AT_TABLE)}`;

// Edge cache: 6 hours fresh, then up to 24 hours stale while revalidating.
const EDGE_MAX_AGE = 21600;
const EDGE_SWR     = 86400;
// In-process memo, for as long as this container stays warm.
const MEMO_TTL_MS  = 10 * 60 * 1000;

let memo = { at: 0, data: null };

const headers = {
  'Access-Control-Allow-Origin': 'https://arstantra.org',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Cache headers for GET only. The browser revalidates cheaply; the CDN
// absorbs the traffic. Never applied to POST.
const cacheHeaders = {
  'Cache-Control': 'public, max-age=300',
  'Netlify-CDN-Cache-Control': `public, max-age=${EDGE_MAX_AGE}, stale-while-revalidate=${EDGE_SWR}`
};

const noStore = { 'Cache-Control': 'no-store' };

// Only these fields ever reach the public page. Anything else in the
// Airtable record — Email, Approved, internal notes — stays server-side.
const PUBLIC_FIELDS = ['Name', 'Location', 'Text', 'Source', 'Rating'];

function toPublic(fields) {
  const out = {};
  for (const key of PUBLIC_FIELDS) {
    if (fields[key] !== undefined) out[key] = fields[key];
  }
  return out;
}

const clip = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

exports.handler = async (event) => {

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...headers, ...noStore }, body: '' };
  }

  const atHeaders = {
    Authorization: `Bearer ${AT_TOKEN}`,
    'Content-Type': 'application/json'
  };

  // ── GET: return all approved references ──────────────────────────
  if (event.httpMethod === 'GET') {

    // Layer 1 — warm container memo.
    if (memo.data && (Date.now() - memo.at) < MEMO_TTL_MS) {
      return {
        statusCode: 200,
        headers: { ...headers, ...cacheHeaders },
        body: JSON.stringify(memo.data)
      };
    }

    try {
      const params = new URLSearchParams({
        filterByFormula: '{Approved}=1',
        'sort[0][field]': 'Name',
        'sort[0][direction]': 'asc',
        pageSize: '100'
      });
      // Ask Airtable for the public fields only — smaller payload, and
      // private fields never leave Airtable in the first place.
      PUBLIC_FIELDS.forEach(f => params.append('fields[]', f));

      const res = await fetch(`${AT_URL}?${params}`, { headers: atHeaders });
      if (!res.ok) throw new Error(`Airtable ${res.status}`);

      const data = await res.json();
      const refs = (data.records || []).map(r => toPublic(r.fields || {}));

      memo = { at: Date.now(), data: refs };

      return {
        statusCode: 200,
        headers: { ...headers, ...cacheHeaders },
        body: JSON.stringify(refs)
      };

    } catch (err) {
      // If Airtable is down or the monthly quota is spent, serve the last
      // known good list rather than an empty section.
      if (memo.data) {
        return {
          statusCode: 200,
          headers: { ...headers, ...cacheHeaders },
          body: JSON.stringify(memo.data)
        };
      }
      return {
        statusCode: 500,
        headers: { ...headers, ...noStore },
        body: JSON.stringify({ error: err.message })
      };
    }
  }

  // ── POST: submit a new reference (Approved = false by default) ───
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');

      const Name     = clip(body.Name, 100);
      const Location = clip(body.Location, 100);
      const Text     = clip(body.Text, 2000);
      const Email    = clip(body.Email, 150);
      const Source   = clip(body.Source, 50) || 'Guest';
      const Rating   = Number(body.Rating) || 5;

      if (!Name || !Text) {
        return {
          statusCode: 400,
          headers: { ...headers, ...noStore },
          body: JSON.stringify({ error: 'Name and Text are required.' })
        };
      }

      const baseFields = {
        Name,
        Location,
        Text,
        Source,
        Rating,
        Approved: false
      };

      const send = (fields) => fetch(AT_URL, {
        method: 'POST',
        headers: atHeaders,
        body: JSON.stringify({ fields })
      });

      // Email is optional and private. If the "Email" column does not exist
      // in the Airtable base yet, Airtable answers 422 — in that case we
      // save the reference anyway rather than losing the submission.
      let res = await send(Email ? { ...baseFields, Email } : baseFields);

      if (!res.ok && Email && res.status === 422) {
        res = await send(baseFields);
      }

      if (!res.ok) throw new Error(`Airtable ${res.status}`);
      const data = await res.json();

      // A new reference arrives unapproved, so the public list is unchanged
      // — but drop the memo so an approval shows up promptly.
      memo = { at: 0, data: null };

      return {
        statusCode: 200,
        headers: { ...headers, ...noStore },
        body: JSON.stringify({ id: data.id })
      };

    } catch (err) {
      return {
        statusCode: 500,
        headers: { ...headers, ...noStore },
        body: JSON.stringify({ error: err.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers: { ...headers, ...noStore },
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
