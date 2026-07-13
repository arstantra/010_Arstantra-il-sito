# Changelog

## 2026-07-13 — Round di fix post-audit

### SEO
- Corretti i `canonical` delle pagine italiane, ora auto-referenziali (`index-it`, `journal-it`, `stay-it` non sono più "cancellate" da Google).
- Aggiunti tag `hreflang` reciproci EN↔IT + `x-default` su tutte le coppie di pagine.
- Tradotti in italiano `meta description`, `og:description`, `twitter:description`, `og:title` e `og:url` sulle pagine IT; corretto `og:locale` (`it_IT` su IT, `en_GB` su EN, con `og:locale:alternate`).
- Tradotto l'h1 di `journal-it` ("& Events" → "& Eventi").
- `sitemap.xml` completata: tutte le pagine EN+IT con alternate `hreflang`, `lastmod` aggiornato.
- Aggiunti dati strutturati **JSON-LD** (`Organization`) su home EN e IT.

### Performance
- `loading="lazy"` + `decoding="async"` su tutte le immagini delle gallery e su quelle below-the-fold (home, stay).

### Sicurezza
- `netlify.toml`: aggiunti header **HSTS** (`Strict-Transport-Security`), **Content-Security-Policy** e `Permissions-Policy`; `X-XSS-Protection` impostato a `0` (best practice attuale).
- `references.js`: CORS ristretto da `*` a `https://arstantra.org`.
- Rimossa la chiave `rss2json` dall'HTML pubblico: il feed del Journal ora passa dalla nuova function proxy `netlify/functions/feed.js` (chiave in env var `RSS2JSON_KEY`).

### Accessibilità
- Associate le `<label>` ai campi dei form (`for`/`id`) su home EN e IT.

### Altro
- Aggiunta pagina **404** personalizzata (`404.html`), coerente con l'estetica del sito.

### ⚠️ Azione manuale richiesta
- Impostare la variabile d'ambiente **`RSS2JSON_KEY`** su Netlify (vedi README). Consigliata anche la **rotazione** della vecchia chiave rss2json, che era pubblica.
- Dopo il deploy, eseguire la checklist di verifica in README (form, feed, calendario, console senza errori CSP).
