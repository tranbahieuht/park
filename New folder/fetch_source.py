import sys,json,subprocess,concurrent.futures
from pathlib import Path
from urllib.parse import urljoin,urlparse
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
base='https://huynhhoangminh.com/'
dest=Path('source-evidence');dest.mkdir(exist_ok=True)
def get(url,path):
 r=subprocess.run(['curl.exe','-f','-L','--retry','1','--max-time','35','-sS','-o',str(path),'-w','%{http_code}',url],capture_output=True,text=True)
 return {'url':url,'file':str(path),'code':r.stdout,'ok':r.returncode==0,'error':r.stderr}
slugs=['gioi-thieu','hoat-dong','san-pham','lien-he','dong','hop-kim-dong','nhom','thep-khong-gi','cap-dien','chi','kem','khac','tin-tuc','gia-thi-truong']
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex: results=list(ex.map(lambda slug:get(base+slug,dest/(slug+'.html')),slugs))
(dest/'index.html').write_bytes(Path('source-index.html').read_bytes())
for p in dest.glob('*.html'):
 s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 (dest/(p.stem+'.txt')).write_text(s.get_text('\n',strip=True),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
(dest/'requests.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
