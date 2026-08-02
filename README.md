# TEN OF TEN Website

Static, responsive artist-collective website for **@tenoften.id**. It runs without a framework, build step, backend, or database.

## Included

- Asset-aware intro loader that is skipped on repeat visits and in reduced-motion mode
- Responsive editorial hero with interactive artist portraits
- Keyboard-accessible mobile navigation, scroll progress, and active-section navigation
- Ten-artist roster with city filters, live result count, and persistent grid/list views
- Fullscreen artist profiles with deep links, browser-history support, keyboard navigation, booking shortcut, and copyable profile links
- Interactive five-city Sound Map generated from the artist data
- Live booking-brief preview with separate copy and Instagram actions
- Responsive desktop/mobile layouts, focus states, no-JavaScript fallbacks, and reduced-motion support
- SEO, Open Graph, Twitter card, favicon, and Organization structured metadata

## Run locally

Open a terminal in this folder and run:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8080`.

## Upload to hosting

Upload these runtime files and folders to `public_html`:

- `index.html`
- `styles.css`
- `script.js`
- `data.js`
- `assets/`

`DATA IG/` contains source screenshots and is not used by the website. `design/` contains concept references and QA captures and is also not required at runtime.

## Edit artist data

Names, usernames, cities, genres, biographies, and image paths are stored in `data.js`. Keep IDs unique and preserve the `01`–`10` ordering.

## Booking behavior

The form creates a booking brief entirely in the visitor's browser. “Copy booking brief” copies it to the clipboard; “Open Instagram” is a separate, explicit link so browsers do not block it as a popup. Nothing is submitted or stored automatically.

## Design references

The accepted section concepts used for the redesign are saved in `design/concepts/01-hero.png` through `design/concepts/05-booking.png`.

Final desktop, tablet, and mobile QA captures are saved in `design/qa/`.

## Source images

The current portraits are optimized WebP files. Replace them with approved high-resolution portraits using the same filenames to update the site without code changes.
