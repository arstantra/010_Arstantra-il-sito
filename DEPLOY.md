# Ars Tantra — Deployment & Editing Guide

## Deploy to Netlify (free, 5 minutes)

1. Go to **https://netlify.com** and create a free account
2. From your dashboard: **"Add new site" → "Deploy manually"**
3. Drag and drop this entire folder (index.html + netlify.toml) into the deploy box
4. Your site will be live at a URL like `https://arstantra.netlify.app`
5. To use a custom domain (e.g. arstantra.com): go to **Site settings → Domain management**

## Enable the contact form

Once deployed on Netlify, the contact form works automatically.
Netlify will email you every submission. To set the notification email:
- Go to **Site settings → Forms → Form notifications**
- Add your email address

## Add photos to the gallery (permanent)

1. Create a folder called `images/` alongside `index.html`
2. Add your photos there (e.g. `images/nest1.jpg`, `images/nest2.jpg`...)
3. In `index.html`, find the gallery section and replace:
   ```html
   <div class="gallery-placeholder" id="slot0"><span>+ Add photo</span></div>
   ```
   with:
   ```html
   <img src="images/nest1.jpg" alt="The Wild Nest">
   ```
4. Redeploy by dragging the folder to Netlify again

## Update hospitality platform links

In `index.html`, search for `hospitality-link` to find the block with:
- Couchsurfing
- BeWelcome
- Warm Showers
- Trustroots

Update the `href=""` values to your actual profile URLs.

## Add your own photo to the About section

In `index.html`, find:
```html
<div class="gallery-placeholder">Your photo here</div>
```
Replace with:
```html
<img src="images/andrea-beatrice.jpg" alt="Andrea & Beatrice">
```

## Add references from guests

Visitors can submit references via the form on the References section.
You can also add them directly to the `seedRefs` array in the `<script>` section 
at the bottom of `index.html`.

## Art Studio / Blog

The site links to https://apartstudioreference.blogspot.com/
To change this URL, search for `apartstudioreference.blogspot.com` in index.html.

---

*Questions? The nest is always open.*
