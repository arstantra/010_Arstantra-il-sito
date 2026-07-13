// netlify/functions/feed.js
// Proxy sicuro per il feed RSS di Substack tramite rss2json.
// La API key vive nelle env var di Netlify — mai nel codice pubblico.
//
// ⚠️ RICHIEDE una variabile d'ambiente su Netlify:
//    Site settings → Environment variables → RSS2JSON_KEY = <la tua chiave rss2json>
// Se la variabile manca, il journal mostra automaticamente i post segnaposto (fallback).

const RSS_KEY = process.env.RSS2JSON_KEY;
const RSS_URL = 'https://arstantra.substack.com/feed';

const headers = {
  'Access-Control-Allow-Origin': 'https://arstantra.org',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=1800' // 30 min di cache CDN
};

exports.handler = async () => {
  if (!RSS_KEY) {
    // Nessuna chiave configurata → il client userà il fallback
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'error', items: [] }) };
  }

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&api_key=${RSS_KEY}&count=8`;
    const res = await fetch(api);
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'error', items: [] }) };
  }
};
