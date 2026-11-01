#!/usr/bin/env python3
"""Checks the built site before it is published.

Fails (exit 1) on problems that would break the site:
  * a page that is missing its title, description, canonical URL or <h1>
  * duplicate titles
  * a broken internal link, image, script, stylesheet or in-page anchor
  * an image without alt text
  * a page missing from sitemap.xml
Everything else is left to the Lighthouse report.

Usage: python3 .github/scripts/check_site.py _site
"""
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

SITE = os.environ.get('SITE_URL', 'https://babatundeawo.github.io/career-engine-guide/')
NOT_INDEXED = {'404.html', 'offline.html'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self._in_title = False
        self.meta = {}
        self.canonical = None
        self.h1 = 0
        self.ids = set()
        self.links = []      # (attribute, value)
        self.imgs_without_alt = 0
        self.base = None
        self.csp = None
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'title':
            self._in_title = True
        elif tag == 'base':
            self.base = a.get('href')
        elif tag == 'meta' and a.get('http-equiv') == 'Content-Security-Policy':
            self.csp = a.get('content', '')
        elif tag == 'meta' and a.get('name'):
            self.meta[a['name']] = a.get('content', '')
        elif tag == 'h1':
            self.h1 += 1
        elif tag == 'link':
            if a.get('rel') == 'canonical':
                self.canonical = a.get('href')
            elif a.get('href') and a.get('rel') == 'preload':
                pass  # font preloads are checked separately: missing fonts only warn
            elif a.get('href'):
                self.links.append(('href', a['href']))
        elif tag == 'a' and a.get('href'):
            self.links.append(('href', a['href']))
        elif tag in ('script', 'img') and a.get('src'):
            self.links.append(('src', a['src']))
            if tag == 'script':
                self.scripts.append(a['src'])
            if tag == 'img' and 'alt' not in a:
                self.imgs_without_alt += 1
        elif tag == 'use' and a.get('href'):
            self.links.append(('href', a['href']))

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def main(root_arg):
    root = Path(root_arg)
    errors = []
    pages = {}
    for f in sorted(root.glob('*.html')):
        p = Page()
        p.feed(f.read_text(encoding='utf8'))
        pages[f.name] = p

    titles = {}
    sitemap = (root / 'sitemap.xml').read_text(encoding='utf8')
    for name, p in pages.items():
        if not p.title.strip():
            errors.append(f'{name}: missing <title>')
        titles.setdefault(p.title.strip(), []).append(name)
        if not p.meta.get('description', '').strip():
            errors.append(f'{name}: missing meta description')
        if not p.canonical:
            errors.append(f'{name}: missing canonical link')
        if p.h1 != 1:
            errors.append(f'{name}: expected exactly one <h1>, found {p.h1}')
        if not p.csp:
            errors.append(f'{name}: missing Content-Security-Policy meta tag')
        elif 'googleapis' in p.csp or 'gstatic' in p.csp:
            errors.append(f'{name}: CSP still allows Google Fonts (fonts must be self-hosted)')
        if name not in NOT_INDEXED and 'js/pwa.js' not in p.scripts:
            errors.append(f'{name}: js/pwa.js is not loaded')
        if p.imgs_without_alt:
            errors.append(f'{name}: {p.imgs_without_alt} image(s) without an alt attribute')
        if name not in NOT_INDEXED:
            url = SITE if name == 'index.html' else SITE + name
            if f'<loc>{url}</loc>' not in sitemap:
                errors.append(f'{name}: not listed in sitemap.xml')

        for attr, value in p.links:
            if re.match(r'^(https?:|mailto:|tel:|data:|javascript:)', value):
                continue
            parsed = urlparse(value)
            path, frag = unquote(parsed.path), parsed.fragment
            if p.base and path.startswith('/'):
                path = path[len(urlparse(p.base).path):]
            if path in ('', '.'):
                target_name, target = name, pages.get(name)
            else:
                target_file = root / path
                if not target_file.exists():
                    errors.append(f'{name}: broken {attr} -> {value}')
                    continue
                target_name = target_file.name
                target = pages.get(target_name)
            if frag and target is not None and frag not in target.ids and not frag.startswith(':~:'):
                errors.append(f'{name}: missing anchor #{frag} in {target_name}')
            elif frag and target is None and path.endswith('.svg'):
                if f'id="{frag}"' not in (root / path).read_text(encoding='utf8'):
                    errors.append(f'{name}: missing icon #{frag} in {path}')

    for title, names in titles.items():
        if len(names) > 1:
            errors.append(f'duplicate title "{title}" on: {", ".join(names)}')

    for required in ("robots.txt", "sitemap.xml", "site.webmanifest", "favicon.ico", "404.html"):
        if not (root / required).exists():
            errors.append(f'missing {required}')

    warnings = []
    for page in root.glob('*.html'):
        if re.search(r'fonts\.(googleapis|gstatic)\.com', page.read_text(encoding='utf8')):
            errors.append(f'{page.name}: still references Google Fonts')

    # Web app manifest: every referenced file must exist.
    try:
        manifest = json.loads((root / 'site.webmanifest').read_text(encoding='utf8'))
        refs = [i['src'] for i in manifest.get('icons', [])] + [s['src'] for s in manifest.get('screenshots', [])]
        for sc in manifest.get('shortcuts', []):
            refs += [i['src'] for i in sc.get('icons', [])]
            if not (root / sc['url'].lstrip('./').split('#')[0].split('?')[0]).exists():
                errors.append(f'manifest shortcut points to a missing page: {sc["url"]}')
        for ref in refs:
            if not (root / ref).exists():
                errors.append(f'manifest references a missing file: {ref}')
        for key in ('name', 'short_name', 'id', 'start_url', 'scope', 'display', 'theme_color', 'background_color'):
            if not manifest.get(key):
                errors.append(f'manifest is missing "{key}"')
        sizes = {i.get('sizes') for i in manifest.get('icons', []) if i.get('purpose', 'any') == 'any'}
        if not {'192x192', '512x512'} <= sizes:
            errors.append('manifest needs 192x192 and 512x512 icons')
        if not any('maskable' in i.get('purpose', '') for i in manifest.get('icons', [])):
            errors.append('manifest needs a maskable icon')
    except (OSError, ValueError) as exc:
        errors.append(f'site.webmanifest is not valid JSON: {exc}')

    # Service worker: version stamped, every precached file exists, offline page present.
    sw_path = root / 'sw.js'
    if not sw_path.exists():
        errors.append('missing sw.js')
    else:
        sw = sw_path.read_text(encoding='utf8')
        m = re.search(r'/\*PRECACHE\*/(.*?)/\*END\*/', sw, re.S)
        if "const VERSION = 'dev'" in sw or not m:
            errors.append('sw.js was not stamped by build.py')
        else:
            for entry in json.loads(m.group(1)):
                if entry != './' and not (root / entry).exists():
                    errors.append(f'sw.js precaches a missing file: {entry}')
    if not (root / 'offline.html').exists():
        errors.append('missing offline.html')

    for font in ('bricolage-grotesque-latin-wght-normal.woff2', 'inter-latin-wght-normal.woff2', 'instrument-serif-latin-400-italic.woff2'):
        if not (root / 'fonts' / font).exists():
            warnings.append(f'font file missing, system fonts will be used: fonts/{font}')

    for w in warnings:
        print(f'Warning: {w}')
    if errors:
        print('Site check FAILED:')
        for e in errors:
            print(f'  - {e}')
        return 1
    print(f'Site check passed: {len(pages)} pages, all links, anchors and metadata OK.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '_site'))
