#!/usr/bin/env python3
"""Assembles the publishable site into an output folder (default: _site).

What it does:
  * copies the site files and the self-hosted fonts
  * works out the real address of the site (project page, user page or
    custom domain from a CNAME file) and rewrites the placeholder address
    in every page, the sitemap, robots.txt and the manifest
  * fixes the <base> tag of 404.html for that address
  * stamps sw.js with a build version and the list of files to precache

The last line printed on stdout is the site address (used by later steps).
"""
import hashlib
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE_SITE = 'https://babatundeawo.github.io/career-engine-guide/'
SOURCE_BASE = '/career-engine-guide/'
FONT_CACHE = ROOT / '.fontcache' / 'node_modules'
FONTS = {
    '@fontsource-variable/bricolage-grotesque': ('files', 'bricolage-grotesque-latin-wght-normal.woff2'),
    '@fontsource-variable/inter': ('files', 'inter-latin-wght-normal.woff2'),
    '@fontsource/instrument-serif': ('files', 'instrument-serif-latin-400-italic.woff2'),
}
COPY_FILES = ['favicon.ico', 'site.webmanifest', 'robots.txt', 'sitemap.xml', 'sw.js', '.nojekyll']
COPY_DIRS = ['css', 'js', 'assets']
TEXT_SUFFIXES = {'.html', '.xml', '.txt', '.webmanifest', '.js', '.json', '.css'}


def log(msg):
    print(msg, file=sys.stderr)


def resolve_site():
    cname = ROOT / 'CNAME'
    if cname.exists() and cname.read_text().strip():
        return 'https://' + cname.read_text().strip().split()[0] + '/', '/'
    repo = os.environ.get('GITHUB_REPOSITORY', '')
    if '/' not in repo:
        return SOURCE_SITE, SOURCE_BASE
    owner, name = repo.split('/', 1)
    if name.lower() == f'{owner.lower()}.github.io':
        return f'https://{owner.lower()}.github.io/', '/'
    return f'https://{owner.lower()}.github.io/{name}/', f'/{name}/'


def main(out_arg):
    out = ROOT / out_arg
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    for page in sorted(ROOT.glob('*.html')):
        shutil.copy2(page, out / page.name)
    for name in COPY_FILES:
        if (ROOT / name).exists():
            shutil.copy2(ROOT / name, out / name)
    for d in COPY_DIRS:
        shutil.copytree(ROOT / d, out / d)

    # Fonts: copied from the npm packages the workflow installed. Missing fonts are
    # not fatal because the CSS falls back to system fonts.
    fonts_dir = out / 'fonts'
    fonts_dir.mkdir()
    missing = []
    for package, (sub, filename) in FONTS.items():
        src = FONT_CACHE / package / sub / filename
        if src.exists():
            shutil.copy2(src, fonts_dir / filename)
        else:
            missing.append(filename)
    if missing:
        log('WARNING: font files not found, the site will use system fonts: ' + ', '.join(missing))

    site, base = resolve_site()
    log(f'Site address: {site}  (base path {base})')

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    for f in out.rglob('*'):
        if not f.is_file() or f.suffix not in TEXT_SUFFIXES:
            continue
        text = f.read_text(encoding='utf8')
        new = text
        if site != SOURCE_SITE:
            new = new.replace(SOURCE_SITE, site)
        if f.name == '404.html':
            new = new.replace(f'<base href="{SOURCE_BASE}">', f'<base href="{base}">')
        if f.name == 'sitemap.xml':
            new = re.sub(r'<lastmod>[^<]*</lastmod>', f'<lastmod>{today}</lastmod>', new)
        if new != text:
            f.write_text(new, encoding='utf8')

    # Service worker: precache every page, style, script, font and icon the guide needs.
    precache = ['./']
    skip = {'404.html', 'sw.js', 'sitemap.xml', 'robots.txt', '.nojekyll'}
    for f in sorted(out.rglob('*')):
        rel = f.relative_to(out).as_posix()
        if not f.is_file() or rel in skip or f.name.startswith('.') or rel.startswith('assets/screenshot'):
            continue
        if rel.startswith('assets/og-image') or rel in ('assets/icon-512.png', 'assets/icon-maskable-512.png'):
            continue
        precache.append(rel)
    digest = hashlib.sha256()
    for rel in precache[1:]:
        digest.update(rel.encode())
        digest.update((out / rel).read_bytes())
    version = digest.hexdigest()[:12]
    sw = (out / 'sw.js').read_text(encoding='utf8')
    import json
    sw = re.sub(r'/\*PRECACHE\*/.*?/\*END\*/', lambda m: '/*PRECACHE*/' + json.dumps(precache) + '/*END*/', sw, flags=re.S)
    sw = sw.replace("const VERSION = 'dev';", f"const VERSION = '{version}';")
    (out / 'sw.js').write_text(sw, encoding='utf8')
    log(f'Service worker version {version}, {len(precache)} precached entries.')
    print(site)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '_site')
