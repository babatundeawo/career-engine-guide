# Customizing the site

Everything is edited on the GitHub website or in GitHub Desktop. After a change reaches `main`, the site updates in a minute or two (see [DEPLOYMENT.md](DEPLOYMENT.md)).

## Colours

Open `css/base.css`. The block called **DESIGN TOKENS** holds every colour.

| To change | Edit this line |
| --- | --- |
| Main brand colour | `--brand` (and `--brand-text`, which must stay dark enough to read on white) |
| Warm accent | `--ember` |
| Page background and text | `--bg`, `--ink` |
| The four phase colours | `--p1` to `--p4` |

Dark mode has its own values in the `:root[data-theme="dark"]` block just below. After a colour change, check that text is still easy to read in both themes. The app colours in `site.webmanifest` (`theme_color`, `background_color`) and the `theme-color` lines in each page should match.

## Text

Page text is in the `.html` files: `index.html` for the home page, `phase-1-about-me.html` to `phase-4-generate.html` for the phases, plus `portfolio.html`, `maintenance.html`, `tips.html` and `offline.html`. Keep the `<title>` and `description` lines near the top, since search engines show them.

The header and footer repeat on every page, so a change to the menu or footer must be made in each file.

## Images and icons

- Social preview image (shown when the link is shared): `assets/og-image.png`, 1200 x 630 pixels
- Logo and favicon: `assets/favicon.svg`, plus `favicon.ico`
- App icons: `assets/icon-192.png`, `assets/icon-512.png`, `assets/apple-touch-icon.png` (180 x 180), and `assets/icon-maskable-512.png` (keep the logo inside the central 80 percent so phones can crop it into a circle)
- Install screenshots: `assets/screenshot-wide.png` (1280 x 720) and `assets/screenshot-narrow.png` (540 x 960)
- Interface icons: `assets/icons.svg`

Upload a replacement with the same file name using **Add file > Upload files** inside the folder.

## Fonts

The fonts are downloaded and self-hosted automatically during each deploy, from the Fontsource packages named in `.github/workflows/deploy.yml` and `.github/scripts/build.py`. The `@font-face` rules are at the top of `css/base.css` and the font names are set in `--font-display`, `--font-body` and `--font-serif`. To use a different Google font, change the package name in the workflow, the file name in `build.py`, the `@font-face` line and the matching `<link rel="preload">` line in each page.

## If you add a custom domain

1. In GitHub, go to **Settings > Pages > Custom domain**, enter the domain and save.
2. Create a file named `CNAME` (no extension) in the root of the repository containing only the domain, for example `guide.example.com`.
3. Commit and push. The build detects the `CNAME` file and automatically rewrites every address, the sitemap, `robots.txt` and the base path of the 404 page. Nothing else needs editing.

## After you change pages

If you add a new page, also add it to `sitemap.xml`. The service worker picks up new pages automatically on the next deploy.
