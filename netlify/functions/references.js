// netlify/functions/references.js
// This function is a secure proxy between the website and Airtable.
// The token lives in Netlify environment variables — never in public code.

const AT_TOKEN   = process.env.AIRTABLE_TOKEN;
const AT_BASE_ID = 'appHyYd3O72ecuPwK';
const AT_TABLE   = 'References';
const AT_URL     = `https://api.airtable.com/v0/${AT_BASE_ID}/${encodeURIComponent(AT_TABLE)}`;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const atHeaders = {
    Authorization: `Bearer ${AT_TOKEN}`,
    'Content-Type': 'application/json'
  };

  // ── GET: return all approved references ──────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const params = new URLSearchParams({
        filterByFormula: '{Approved}=1',
        'sort[0][field]': 'Name',
        'sort[0][direction]': 'asc',
        pageSize: '100'
      });

      const res = await fetch(`${AT_URL}?${params}`, { headers: atHeaders });
      if (!res.ok) throw new Error(`Airtable ${res.status}`);

      const data = await res.json();
      const refs = (data.records || []).map(r => r.fields);

      return { statusCode: 200, headers, body: JSON.stringify(refs) };

    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── POST: submit a new reference (Approved = false by default) ───
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { Name, Location, Text, Source, Rating } = body;

      if (!Name || !Text) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and Text are required.' }) };
      }

      const res = await fetch(AT_URL, {
        method: 'POST',
        headers: atHeaders,
        body: JSON.stringify({
          fields: {
            Name,
            Location: Location || '',
            Text,
            Source: Source || 'Guest',
            Rating: Number(Rating) || 5,
            Approved: false
          }
        })
      });

      if (!res.ok) throw new Error(`Airtable ${res.status}`);
      const data = await res.json();

      return { statusCode: 200, headers, body: JSON.stringify({ id: data.id }) };

    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
