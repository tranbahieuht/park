import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
for p in [Path('source-index.html'),*Path('.').glob('website-?/?/index.html')]:
 s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 out=[]
 for x in s.find_all(string=True):
  if x.parent.name not in ['script','style'] and x.strip(): out.append(f'{x.parent.name}.{x.parent.get("class",[])}: {x.strip()}')
 Path(str(p)+'.text.txt').write_text('\n'.join(out),encoding='utf-8')
 print('\nFILE',p,'\n',s.get_text(' ',strip=True)[:21000])
 print('LINKS',json.dumps([(a.get_text(' ',strip=True)[:80],a.get('href')) for a in s.find_all('a')],ensure_ascii=False))
 print('IMAGES',json.dumps([(a.get('src'),a.get('alt')) for a in s.find_all('img')],ensure_ascii=False))
