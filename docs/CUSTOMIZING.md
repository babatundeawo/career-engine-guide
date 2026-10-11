# Customizing the site

Everything is edited on the GitHub website. Open a file, click the pencil icon, edit, then **Commit changes**. The site updates a minute or two after the change reaches `main` (see [DEPLOYMENT.md](DEPLOYMENT.md)).

## Colours

Open `css/base.css`. The first block, **DESIGN TOKENS**, holds every colour.

| To change | Edit this line |
| --- | --- |
| Main brand colour | `--brand` (and `--brand-text`, which must stay dark enough to read on white) |
| Warm accent | `--ember` |
| Page background and text | `--bg`, `--ink` |
| The four phase colours | `--p1` to `--p4` |

Dark mode has its own values in the `:root[data-theme="dark"]` block just below. After a colour change, check that text is still easy to read in both themes.

## Text

Page text is in the `.html` files: `index.html` for the home page, `phase-1-about-me.html` to `phase-4-generate.html` for the phases, plus `portfolio.html`, `maintenance.html` and `tips.html`. Keep the `<title>` and `description` lines near the top, since search engines show them.

The header and footer repeat on every page, so a change to the menu or footer must be made in each file.

## Images and icons

- Social preview image (shown when the link is shared): `assets/og-image.png`, 1200 x 630 pixels
- Logo and favicon: `assets/favicon.svg`, plus the PNG versions in `assets/` and `favicon.ico`
- Interface icons: `assets/icons.svg`

Upload a replacement with the same file name using **Add file > Upload files** inside the folder.

## Fonts

Fonts load from Google Fonts. The link is the `fonts.googleapis.com` line in each page's `<head>`, and the font names are set in `--font-display`, `--font-body`, `--font-serif` and `--font-mono` in `css/base.css`.

## If you add a custom domain

Open `404.html` and change `<base href="/career-engine-guide/">` to `<base href="/">`. Also update the web address in `sitemap.xml`, `robots.txt` and the `canonical` and `og:url` lines of each page.
