---
titolo: "Ars Tantra - The Wild Nest | Sito web ufficiale"
anno: null
tipo: portfolio
stato: completo
tags: [sito-web, tantra, body-painting, ferrara, html, multilingua, community]
output: index.html
disciplina: altro
contesto: professionale
lingua: it-en
---

Sito web ufficiale di Ars Tantra Society, una comunità dedicata alle pratiche tantriche, body painting e connessione consapevole con sede a Ferrara. Il progetto è strutturato come applicazione web statica multilingue (italiano/inglese) con pagine dedicate a presentazione, journal/eventi, soggiorno e policy.

La cartella contiene il repository Git completo con versione controllata, asset grafici in WebP, funzioni Netlify per gestione contatti e configurazione di deployment. Include pagine HTML responsive, sitemap SEO e file di configurazione per hosting cloud-native.

---

## Manutenzione e deploy

**Deploy:** commit e push su GitHub (via GitHub Desktop) → Netlify pubblica in automatico su `arstantra.org`.

**Regola d'oro:** ogni modifica va replicata sia sulla pagina EN sia sulla corrispondente pagina IT (`index.html` ↔ `index-it.html`, `journal.html` ↔ `journal-it.html`, `stay.html` ↔ `stay-it.html`), altrimenti le due versioni divergono.

### ⚠️ Variabili d'ambiente richieste su Netlify

Da impostare in *Site settings → Environment variables* (senza queste, le relative funzioni non lavorano):

- `AIRTABLE_TOKEN` — token Airtable per il proxy delle testimonianze (`references.js`).
- `RSS2JSON_KEY` — chiave rss2json per il feed del Journal (`feed.js`). **Nuova:** se manca, il Journal mostra automaticamente i post segnaposto (nessun errore visibile).

### ✅ Da controllare dopo ogni deploy (specialmente dopo modifiche a `netlify.toml`)

È attiva una Content-Security-Policy: se aggiungi script o servizi esterni nuovi, aggiorna la CSP in `netlify.toml` o verranno bloccati. Dopo il deploy, apri il sito e controlla che funzionino:

1. Form contatti (invio via EmailJS)
2. Form testimonianze (invio + caricamento voci)
3. Feed del Journal (post da Substack)
4. Calendario Google nella pagina *Stay*
5. Console del browser senza errori CSP (tasto F12 → Console)

Vedi `_archivio/AUDIT_arstantra_2026-07-13.md` per il report completo (il file non è tracciato da Git).