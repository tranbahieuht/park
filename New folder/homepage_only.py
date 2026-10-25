import sys,re,json,shutil,zipfile,hashlib
from pathlib import Path
from urllib.parse import urlparse,unquote
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup
W=Path.cwd().resolve();source=BeautifulSoup((W/'source-index.html').read_text(encoding='utf-8'),'html.parser')
norm=lambda x:re.sub(r'\s+',' ',str(x)).strip()
source_text=norm(source.get_text(' ',strip=True))
paras=[p.get_text(' ',strip=True) for p in source.find_all('p') if len(p.get_text())>150]
intro,process=paras[:2]
manifest=json.loads((W/'source-evidence/assets-manifest.json').read_text(encoding='utf-8'))
home_urls={i.get('src') for i in source.find_all('img') if 'shutterstock' not in i.get('src','').lower()}
home_assets={unquote(Path(a['file']).name):a for a in manifest if a['source_image'] in home_urls and a['ok']}
logo=next(n for n in home_assets if 'photo20260828' in n);hero=next(n for n in home_assets if 'thiet-ke-chua-co-ten-33-' in n);about=next(n for n in home_assets if 'bg-phe-lieu' in n)
cats=[a.get_text(' ',strip=True) for a in source.select('a.proList')]
cat_slugs=[a['href'] for a in source.select('a.proList')]
cat_images=[]
for a in source.select('a.proList'):
 item=next(x for x in manifest if x['source_image']==a.img['src']);cat_images.append(unquote(Path(item['file']).name))
stage=W/'homepage-only';stage.mkdir(exist_ok=True)
audit={}
for letter in 'abc':
 old=W/('website-'+letter);dest=stage/('website-'+letter)/letter;dest.mkdir(parents=True,exist_ok=True)
 original=W/'input-extracted'/letter/letter
 for folder in ['css','js','fonts','images','lottie','videos']:
  if (original/folder).exists():shutil.copytree(original/folder,dest/folder,dirs_exist_ok=True)
 for p in (old/'css').glob('*.css'):
  if p.name!='official.css':shutil.copy2(p,dest/'css'/p.name)
 s=BeautifulSoup((old/'index.html').read_text(encoding='utf-8'),'html.parser')
 def texts(selector,values):
  es=s.select(selector)
  if isinstance(values,str):values=[values]*len(es)
  for e,v in zip(es,values):e.clear();e.append(v)
 texts('.about-testimonial-content',[intro,process,intro])
 texts('.process-tab-content',[intro,process,' · '.join(cats),'0964 717 686 · huynhhoangminh.corp@gmail.com'])
 texts('.w-tab-link',['Giới thiệu','Quy trình hoạt động','Sản phẩm thu mua','Thông tin liên hệ'])
 texts('.value-text',cats[:4]);texts('.value-premium-text','Sản phẩm thu mua')
 texts('.marquee-text',(cats*5))
 texts('.services-card-name',cats[:4]);texts('.services-description','Sản phẩm thu mua')
 texts('.core-values .section-title','Sản phẩm thu mua')
 for e in s.select('.core-values h3,.core-values h4,.core-values p'):
  if e.name=='p':e.string='Sản phẩm thu mua'
  else:e.string=cats[0]
 texts('.cta-card-title',cats[:4])
 # The source homepage has no news cards: reuse the template card layout for verified products.
 texts('.blog-section .section-title,.section.blog .section-title','Sản phẩm thu mua')
 texts('.blog-section .label-text,.blog-section .pretitle-text','Huỳnh Hoàng Minh')
 for i,card in enumerate(s.select('.single-blog,.blog-content-box-inner,.blog-post-single')):
  j=i%8
  for e in card.select('.blog-title,.blog-post-title'):e.clear();e.append(cats[j])
  for e in card.select('.blog-date,.blog-text,.blog-post-description'):e.decompose()
  for im in card.find_all('img'):
   if not im.get('src','').endswith('.svg'):im['src']='images/'+cat_images[j];im['alt']=cats[j]
  if card.name=='a':card['href']='https://huynhhoangminh.com/'+cat_slugs[j]
  for a in card.find_all('a'):a['href']='https://huynhhoangminh.com/'+cat_slugs[j]
 replacements={'Kiến tạo giá trị từ tài nguyên tái chế':'HUỲNH HOÀNG MINH','Kiến tạo giá trị':'HUỲNH HOÀNG MINH','từ tài nguyên tái chế':'','Giá trị chúng tôi theo đuổi':'Giới thiệu về','Minh bạch':'Đồng','Hiệu quả':'Nhôm','Tái chế bền vững':'Cáp Điện','Quy trình rõ ràng, định giá hợp lý':'Sản phẩm thu mua','Tối ưu chi phí cho khách hàng và đối tác':'Sản phẩm thu mua','Tối ưu nguồn tài nguyên và giảm lãng phí':'Sản phẩm thu mua','Hướng đến một hệ sinh thái sản xuất có trách nhiệm, nơi nguồn nguyên liệu được tái sử dụng nhiều lần.':process}
 for t in list(s.find_all(string=True)):
  if t.parent.name in ['script','style']:continue
  n=norm(t)
  if n in replacements:t.replace_with(replacements[n])
 audit[letter]=[]
 for t in list(s.find_all(string=True)):
  if t.parent.name in ['script','style'] or not norm(t) or norm(t)=='html':continue
  n=norm(t)
  if n not in source_text and n not in [' · '.join(cats),'0964 717 686 · huynhhoangminh.corp@gmail.com']:
   audit[letter].append(n)
   if len(n)>100:t.replace_with(process)
   else:t.replace_with('')
 for a in s.find_all('a',href=True):
  u=a['href']
  if u.endswith('.html'):
   slug=Path(u).stem;a['href']='index.html' if slug=='index' else 'https://huynhhoangminh.com/'+slug
 for im in s.find_all('img'):
  u=im.get('src','')
  if u.startswith('assets/official/'):
   name=unquote(Path(u).name)
   im['src']='images/'+(name if name in home_assets else about)
 for e in s.find_all(True):
  for attr in ['style','content','href','src']:
   if e.has_attr(attr):e[attr]=e[attr].replace('assets/official/','images/')
 # Fold the small compatibility styles into the existing stylesheet.
 for l in s.select('link[href="css/official.css"]'):l.decompose()
 css_main=next(p for p in (dest/'css').glob('*.css') if p.name not in ['fonts.css'])
 css_main.write_text(css_main.read_text(encoding='utf-8')+'\n'+(old/'css/official.css').read_text(encoding='utf-8'),encoding='utf-8')
 for p in (dest/'css').glob('*.css'):
  text=p.read_text(encoding='utf-8').replace('../assets/official/','../images/')
  p.write_text(text,encoding='utf-8')
 for name,item in home_assets.items():shutil.copy2(W/item['file'],dest/'images'/name)
 (dest/'index.html').write_text(str(s),encoding='utf-8')
 # Verify all references before replacing the final delivery folders.
 for e in s.find_all(True):
  for attr in ['src','href','data-src']:
   u=e.get(attr,'')
   if not u or u.startswith('#') or urlparse(u).scheme:continue
   assert (dest/unquote(urlparse(u).path)).is_file(),(letter,u)
 previous=W/'qa'/'previous-full'/('website-'+letter);previous.parent.mkdir(exist_ok=True)
 assert old.is_relative_to(W) and previous.is_relative_to(W)
 shutil.move(str(old),str(previous));shutil.move(str(dest.parent),str(old))
 archive=W/('website-'+letter+'-final.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in sorted((old/letter).rglob('*')):
   if p.is_file():z.write(p,p.relative_to(old).as_posix())
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None
  assert sum(n.endswith('.html') for n in z.namelist())==1
  assert all(z.read(n)==(old/n).read_bytes() for n in z.namelist())
 print(letter,archive.stat().st_size,'ZIP verified; one homepage; original folder',letter)
(W/'qa/homepage-only-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
