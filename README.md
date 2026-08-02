# TEN OF TEN Website

Static, responsive artist-collective website for **@tenoften.id**. It runs without a framework, build step, backend, or database.

## Included

- Asset-aware intro loader that is skipped on repeat visits and in reduced-motion mode
- Responsive editorial hero with interactive artist portraits
- Keyboard-accessible mobile navigation, scroll progress, and active-section navigation
- Ten-artist roster with city filters, live result count, and persistent grid/list views
- Fullscreen artist profiles with deep links, browser-history support, keyboard navigation, booking shortcut, and copyable profile links
- Interactive five-city Sound Map generated from the artist data
- ACT ONE event section with an accessible four-frame gallery and a sanitized 1 MB public PDF deck
- Live booking-brief preview with direct email, copy-for-Instagram, and Instagram DM actions
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

The form creates a booking brief entirely in the visitor's browser. “Email booking brief” opens the visitor's email app with `Project.tenoften@gmail.com`, subject, and body prefilled. “Copy for Instagram” copies the same brief for a DM to `@tenoften.id`. Nothing is submitted to or stored by the website.

## ACT ONE deck

The website serves `assets/docs/ten-of-ten-act-one-public.pdf`, a compact public edition containing the cover, corrected manifesto, roster, corrected event details, and closing page. Internal planning, future TBC acts, and budget pages from the source deck are intentionally excluded from the public website. The original PDF in `DATA IG/` remains unchanged.

## Design references

The accepted section concepts used for the redesign are saved in `design/concepts/01-hero.png` through `design/concepts/06-act-one.png`.

Final desktop, tablet, and mobile QA captures are saved in `design/qa/`.

## Source images

The current portraits are optimized WebP files. Replace them with approved high-resolution portraits using the same filenames to update the site without code changes.
