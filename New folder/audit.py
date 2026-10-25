import sys,json,re,hashlib
from pathlib import Path
from urllib.parse import urlparse,unquote
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
results={}
for letter in 'abc':
 root=Path('website-'+letter);missing=[];anchors=[];demo=[];empty=[];counts={}
 for p in root.glob('*.html'):
  s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser');counts[p.name]={'images':len(s.find_all('img')),'links':len(s.find_all('a')),'text_chars':len(s.get_text(' ',strip=True))}
  for el in s.find_all(True):
   for attr in ['href','src']:
    u=el.get(attr,'')
    if not u or u.startswith(('http:','https:','mailto:','tel:','data:','javascript:')):continue
    parts=urlparse(u)
    if parts.path and not (p.parent/unquote(parts.path)).exists():missing.append([p.name,u])
    elif not parts.path and parts.fragment and not s.find(id=parts.fragment):anchors.append([p.name,u])
  text=s.get_text(' ',strip=True)
  if re.search(r'Manufex|Rewaste|ReWaste|Zenvira|Greeninterior|Lorem ipsum|Michael Anderson|Theodore Reilly|Ratings Points|555-8811|555-2486',text,re.I):demo.append(p.name)
  if p.name!='index.html':
   art=s.select_one('.verified-content')
   if not art or len(art.get_text(strip=True))<40:empty.append(p.name)
 for p in [*root.glob('css/*.css'),*root.glob('fonts/*.css')]:
  for u in re.findall(r'url\(["\']?([^\)"\']+)',p.read_text(encoding='utf-8')):
   if u.startswith(('data:','http:','https:','#')):continue
   if not (p.parent/unquote(u.split('?')[0].split('#')[0])).exists():missing.append([str(p.relative_to(root)),u])
 manifest=json.loads((root/'assets/SOURCE-MANIFEST.json').read_text(encoding='utf-8'));hashbad=[]
 for item in manifest:
  if item['ok']:
   p=root/'assets/official'/unquote(Path(item['file']).name)
   if hashlib.sha256(p.read_bytes()).hexdigest()!=item['sha256']:hashbad.append(str(p))
 results[letter]={'html_pages':len(counts),'missing_paths':missing,'missing_fragments':anchors,'demo_text_pages':demo,'near_empty_pages':empty,'official_files':sum(x['ok'] for x in manifest),'official_hash_errors':hashbad,'pages':counts}
Path('qa').mkdir(exist_ok=True)
Path('qa/static-audit.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
for k,v in results.items():print(k,json.dumps({x:y for x,y in v.items() if x!='pages'},ensure_ascii=False))
