import sys,json,re,zipfile,hashlib
from pathlib import Path
from urllib.parse import urlparse,unquote
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
source=BeautifulSoup(Path('source-index.html').read_text(encoding='utf-8'),'html.parser')
manifest=json.loads(Path('source-evidence/assets-manifest.json').read_text(encoding='utf-8'))
categories=[]
for a in source.select('a.proList'):
 item=next(x for x in manifest if x['source_image']==a.img['src'])
 categories.append((a.get_text(' ',strip=True),a['href'],'images/'+unquote(Path(item['file']).name)))
contacts=[p.get_text(' ',strip=True) for p in source.find_all('p') if any(v in p.get_text() for v in ['Địa Chỉ:','Hotline:','Email:'])]
result={}
for letter in 'abc':
 root=Path('website-'+letter);base=root/letter;p=base/'index.html';s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 if letter=='c':
  for e,cat in zip(s.select('.cta-card-title'),categories[4:]):e.string=cat[0]
  for card in s.select('.portfolio-single,.services-single'):
   title=card.select_one('.portfolio-name,.services-card-name')
   cat=next((c for c in categories if title and title.get_text(' ',strip=True)==c[0]),None)
   if cat:
    im=card.select_one('.portfolio-image,.services-image')
    if im:im['src']=cat[2];im['alt']=cat[0]
    for a in card.find_all('a'):a['href']='https://huynhhoangminh.com/'+cat[1]
  e=s.select_one('.footer-information-text')
  if e:
   e.clear()
   for t in contacts:
    span=s.new_tag('span');span.string=t;e.append(span);e.append(s.new_tag('br'))
 for t in list(s.find_all(string=True)):
  if t.parent.name not in ['script','style'] and 'Copyright' in str(t):t.replace_with(str(t).replace('Copyright','').strip())
 for a in s.find_all('a'):
  cat=next((c for c in categories if a.get_text(' ',strip=True)==c[0]),None)
  if cat:a['href']='https://huynhhoangminh.com/'+cat[1]
 p.write_text(str(s),encoding='utf-8')
 missing=[]
 for e in s.find_all(True):
  for attr in ['href','src','data-src']:
   u=e.get(attr,'')
   if u and not u.startswith('#') and not urlparse(u).scheme and not (base/unquote(urlparse(u).path)).is_file():missing.append(u)
 for css in [*base.glob('css/*.css'),*base.glob('fonts/*.css')]:
  for u in re.findall(r'url\(["\']?([^\)"\']+)',css.read_text(encoding='utf-8')):
   if u.startswith(('data:','http:','https:','#')):continue
   if not (css.parent/unquote(urlparse(u).path)).is_file():missing.append(u)
 assert not missing,missing
 original=Path('input-extracted')/letter/letter
 assert all(j.read_bytes()==(original/'js'/j.name).read_bytes() for j in (base/'js').glob('*.js'))
 archive=Path('website-'+letter+'-final.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for f in sorted(base.rglob('*')):
   if f.is_file():z.write(f,f.relative_to(root).as_posix())
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None
  assert sum(x.endswith('.html') for x in z.namelist())==1
  assert all(z.read(n)==(root/n).read_bytes() for n in z.namelist())
 result[letter]={'zip':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'crc':'PASS','html_pages':1,'original_js_unchanged':True,'missing_references':missing,'entrypoint':letter+'/index.html'}
Path('qa/homepage-delivery-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
