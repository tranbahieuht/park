import sys,re,json,hashlib,zipfile,subprocess,concurrent.futures
from pathlib import Path
from urllib.parse import urlparse,unquote
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
norm=lambda x:re.sub(r'\s+',' ',str(x)).strip()
src=BeautifulSoup(Path('source-recheck.html').read_text(encoding='utf-8'),'html.parser')
assert src.title and 'HUỲNH HOÀNG MINH' in src.title.get_text()
source_text=norm(src.get_text(' ',strip=True))
manifest=json.loads(Path('source-evidence/assets-manifest.json').read_text(encoding='utf-8'))
cats={}
for a in src.select('a.proList'):
 m=next(m for m in manifest if m['source_image']==a.img['src'])
 cats[a.get_text(' ',strip=True)]={'image':'images/'+unquote(Path(m['file']).name),'href':'https://huynhhoangminh.com/'+a['href'],'sha256':m['sha256']}
home_records=[m for m in manifest if m['source_image'] in {i.get('src') for i in src.find_all('img')} and 'shutterstock' not in m['source_image'].lower()]
official_hashes={m['sha256'] for m in home_records}
results={};urls=set()
for letter in 'abc':
 base=Path('website-'+letter)/letter;file=base/'index.html';s=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser');changes=[]
 if letter=='b':
  s.select_one('.value-section .section-title').string='Sản phẩm thu mua'
  s.select_one('.service-3-section .pretitle-text').string='Huỳnh Hoàng Minh'
  s.select_one('.value-image')['src']='images/bg-phe-lieu-1784543808.jpg'
  for a in list(s.select('nav a')):
   if not a.get_text(strip=True) and not any('photo20260828' in i.get('src','') for i in a.find_all('img')):a.decompose()
  changes+=['Bỏ các mục menu rỗng','Sửa tiêu đề khối sản phẩm cho đúng nội dung','Dùng ảnh giới thiệu chung tại khối nhiều nhóm sản phẩm']
 if letter=='c':
  for a in s.select('.section.blog .secondary-button,.section.blog .button,.section.blog .blog-section-title-wrapper a'):a['href']='https://huynhhoangminh.com/san-pham'
  # Keep source operation paragraph separate from the product cards semantically.
  s.select_one('.services-section .section-title').string='Sản phẩm thu mua'
  for card in s.select('.design-stories-card-single'):
   desktop=card.select_one('img.desktop');mobile=card.select_one('img.mobile')
   if desktop and mobile:mobile['src']=desktop['src'];mobile['alt']=desktop.get('alt','')
  for selector,name in [('.blog-post-line','Blog-Line.png'),('.image-shape','Image-Shape.png')]:
   for im in s.select(selector):im['src']='images/'+name;im['alt']=''
  contact=s.select_one('.footer-information-text')
  for span in list(contact.find_all('span')):
   text=span.get_text(' ',strip=True)
   for value,href in [('0964 717 686','tel:0964717686'),('huynhhoangminh.corp@gmail.com','mailto:huynhhoangminh.corp@gmail.com')]:
    if value in text:
     span.clear();span.append(text.split(value)[0]);a=s.new_tag('a',href=href);a.string=value;span.append(a)
  changes+=['Sửa nút xem thêm tại khối sản phẩm về đúng danh mục','Đồng bộ ảnh desktop/mobile trong cùng thẻ','Khôi phục nét/shape trang trí gốc, không dùng ảnh sản phẩm làm nét trang trí','Thêm liên kết gọi điện và email tại footer']
 # Every product card must agree on its label, photo and destination.
 card_specs={'a':[('.single-service','.service-title-collection-title','.service-thumbnail'),('.single-case-study','.case-study-title','.case-study-thumbnail'),('.single-blog','.blog-title','.blog-thumbnail')],
 'b':[('.service-3-inner-content-block','.service-3-title','.service-3-image'),('.blog-content-box-inner','.blog-title','.blog-image')],
 'c':[('.featured-projects-card-single','.featured-projects-card-button-text','.featured-projects-image'),('.portfolio-single','.portfolio-name','.portfolio-image'),('.services-single','.services-card-name','.services-image'),('.blog-post-single','.blog-post-title','.blog-post-image'),('.cta-card','.cta-card-title','.cta-card-image')]}
 cards=[]
 for selector,title_sel,img_sel in card_specs[letter]:
  for card in s.select(selector):
   title=card.select_one(title_sel);im=card.select_one(img_sel)
   if not title or not im:continue
   name=title.get_text(' ',strip=True);assert name in cats,(letter,name)
   cat=cats[name];im['src']=cat['image'];im['alt']=name
   for a in card.find_all('a'):
    if 'Liên hệ' not in a.get_text(' ',strip=True):a['href']=cat['href']
   if card.name=='a':card['href']=cat['href']
   cards.append({'name':name,'image':im['src'],'image_matches_source':hashlib.sha256((base/im['src']).read_bytes()).hexdigest()==cat['sha256']})
 if letter=='c':
  # This button lies outside the individual product cards.
  for a in s.select('.section.blog a'):
   if 'Xem Chi Tiết' in a.get_text(' ',strip=True):a['href']='https://huynhhoangminh.com/san-pham'
 file.write_text(str(s),encoding='utf-8')
 missing=[];unverified=[];images=[]
 for e in s.find_all(True):
  for attr in ['src','href','data-src']:
   u=e.get(attr,'')
   if not u or u.startswith('#') or urlparse(u).scheme:continue
   if not (base/unquote(urlparse(u).path)).is_file():missing.append(u)
 for im in s.find_all('img'):
  u=im.get('src','')
  if not u or u.endswith('.svg'):continue
  if u in ['images/Blog-Line.png','images/Image-Shape.png']:continue
  digest=hashlib.sha256((base/u).read_bytes()).hexdigest();assert digest in official_hashes,(letter,u)
  images.append({'file':u,'sha256':digest,'official_homepage_asset':True})
 for t in s.find_all(string=True):
  if t.parent.name in ['script','style'] or not norm(t) or norm(t)=='html':continue
  n=norm(t)
  if n not in source_text and not all(norm(part) in source_text for part in n.split('·')):unverified.append(n)
 for a in s.find_all('a',href=True):
  if urlparse(a['href']).netloc=='huynhhoangminh.com':urls.add(a['href'])
 assert not missing,(letter,missing)
 assert not unverified,(letter,unverified)
 assert all(c['image_matches_source'] for c in cards)
 original=Path('input-extracted')/letter/letter
 assert all(j.read_bytes()==(original/'js'/j.name).read_bytes() for j in (base/'js').glob('*.js'))
 results[letter]={'changes':changes,'cards':cards,'image_references':images,'unverified_visible_text':unverified,'missing_references':missing,'original_javascript_unchanged':True}
def checkurl(u):
 r=subprocess.run(['curl.exe','-L','-sS','--max-time','25','-o','NUL','-w','%{http_code}',u],capture_output=True,text=True)
 return {'url':u,'status':r.stdout,'ok':r.returncode==0 and r.stdout=='200'}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:remote=list(pool.map(checkurl,sorted(urls)))
Path('qa/content-recheck.json').write_text(json.dumps({'templates':results,'source_links':remote},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'templates':{k:{'product_cards_verified':len(v['cards']),'unverified_visible_text':v['unverified_visible_text'],'missing_references':v['missing_references']} for k,v in results.items()},'source_links':remote},ensure_ascii=False,indent=2))
