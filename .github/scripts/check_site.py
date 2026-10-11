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
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

SITE = 'https://babatundeawo.github.io/career-engine-guide/'
NOT_INDEXED = {'404.html'}


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

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'title':
            self._in_title = True
        elif tag == 'base':
            self.base = a.get('href')
        elif tag == 'meta' and a.get('name'):
            self.meta[a['name']] = a.get('content', '')
        elif tag == 'h1':
            self.h1 += 1
        elif tag == 'link':
            if a.get('rel') == 'canonical':
                self.canonical = a.get('href')
            elif a.get('href'):
                self.links.append(('href', a['href']))
        elif tag == 'a' and a.get('href'):
            self.links.append(('href', a['href']))
        elif tag in ('script', 'img') and a.get('src'):
            self.links.append(('src', a['src']))
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

    for required in ('robots.txt', 'sitemap.xml', 'site.webmanifest', 'favicon.ico', '404.html'):
        if not (root / required).exists():
            errors.append(f'missing {required}')

    if errors:
        print('Site check FAILED:')
        for e in errors:
            print(f'  - {e}')
        return 1
    print(f'Site check passed: {len(pages)} pages, all links, anchors and metadata OK.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '_site'))
