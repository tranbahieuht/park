exec(open('fetch_source.py',encoding='utf-8').read().split('slugs=')[0])
import re,hashlib
assets=dest/'assets';assets.mkdir(exist_ok=True)
urls=set()
for p in dest.glob('*.html'):
 s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 for img in s.find_all('img'):
  u=urljoin(base,img.get('src',''))
  if '/upload/' in u and 'shutterstock' not in u.lower(): urls.add(u)
def asset(u):
 original=base+'upload/'+u.split('/upload/',1)[1]
 if '/thumbs/' in u and original.endswith('.webp'):original=original[:-5]
 filename=Path(urlparse(original).path).name
 path=assets/filename
 r=get(original,path)
 if not r['ok']:
  filename=Path(urlparse(u).path).name;path=assets/filename;r=get(u,path)
 r['source_image']=u;r['sha256']=hashlib.sha256(path.read_bytes()).hexdigest() if r['ok'] else None
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex: results=list(ex.map(asset,sorted(urls)))
(dest/'assets-manifest.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
