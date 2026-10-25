"""Clone CDN assets of a Webflow export locally and strip Webflow branding.

usage: python3 -I clone.py <project_dir> <scratch_dl_dir>
"""
import concurrent.futures
import os
import re
import shutil
import sys
import urllib.parse
import urllib.request

ROOT, DL = sys.argv[1], sys.argv[2]
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/130.0 Safari/537.36')

IMG_EXT = {'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'bmp'}
VID_EXT = {'mp4', 'webm', 'ogg', 'mov'}
FONT_EXT = {'woff', 'woff2', 'ttf', 'otf', 'eot'}

CDN_RE = re.compile(
    r'https?://(?:cdn\.prod\.website-files\.com|assets-global\.website-files\.com'
    r'|d3e54v103j8qbb\.cloudfront\.net)/[^\s"\'<>(),]+')
CDN_ENC_RE = re.compile(
    r'https%3A%2F%2F(?:cdn\.prod\.website-files\.com|d3e54v103j8qbb\.cloudfront\.net)'
    r'%2F[A-Za-z0-9._~%-]+?(?=%22)')

SITE_CSS = 'https://cdn.prod.website-files.com/68a6c5a6121a6179e1346ed1/css/'
SITE_JS = 'https://cdn.prod.website-files.com/68a6c5a6121a6179e1346ed1/js/'

# Fixed, brand-neutral names for the core files.
FIXED = {
    SITE_CSS + 'rewaste-ttm.webflow.shared.6a93c43d4.min.css': 'css/rewaste.shared.min.css',
    SITE_CSS + 'rewaste-ttm.webflow.68a6c5a7121a6179e1346ef0-0df754fcd.min.css': 'css/rewaste.home.min.css',
    SITE_JS + 'webflow.828808ef.03df0094e7d27f4e.js': 'js/site.js',
    'https://cdn.prod.website-files.com/gsap/3.15.0/gsap.min.js': 'js/gsap.min.js',
    'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68a6c5a6121a6179e1346ed1':
        'js/jquery-3.5.1.min.js',
}

mapping = {}  # url -> local relative path (from project root)
used = {}


def local_path(url):
    if url in mapping:
        return mapping[url]
    if url in FIXED:
        rel = FIXED[url]
    else:
        path = urllib.parse.urlsplit(url).path
        base = urllib.parse.unquote(path.rsplit('/', 1)[-1])
        base = re.sub(r'[^A-Za-z0-9._-]+', '-', base).strip('-')
        ext = base.rsplit('.', 1)[-1].lower()
        folder = ('images' if ext in IMG_EXT else 'videos' if ext in VID_EXT else
                  'fonts' if ext in FONT_EXT else ext if ext in ('css', 'js') else 'files')
        rel = f'{folder}/{base}'
        stem, dot, ext2 = rel.rpartition('.')
        n = 1
        while rel in used and used[rel] != url:
            n += 1
            rel = f'{stem}-{n}.{ext2}'
    used[rel] = url
    mapping[url] = rel
    return rel


def fetch(url, dest):
    dest = os.path.join(ROOT, dest)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return url, 'cached'
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    with open(dest, 'wb') as f:
        f.write(data)
    return url, len(data)


def download_all(urls):
    errors = []
    with concurrent.futures.ThreadPoolExecutor(12) as ex:
        futs = {ex.submit(fetch, u, local_path(u)): u for u in urls}
        for fut in concurrent.futures.as_completed(futs):
            try:
                fut.result()
            except Exception as e:  # noqa: BLE001
                errors.append((futs[fut], repr(e)))
    return errors


def must_sub(pattern, repl, text, label, count=0, flags=0):
    new, n = re.subn(pattern, repl, text, count=count, flags=flags)
    if n == 0:
        raise SystemExit(f'pattern not found: {label}')
    print(f'  [{n}x] {label}')
    return new


# ---------------------------------------------------------------- fonts
def build_fonts():
    css_url = ('https://fonts.googleapis.com/css2?family=Inter+Tight:'
               'wght@300;400;500;600;700;800&display=swap')
    req = urllib.request.Request(css_url, headers={'User-Agent': UA})
    css = urllib.request.urlopen(req, timeout=60).read().decode()
    blocks = re.findall(r'/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]*)\}', css)
    by_subset = {}
    for subset, body in blocks:
        url = re.search(r'url\((https://[^)]+)\)', body).group(1)
        weight = re.search(r'font-weight:\s*(\d+)', body).group(1)
        rng = re.search(r'unicode-range:\s*([^;]+);', body).group(1)
        by_subset.setdefault(subset, {'urls': {}, 'range': rng})['urls'][weight] = url
    out = ['/* Inter Tight (self-hosted, SIL Open Font License) */']
    for subset, info in by_subset.items():
        urls = info['urls']
        weights = sorted(urls, key=int)
        groups = ([(f'{weights[0]} {weights[-1]}', urls[weights[0]])]
                  if len(set(urls.values())) == 1 else [(w, urls[w]) for w in weights])
        for weight, url in groups:
            suffix = '' if ' ' in weight else f'-{weight}'
            rel = f'fonts/inter-tight-{subset}{suffix}.woff2'
            mapping[url] = rel
            used[rel] = url
            fetch(url, rel)
            out.append('@font-face {\n'
                       "  font-family: 'Inter Tight';\n  font-style: normal;\n"
                       f'  font-weight: {weight};\n  font-display: swap;\n'
                       f"  src: url(../{rel}) format('woff2');\n"
                       f'  unicode-range: {info["range"]};\n}}')
    with open(os.path.join(ROOT, 'css/fonts.css'), 'w') as f:
        f.write('\n'.join(out) + '\n')
    print(f'  fonts.css: {len(out) - 1} @font-face, subsets={list(by_subset)}')


# ---------------------------------------------------------------- main
def main():
    html_path = os.path.join(ROOT, 'index.html')
    backup = os.path.join(ROOT, '_backup', 'index.original.html')
    os.makedirs(os.path.dirname(backup), exist_ok=True)
    if not os.path.exists(backup):
        shutil.copy2(html_path, backup)
    html = open(backup, encoding='utf-8').read()

    print('== branding / CDN head cleanup')
    html = must_sub(r'<!-- This site was created in Webflow\. https://webflow\.com -->', '', html, 'webflow comment')
    html = must_sub(r'<!-- Last Published:[^>]*-->', '', html, 'last published comment')
    html = must_sub(r'\s*data-wf-domain="[^"]*"', '', html, 'data-wf-domain')
    html = must_sub(r'Rewaste-Webflow Ecommerce website template', 'Rewaste - Ecommerce website template',
                    html, 'title / og / twitter')
    html = must_sub(r'\n\s*<meta content="Webflow" name="generator" />', '', html, 'generator meta')
    # Search Console token belongs to the template author's demo site.
    html = must_sub(r'\n\s*<meta[^>]*name="google-site-verification"[^>]*/>', '', html, 'site verification meta')
    html = must_sub(r'\n\s*<link href="https://(?:cdn\.prod\.website-files\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)"'
                    r' rel="preconnect"[^>]*/>', '', html, 'preconnect links')
    html = must_sub(r'<script src="https://ajax\.googleapis\.com/ajax/libs/webfont/[^"]*" type="text/javascript"></script>'
                    r'\s*<script\s+type="text/javascript">WebFont\.load\([^<]*</script>',
                    '<link href="css/fonts.css" rel="stylesheet" type="text/css" />', html, 'webfont loader -> fonts.css')

    print('== footer / badge')
    html = must_sub(r'<a\s+href="https://webflow\.com/templates/designers/themetechmount" class="copyright-link">',
                    '<a href="https://themetechmount.com/" target="_blank" class="copyright-link">', html, 'designer link')
    html = must_sub(r'\s*-\s*powered by\s*<a\s+href="https://webflow\.com/"\s+class="copyright-link">Webflow</a>',
                    '', html, 'powered by Webflow')
    html = must_sub(r'https://rewaste-ttm\.webflow\.io/404', '/404', html, '404 link')
    html = must_sub(r'\n\s*<div class="template-badge">.*?</a></div>', '', html, 'template promo badge', flags=re.S)
    # Webflow's Turnstile key: only valid for Webflow-hosted form submissions.
    html = must_sub(r'\s+data-turnstile-sitekey="[^"]*"', '', html, 'turnstile sitekey')

    print('== collect assets')
    css_urls = [u for u in FIXED if u.endswith('.css')]
    html_urls = sorted(set(CDN_RE.findall(html)))
    enc_urls = sorted(set(CDN_ENC_RE.findall(html)))
    for u in html_urls + [urllib.parse.unquote(e) for e in enc_urls]:
        local_path(u)

    # Core CSS/JS already fetched into the scratch dir: copy, then rewrite.
    for url, rel in FIXED.items():
        src = os.path.join(DL, os.path.basename(urllib.parse.urlsplit(url).path))
        os.makedirs(os.path.join(ROOT, os.path.dirname(rel)), exist_ok=True)
        shutil.copyfile(src, os.path.join(ROOT, rel))
        mapping[url] = rel
        used[rel] = url

    css_assets = set()
    for url in css_urls:
        p = os.path.join(ROOT, FIXED[url])
        css_assets |= set(CDN_RE.findall(open(p, encoding='utf-8').read()))
    for u in css_assets:
        local_path(u)

    chunk_dir = os.path.join(DL, 'chunks')
    chunk_assets = {'https://d3e54v103j8qbb.cloudfront.net/img/image-placeholder.svg'}
    for u in chunk_assets:
        local_path(u)

    todo = [u for u in mapping if mapping[u] not in FIXED.values()]
    print(f'  {len(html_urls)} html urls, {len(enc_urls)} encoded, {len(css_assets)} css urls, '
          f'{len(chunk_assets)} js urls -> downloading {len(todo)}')
    errors = download_all(todo)
    for e in errors:
        print('  ERROR', *e)

    print('== fonts')
    build_fonts()

    print('== rewrite CSS')
    for url in css_urls:
        p = os.path.join(ROOT, FIXED[url])
        css = open(p, encoding='utf-8').read()
        css = CDN_RE.sub(lambda m: '../' + mapping[m.group(0)], css)
        css = css.replace('webflow-icons', 'site-icons')
        open(p, 'w', encoding='utf-8').write(css)

    print('== JS chunks')
    loader = os.path.join(ROOT, 'js/site.js')
    js = open(loader, encoding='utf-8').read()
    js = must_sub(r'"webflow\.achunk\."', '"site.chunk."', js, 'chunk filename prefix')
    open(loader, 'w', encoding='utf-8').write(js)
    for name in sorted(os.listdir(chunk_dir)):
        if not name.endswith('.js'):
            continue
        code = open(os.path.join(chunk_dir, name), encoding='utf-8').read()
        if '.define("brand"' in code:
            # Neutralise the "Made in Webflow" badge module but keep it registered.
            code = ('"use strict";(self.webpackChunk=self.webpackChunk||[]).push([["456"],{9461:function(e,t,n){'
                    'var a=n(43949);a.define("brand",e.exports=function(e){var n={};return n.ready=function(){'
                    'e("body").children(".w-webflow-badge").remove()},n})}}]);')
            print(f'  {name}: brand module neutralised')
        for u in chunk_assets:
            code = code.replace(u, '/' + mapping[u])
        out = name.replace('webflow.achunk.', 'site.chunk.')
        open(os.path.join(ROOT, 'js', out), 'w', encoding='utf-8').write(code)

    print('== rewrite HTML')
    html = CDN_RE.sub(lambda m: mapping[m.group(0)], html)
    html = CDN_ENC_RE.sub(lambda m: urllib.parse.quote(mapping[urllib.parse.unquote(m.group(0))], safe=''), html)
    # Local files: SRI hashes / CORS attrs no longer apply.
    html = re.sub(r'\s+integrity="[^"]*"', '', html)
    html = re.sub(r'(<(?:script|link)\b[^>]*?)\s+crossorigin="anonymous"', r'\1', html)
    open(html_path, 'w', encoding='utf-8').write(html)

    left = CDN_RE.findall(html) + re.findall(r'https?://[^"\s]*(?:googleapis|gstatic)[^"\s]*', html)
    print('  remaining CDN urls in HTML:', left)
    print('  total local assets:', len(set(mapping.values())))
    if errors:
        sys.exit(1)


main()
