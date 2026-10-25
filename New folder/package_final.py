import sys,json,re,zipfile,hashlib
from pathlib import Path
from urllib.parse import unquote,urlparse
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
summary={};analysis={}
for letter in 'abc':
 root=Path('website-'+letter);original=root/letter
 files=set(root.glob('*.html'))|set(root.glob('css/*'))|set(root.glob('js/*'))|set(root.glob('fonts/**/*'))|set(root.glob('lottie/**/*'))|set(root.glob('assets/**/*'))|{root/'README.md'}
 for p in list(files):
  if not p.is_file():continue
  if p.suffix=='.html':
   s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
   for el in s.find_all(True):
    for attr in ['src','href','data-src']:
     u=el.get(attr,'')
     if u and not urlparse(u).scheme and not u.startswith('#'):
      f=p.parent/unquote(urlparse(u).path)
      if f.is_file():files.add(f)
  elif p.suffix=='.css':
   for u in re.findall(r'url\(["\']?([^\)"\']+)',p.read_text(encoding='utf-8')):
    if u.startswith(('data:','http:','https:','#')):continue
    f=p.parent/unquote(u.split('?')[0].split('#')[0])
    if f.is_file():files.add(f)
 files={p.resolve() for p in files if p.is_file()}
 # Original stock/demo imagery is excluded; only referenced template UI assets are shipped.
 out=Path('website-'+letter+'-final.zip')
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in sorted(files):z.write(p,str(Path(root.name)/p.relative_to(root.resolve())).replace('\\','/'))
 with zipfile.ZipFile(out) as z:
  bad=z.testzip();entries=z.namelist()
  assert bad is None,bad
  assert sum(n.endswith('.html') for n in entries)==35
  assert all('/.git/' not in n and '/__MACOSX/' not in n and '/_backup/' not in n and '/_original/' not in n for n in entries)
  # Check every byte in the archive against the final workspace file.
  for n in entries:
   rel=Path(*n.split('/')[1:]);assert z.read(n)==(root/rel).read_bytes(),n
 summary[letter]={'zip':out.name,'bytes':out.stat().st_size,'files':len(entries),'html_pages':35,'testzip':'PASS','byte_comparison':'PASS','sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'entries':entries}
 items=[]
 for p in sorted(original.rglob('*')):
  if not p.is_file() or any(k.startswith('.') or k.startswith('_') for k in p.relative_to(original).parts) or p.name=='index.original.html' or p.name.endswith('.text.txt'):continue
  if p.suffix.lower() in ['.html','.css','.js','.json']:
   data=p.read_bytes();items.append({'file':str(p.relative_to(original)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 jsunchanged=all((root/'js'/p.name).read_bytes()==p.read_bytes() for p in (original/'js').glob('*.js'))
 analysis[letter]={'technology':'Static HTML / CSS / JavaScript (Webflow export)','original_code_inventory':items,'all_original_javascript_unchanged':jsunchanged,'packaged_ui_assets':[n for n in entries if '/images/' in n]}
Path('qa/package-verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
Path('qa/template-analysis.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2),encoding='utf-8')
for k,v in summary.items():print(k,{x:y for x,y in v.items() if x!='entries'})
