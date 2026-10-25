import sys,json,zipfile,hashlib
from pathlib import Path
from urllib.parse import urlparse,unquote
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
out=Path('qa/zip-check');out.mkdir(exist_ok=True)
result={}
for letter in 'abc':
 archive=Path('website-'+letter+'-final.zip');problems=[]
 with zipfile.ZipFile(archive) as z:
  names=set(z.namelist());assert z.testzip() is None
  for name in names:
   target=(out/name).resolve();assert target.is_relative_to(out.resolve())
  z.extractall(out)
  for name in names:
   if not name.endswith('.html'):continue
   s=BeautifulSoup(z.read(name),'html.parser')
   for e in s.find_all(True):
    for key in ['src','href','data-src']:
     u=e.get(key,'')
     if not u or u.startswith('#') or urlparse(u).scheme:continue
     ref=(Path(name).parent/unquote(urlparse(u).path)).as_posix()
     if ref not in names:problems.append([name,key,u])
   for img in s.find_all('img'):
    u=img.get('src','')
    if not u.startswith('assets/official/') and not u.endswith('.svg'):problems.append([name,'nonofficial-raster',u])
  for name in names:
   assert z.read(name)==Path(name).read_bytes(),name
 result[letter]={'zip_integrity':'PASS','all_packaged_bytes_equal_final_directory':True,'missing_packaged_references':problems,'html_pages':sum(x.endswith('.html') for x in names),'official_image_files':sum('/assets/official/' in x for x in names),'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
Path('qa/delivery-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
