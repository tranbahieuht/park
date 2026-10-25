import sys,re,json,shutil,copy,hashlib
from pathlib import Path
from urllib.parse import urlparse,urljoin,unquote
sys.path.insert(0,str(Path('tools-lib').resolve()))
from bs4 import BeautifulSoup,Comment
ROOT=Path.cwd(); EV=ROOT/'source-evidence'
def soup(p):return BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
SRC={p.stem:soup(p) for p in EV.glob('*.html')}
HOME=SRC['index']; COMPANY='CÔNG TY TNHH HUỲNH HOÀNG MINH'; SHORT='Huỳnh Hoàng Minh'
EMAIL='huynhhoangminh.corp@gmail.com';PHONE='0964 717 686';ADDRESS='213A/2, đường Nguyễn Văn Tiên, khu phố 11A, Phường Tân Triều, TP Đồng Nai'
INTRO=HOME.select_one('.about-desc')
paragraphs=[p.get_text(' ',strip=True) for p in HOME.find_all('p') if len(p.get_text())>150]
INTRO=paragraphs[0]; PROCESS=paragraphs[1]
assets=json.loads((EV/'assets-manifest.json').read_text(encoding='utf-8'))
AM={a['source_image']:'assets/official/'+unquote(Path(a['file']).name) for a in assets if a['ok']}
def asset(key):return next(v for u,v in AM.items() if key in u)
LOGO=asset('photo20260828');HERO=asset('thiet-ke-chua-co-ten-33-');ABOUT=asset('bg-phe-lieu')
categories=[(a.select_one('h3').get_text(' ',strip=True),a.get('href'),AM[a.img['src']]) for a in HOME.select('a.proList')]
news=[]
for h in SRC['tin-tuc'].select('.news-name'):
 a=h.find_parent('a'); box=a.parent
 news.append((h.get_text(' ',strip=True),a['href'] if a else '',AM.get(a.img['src'],ABOUT) if a and a.img else ABOUT))
services=['Thu mua phế liệu đồng','Phân loại phế liệu','Thu hồi & tái chế','Cung cấp nguyên liệu tái chế']
service_desc=['Thu mua phế liệu đồng từ nhà máy, khu công nghiệp và doanh nghiệp.','Phân loại phế liệu đồng theo tiêu chuẩn chất lượng, đảm bảo tối ưu giá trị nguyên liệu.','Thu hồi và tái chế đồng bằng quy trình chuyên nghiệp, an toàn và hiệu quả.','Cung cấp nguồn nguyên liệu đồng tái chế phục vụ nhu cầu sản xuất của doanh nghiệp.']
norm=lambda t:re.sub(r'\s+',' ',str(t)).strip()
M={}
def mapping(keys,val):
 for k in keys.split('|'):M[norm(k)]=val
mapping('All Pages|Pages|Main Pages|Main pages|Company|Quick links|Liên kết','Liên kết')
mapping('Company','Giới thiệu')
mapping('Homepage|Home|Home 1|Home 2','Trang chủ')
mapping('About|About Us|About us|Production System|About ReWaste','Giới thiệu')
mapping('Services|Service|Solutions|Our Services|Recycling Guide|Recycling guide|How It Works','Quy trình hoạt động')
mapping('Case Studies|Case studies|Project|Projects|Shop|Our Featured Projects|Our Waste Management Services','Sản phẩm thu mua')
mapping('Blog|Blogs|Insights|Latest Insights|Latest News|Manufacturing insights that drive innovation|Insights on sustainable living|Discover our premium property selection','Tin tức')
mapping('Contact|Contact Us|Contact us|Book A Call|Request A Quote|Get a Quote|Get in touch|Schedule a Pickup','Liên hệ')
mapping('Read more|See More|See All Projects|Explore Services','Xem Chi Tiết')
mapping('Contact Information|Contact info','Thông tin liên hệ')
mapping('Menu','Liên kết')
mapping('Sustainable systems for a cleaner tomorrow|Modern Industrial Manufacturing|Interior Design Agency','HUỲNH HOÀNG MINH')
mapping('Solutions for a CleanerTomorrow|THE HoME DESIGN YoU ALWAYS IMAGINE|Precision manufacturing starts with innovation','Kiến tạo giá trị từ tài nguyên tái chế')
mapping('Discuss your production requirements today|Ready for your next manufacturing project?','Liên hệ với chúng tôi qua điện thoại')
mapping('Efficient manufacturing from start to finish|Manufacturing excellence in every single project|Smarter features for a cleaner future|Transforming Spaces, Elevating Experiences','Quy trình hoạt động')
mapping('Get Started Today','Huỳnh Hoàng Minh')
mapping('Stay updated with our latest insights and innovations.|Stay informed, stay green','Đăng ký nhận tin')
mapping('Subscribe to get the latest manufacturing updates, industry news, and expert insights.|Subscribe to get recycling tips, sustainability news, and Rewaste updates — straight to your inbox.','Để lại thông tin của bạn - Chúng tôi sẽ gửi bảng báo giá mới nhất')
mapping('2450 Industrial Parkway, Chicago, IL 60601|2912 Meadowbrook Road, Los Angeles, CA 90017',ADDRESS)
mapping('(800) 555-2486|+1 (212) 555-8811|+(510) 895-6500',PHONE)
mapping('info@manufex.com|support@rewaste.com|example@gmail.com',EMAIL)
mapping('© 2026 Manufex. All Rights Reserved.|Copyright @ 2025 Rewaste designed by|Copyright © 2025','Copyright © 2026 Công ty TNHH Huỳnh Hoàng Minh')
mapping('Zenvira|ThemetechMount|Manufex','Công ty TNHH Huỳnh Hoàng Minh')
mapping('Empowering cities, homes, and industries with eco-efficient waste solutions that reduce pollution, cut emissions, and promote a greener tomorrow.|Tasteful artwork lined the walls, infusing the room with a quiet elegance and a warm, lived-in charm.|The room was accented with tasteful artwork adorning the walls, creating a harmonious blend of elegance and homeliness.|Manufex provides precision manufacturing, custom fabrication.|Discover the future of Interior production with Zenvira. Effortlessly create, edit, and perfect your tracks.',INTRO)
mapping('What we believe in','Giá trị chúng tôi theo đuổi')
mapping('Craftsmanship','Minh bạch');mapping('Collaboration','Hiệu quả');mapping('Sustainability','Tái chế bền vững')
mapping('Every detail reflects quality, precision, and creativity, shaping interiors built to last.','Quy trình rõ ràng, định giá hợp lý')
mapping('We design through dialogue, turning ideas into meaningful spatial experiences.','Tối ưu chi phí cho khách hàng và đối tác')
mapping('We design with care, using materials and methods that inspire longevity.','Tối ưu nguồn tài nguyên và giảm lãng phí')
mapping('We craft interiors that balance comfort, beauty, and purpose creating spaces that feel effortless and timeless.','Hướng đến một hệ sinh thái sản xuất có trách nhiệm, nơi nguồn nguyên liệu được tái sử dụng nhiều lần.')
removed={};unknown={}
def settext(s,selector,values):
 els=s.select(selector)
 if isinstance(values,str):values=[values]*len(els)
 for e,v in zip(els,values):e.clear();e.append(v)
def remove(s,sel):
 for e in s.select(sel):e.decompose()
def local(h):
 if h.endswith('.html') and h[:-5] in SRC:return h
 u=urlparse(urljoin('https://huynhhoangminh.com/',h));slug=u.path.strip('/')
 if slug in SRC:return slug+'.html' if slug!='index' else 'index.html'
 return 'https://huynhhoangminh.com/'+slug+(('?'+u.query) if u.query else '')
def main_content(slug):
 src=SRC[slug];out=BeautifulSoup('<article class="verified-content"></article>','html.parser');article=out.article
 title=src.select_one('.prodetail-title') or src.select_one('.title-main h1') or src.select_one('.title-main')
 page_titles={'gioi-thieu':'Giới thiệu','hoat-dong':'Quy trình hoạt động','san-pham':'Sản phẩm','lien-he':'Liên hệ','tin-tuc':'Tin tức','gia-thi-truong':'Giá Thị Trường'}
 h=out.new_tag('h1');h.string=page_titles.get(slug,title.get_text(' ',strip=True) if title else src.title.get_text());article.append(h)
 content=next((c for c in src.select('.content-main,.main-content-productcatalog') if c.get_text(strip=True) and not c.get_text(' ',strip=True).startswith('NỘI DUNG')),None)
 if content:
  c=copy.deepcopy(content)
  for e in c.select('style,script,.toc,.box-toc'):e.decompose()
  for e in c.find_all(True):
   for k in list(e.attrs):
    if k not in ['href','src','alt','colspan','rowspan']:del e[k]
  for e in c.find_all('div'):
   if not e.get_text(strip=True) and not e.find('img'):e.decompose()
  article.append(c)
 if src.select_one('.prodetail-title'):
  im=next((i for i in src.select('.prodetail-img img, .prodetail-image img, .prodetail-slider img') if i.get('src') in AM),None)
  if im:article.insert(1,out.new_tag('img',src=AM[im['src']],alt=h.get_text(' ',strip=True)))
 if slug in ['san-pham']+[c[1] for c in categories]:
  grid=out.new_tag('div',attrs={'class':'verified-grid'})
  product_nodes=src.select('.product')
  page2=EV/'pagination'/'san-pham-page-2.html'
  if slug=='san-pham' and page2.exists():product_nodes+=soup(page2).select('.product')
  for a in product_nodes:
   h3=a.select_one('.product-name');im=a.find('img')
   if not h3:continue
   link=a.select_one('.product-name a')
   card=out.new_tag('a',href=local(link.get('href','') if link else 'lien-he'));card['class']='verified-card'
   if im and im.get('src') in AM:
    img=out.new_tag('img',src=AM[im['src']],alt=h3.get_text(' ',strip=True));card.append(img)
   h=out.new_tag('h3');h.string=h3.get_text(' ',strip=True);card.append(h)
   p=out.new_tag('p');p.string='Liên hệ';card.append(p);grid.append(card)
  article.append(grid)
  if not grid.find('a') and 'Đang cập nhật nội dung...' in src.get_text():
   p=out.new_tag('p');p.string='Đang cập nhật nội dung...';article.append(p)
  cats=out.new_tag('nav',attrs={'class':'verified-categories'})
  for title,href,img in categories:
   a=out.new_tag('a',href=href+'.html');a.string=title;cats.append(a)
  article.insert(1,cats)
 if slug=='tin-tuc':
  for title,href,img in news:
   a=out.new_tag('a',href=local(href));a['class']='verified-card';im=out.new_tag('img',src=img,alt=title);a.append(im);h=out.new_tag('h2');h.string=title;a.append(h);article.append(a)
 if slug=='gia-thi-truong':
  for card in src.select('.price-item'):
   c=copy.deepcopy(card)
   for e in c.find_all(True):
    for k in list(e.attrs):
     if k not in ['href','src','alt']:del e[k]
   article.append(c)
  for item in src.select('.price-list-item'):
   name=item.select_one('.price-list-name');body=item.select_one('.price-list-content-inner')
   if name and body:
    details=out.new_tag('details');summary=out.new_tag('summary');summary.string=name.get_text(' ',strip=True);details.append(summary)
    details.append(copy.deepcopy(body));article.append(details)
 if slug=='lien-he':
  for text in ([COMPANY] if content else [COMPANY,'Địa Chỉ: '+ADDRESS,'Hotline: '+PHONE,'Email: '+EMAIL]):
   p=out.new_tag('p');p.string=text;article.append(p)
  for href,text in [('tel:0964717686',PHONE),('mailto:'+EMAIL,EMAIL)]:
   a=out.new_tag('a',href=href);a.string=text;article.append(a)
  a=out.new_tag('a',href='https://huynhhoangminh.com/lien-he');a['class']='verified-contact-link';a.string='Liên hệ';article.append(a)
 # Source product descriptions may use a different container.
 if not content and slug not in ['lien-he','tin-tuc','san-pham']+[c[1] for c in categories]:
  for sel in ['.product-detail-content','.content-pro','.tab-content','.content-product']:
   c=src.select_one(sel)
   if c:article.append(copy.deepcopy(c));break
 for im in article.find_all('img'):
  if im.get('src') in AM:im['src']=AM[im['src']]
  elif not im.get('src','').startswith('assets/'):im.decompose()
 for a in article.find_all('a',href=True):a['href']=local(a['href']) if not a['href'].startswith(('tel:','mailto:','#')) else a['href']
 return article

for letter in 'abc':
 root=ROOT/('website-'+letter);original=root/letter
 # Keep original extraction separately; final website root contains only deployable files.
 for child in original.iterdir():
  if child.name.startswith('.') or child.name.startswith('_') or child.name=='index.original.html' or child.name.endswith('.text.txt'):continue
  target=root/child.name
  if child.is_dir():shutil.copytree(child,target,dirs_exist_ok=True)
  else:shutil.copy2(child,target)
 s=soup(original/'index.html');s.html['lang']='vi'
 for c in s.find_all(string=lambda x:isinstance(x,Comment)):c.extract()
 remove(s,'script[type="application/ld+json"], [data-node-type="commerce-cart-wrapper"], .w-commerce-commercecartwrapper')
 for script in list(s.find_all('script')):
  if '__WEBFLOW_CURRENCY_SETTINGS' in script.get_text():script.decompose()
 bad={'a':'.brand-ticker,.video-section,.testimonial-section,.testimonial-author-details',
      'b':'.counter-section,.hero-counter-wrap,.hero-counter-wrapper,.hero-counter-block,.case-studio-section,.testimonial-section,.client-section,.client-section-wrapper',
      'c':'.section.company,.our-mission-counter-wrapper,.section.pricing,.section.testimonial,.section.faq,.banner-form-rating-wrapper,.banner-form-rating'}[letter]
 remove(s,bad)
 remove(s,'.case-study-logo-wrap,.footer-socials,.footer-bottom-middle,.footer-social-media-wrapper,.social-link-box')
 # Retain the original news cards with exact titles and dates from the source.
 settext(s,'.blog-title,.blog-post-title',[news[i%len(news)][0] for i in range(len(s.select('.blog-title,.blog-post-title')))])
 settext(s,'.blog-date',[['24/07/2026','24/07/2026','29/07/2026'][i%3] for i in range(len(s.select('.blog-date')))])
 settext(s,'.blog-post-description','')
 settext(s,'.blog-text','Tin tức')
 if letter=='a':
  remove(s,'.lp-hero-feature')
  settext(s,'.about-testimonial-content',[INTRO,'Huỳnh Hoàng Minh tin rằng phế liệu đồng không phải là vật liệu đã hết giá trị, mà là nguồn tài nguyên quý giá cần được thu hồi, tái sử dụng và đưa trở lại chu trình sản xuất một cách hiệu quả.','Cung cấp giải pháp thu mua, phân loại và tái chế phế liệu đồng chuyên nghiệp cho doanh nghiệp và nhà máy.'])
  settext(s,'.service-title-collection-title',[x[0] for x in categories])
  for e,text,cat in zip(s.select('.footer-section a.nav-link')[5:], [x[0] for x in categories],categories):
   if 'services/' in e.get('href',''):e.string=text;e['href']=cat[1]+'.html'
  settext(s,'.case-study-title',[x[0] for x in categories[4:6]])
  settext(s,'.process-tab-content',service_desc)
  for a,text in zip(s.select('.w-tab-link'),services):
   t=a.find(['div','p']);(t or a).clear();(t or a).append(text)
 if letter=='b':
  settext(s,'.about-title-text',['Kiến tạo giá trị','từ tài nguyên tái chế','',''])
  settext(s,'.about-title-2','Kiến tạo giá trị từ tài nguyên tái chế')
  settext(s,'.service-3-title',[x[0] for x in categories])
  settext(s,'.service-3-text','Sản phẩm thu mua')
  settext(s,'.marquee-text',services*5)
  settext(s,'.value-text',services);settext(s,'.value-premium-text',service_desc)
  settext(s,'.cta-title','Liên hệ với chúng tôi qua điện thoại')
 if letter=='c':
  for x in s.select('.number-digit'):
   par=x.find_parent(class_=lambda c:c and 'counter' in c)
   if par:par.decompose()
  remove(s,'.our-mission-counter,.banner-form-rating-text,.banner-form-rating-icon,.services-features-wrapper')
  settext(s,'.featured-projects-card-button-text',[x[0] for x in categories])
  settext(s,'.portfolio-section .section-title','Sản phẩm thu mua')
  settext(s,'.portfolio-section .section-description',INTRO)
  settext(s,'.home-project-title,.portfolio-title',['Đồng','Hợp Kim Đồng','Nhôm'])
  settext(s,'.services-title,.services-card-title,.services-card-name',services)
  settext(s,'.featured-projects .section-description',INTRO)
  settext(s,'.services-section .section-description',PROCESS)
  for t in s.find_all(string=True):
   if norm(t) in ['New in Rochester Silverware','Cosy Layers','Creating stories Space']:t.replace_with(categories[['New in Rochester Silverware','Cosy Layers','Creating stories Space'].index(norm(t))][0])
  settext(s,'.services-description,.services-card-description',service_desc)
  settext(s,'.cta-card-title',services)
 # Replace every remaining visible demo string by an exact verified source string or remove it.
 unknown[letter]=[]
 for t in list(s.find_all(string=True)):
  if t.parent.name in ['script','style']:continue
  n=norm(t)
  if not n or n=='html':continue
  if n in M:t.replace_with(M[n]);continue
  source_text=' '.join(x.get_text(' ',strip=True) for x in SRC.values())
  if n in source_text:continue
  unknown[letter].append(n)
  t.replace_with('')
 # Remove links whose only purpose was a demo/utility route.
 for a in list(s.find_all('a')):
  href=a.get('href','');text=a.get_text(' ',strip=True)
  if any(k in href for k in ['license','style-guide','styleguide','changelog','privacy','terms','/404','/401','checkout']) or urlparse(href).netloc in ['x.com','twitter.com','facebook.com','www.x.com','www.instagram.com','instagram.com','linkedin.com','www.linkedin.com','www.threads.com','www.facebook.com','www.twitter.com']:a.decompose();continue
  if href.startswith('tel:'):a['href']='tel:0964717686'
  elif href.startswith('mailto:'):a['href']='mailto:'+EMAIL
  elif 'maps.google' in href:a['href']='https://www.google.com/maps/search/?api=1&query='+ADDRESS
  elif href in ['/','/home','/home-2']:a['href']='index.html'
  elif href.endswith('.html') and href[:-5] in SRC:pass
  elif href and not href.startswith('#'):
   if 'contact' in href:a['href']='lien-he.html'
   elif 'about' in href:a['href']='gioi-thieu.html'
   elif 'blog' in href:a['href']='tin-tuc.html'
   elif 'recycl' in href or 'service' in href:a['href']='hoat-dong.html'
   else:a['href']='san-pham.html'
 # Product cards link to verified categories.
 selectors={'a':'.service-title-collection-title','b':'.service-3-title','c':'.featured-projects-card-button-text'}
 for e,cat in zip(s.select(selectors[letter]),categories):
  a=e if e.name=='a' else e.find_parent('a')
  if a:a['href']=cat[1]+'.html'
 # Original template forms do not include a deliverable backend. Link to verified official form.
 for f in list(s.find_all('form')):
  link=s.new_tag('a',href='https://huynhhoangminh.com/lien-he');link['class']='verified-contact-link';link.string='Liên hệ';f.replace_with(link)
 remove(s,'.w-form-done,.w-form-fail')
 # Replace template imagery, including all responsive sources and background URLs.
 image_map={};image_count=0
 def replace_image(u,context=''):
  global image_count
  if u in AM:return AM[u]
  if 'logo' in u.lower() or 'favicon' in u.lower() or 'icon-32' in u.lower() or 'zenvira' in u.lower():return LOGO
  if u in image_map:return image_map[u]
  if re.search(r'\.(png|jpe?g|webp|avif|gif)(?:\?|$)',u,re.I):
   if any(k in (u+' '+context).lower() for k in ['hero','banner','header','background','poster','footer']):v=HERO
   elif 'about' in context:v=ABOUT
   else:v=categories[image_count%len(categories)][2];image_count+=1
   image_map[u]=v;return v
  return u
 for im in list(s.find_all('img')):
  u=im.get('src','');context=' '.join(im.get('class',[]))
  if not u:im.decompose();continue
  im['src']=replace_image(u,context)
  if any(k in u.lower() for k in ['company-image','group-32','group-30','group-8-1','frame-2147237443.svg','group-33']):im.decompose();continue
  if 'logo' in u.lower():im['src']=LOGO;im['class']=im.get('class',[])+['official-logo'];im['alt']=COMPANY
  elif im['src'].startswith('assets/'):im['alt']=SHORT
  elif im.get('alt'):im['alt']=''
  for k in ['srcset','sizes','onerror']:im.attrs.pop(k,None)
 # Match official product photos to the product names in each retained card.
 for selector in ['.service-scroll-thumbnail','.service-thumbnail','.service-3-image','.featured-projects-image']:
  for im,cat in zip(s.select(selector),categories):
   im['src']=cat[2];im['alt']=cat[0]
   a=im.find_parent('a')
   if a:a['href']=cat[1]+'.html'
 for im,cat in zip(s.select('.case-study-thumbnail'),categories[4:6]):
  im['src']=cat[2];im['alt']=cat[0]
  a=im.find_parent('a')
  if a:a['href']=cat[1]+'.html'
 settext(s,'.case-study-section .section-title','Sản phẩm thu mua')
 settext(s,'.copyright-text','Copyright © 2026 Công ty TNHH Huỳnh Hoàng Minh')
 if letter=='b':
  remove(s,'.copyright-link')
 if letter=='c':
  footertext=s.select_one('.footer-details-text')
  if footertext:footertext.clear();footertext.append('Copyright © 2026 Công ty TNHH Huỳnh Hoàng Minh')
 for i,card in enumerate(s.select('.single-blog,.blog-content-box-inner,.blog-post-single')):
  item=news[i%len(news)]
  for im in card.find_all('img'):
   if not im.get('src','').endswith('.svg'):im['src']=item[2];im['alt']=item[0]
  if card.name=='a':card['href']=local(item[1])
  for a in card.find_all('a'):a['href']=local(item[1])
 for a in s.select('a.blog-post-title'):
  item=next((n for n in news if n[0]==a.get_text(' ',strip=True)),None)
  if item:a['href']=local(item[1])
 for a in s.find_all('a'):
  text=norm(a.get_text(' ',strip=True))
  routes={'Giới thiệu':'gioi-thieu.html','Quy trình hoạt động':'hoat-dong.html','Sản phẩm thu mua':'san-pham.html','Tin tức':'tin-tuc.html','Liên hệ':'lien-he.html','Liên hệ Liên hệ':'lien-he.html'}
  if text in routes and not a.get('data-w-tab') and 'verified-contact-link' not in a.get('class',[]):a['href']=routes[text]
  if a.get('href')=='#' and not a.get('data-w-tab'):a['href']='lien-he.html'
  if not a.get_text(strip=True) and not a.find(['img','svg']) and 'w-tab-link' not in a.get('class',[]):
   if not any('slider' in x for x in a.get('class',[])):a.decompose()
 for video in list(s.find_all('video')):
  im=s.new_tag('img',src=HERO,alt=COMPANY);im['class']='official-video-poster';video.replace_with(im)
 for e in s.find_all(True):
  if e.has_attr('style'):e['style']=re.sub(r'url\(["\']?([^\)"\']+)["\']?\)',lambda m:'url('+replace_image(m[1],'background')+')',e['style'])
  for attr in ['data-video-urls','data-poster-url']:e.attrs.pop(attr,None)
 for m in s.select('meta'):
  k=m.get('name',m.get('property',''))
  if k in ['description','og:description','twitter:description']:m['content']=INTRO
  if k in ['og:title','twitter:title']:m['content']=COMPANY
  if k in ['og:image','twitter:image']:m['content']=HERO
 for l in s.select('link[rel]'):
  if any(k in l.get('rel',[]) for k in ['shortcut','icon','apple-touch-icon']):l['href']=LOGO;l.attrs.pop('type',None)
 s.title.string=COMPANY
 # Head CSS stays intact; a small additive stylesheet handles the official logo and new content pages.
 css='''
.official-logo{width:210px!important;max-width:48vw;height:84px!important;object-fit:contain;background:white;border-radius:4px;padding:4px}
.official-video-poster{width:100%;height:100%;object-fit:cover;display:block}.verified-contact-link{display:inline-block;padding:14px 24px;background:#fff;color:#183c29;border:1px solid currentColor;border-radius:4px;font-weight:600}
.verified-content{max-width:1200px;margin:auto;padding:160px 30px 80px;line-height:1.8;overflow-wrap:anywhere}.verified-content h1{font-size:clamp(30px,5vw,64px);line-height:1.15;margin-bottom:32px}.verified-content h2{font-size:clamp(24px,3vw,36px);margin:32px 0 16px;line-height:1.3}.verified-content h3{font-size:24px;line-height:1.4}.verified-content p{margin:16px 0}.verified-content img{max-width:100%;height:auto}.verified-content a{text-decoration:underline}.verified-content li{margin:8px 0}.verified-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.verified-card{display:block;margin-bottom:24px}.verified-card img{width:100%;height:240px;object-fit:cover}.verified-categories{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:32px}.verified-content table{width:100%}.verified-content>div>section{padding:0!important}.hero-title,.banner-title{overflow-wrap:normal}.nav-link,.single-nav{white-space:normal}@media(max-width:767px){.verified-grid{grid-template-columns:1fr}.verified-content{padding:130px 20px 50px}.official-logo{height:64px!important;width:160px!important}}
'''
 css+='\n.verified-content a{color:inherit}.verified-content>a{display:block;margin:12px 0}.verified-categories a{padding:6px 12px;border:1px solid currentColor;border-radius:24px;text-decoration:none}.verified-card{text-decoration:none!important}.verified-card img{border-radius:8px}.verified-content details{overflow-x:auto;margin:24px 0}.verified-content summary{cursor:pointer;font-weight:bold;font-size:22px}.footer-details-logo{background:white;object-fit:contain;padding:20px;max-height:200px}\n'
 (root/'css'/'official.css').write_text(css,encoding='utf-8')
 l=s.new_tag('link',rel='stylesheet',href='css/official.css');s.head.append(l)
 # CSS resource references are replaced while preserving selectors, breakpoints and animations.
 for p in (root/'css').glob('*.css'):
  if p.name=='official.css':continue
  text=p.read_text(encoding='utf-8')
  def cssurl(m):
   u=m[1];v=replace_image(u,'background')
   return 'url("../'+v+'")' if v.startswith('assets/') else m[0]
  text=re.sub(r'url\(["\']?([^\)"\']+)["\']?\)',cssurl,text)
  p.write_text(text,encoding='utf-8')
 (root/'assets'/'official').mkdir(parents=True,exist_ok=True)
 for a in assets:
  if a['ok']:shutil.copy2(ROOT/a['file'],root/'assets'/'official'/unquote(Path(a['file']).name))
 (root/'assets'/'SOURCE-MANIFEST.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
 # Add verified contact information where the template lacks contact fields (C).
 if letter=='c':
  el=s.select_one('.footer-information-text')
  if el:el.string='Địa Chỉ: '+ADDRESS+' · Hotline: '+PHONE+' · Email: '+EMAIL
 # Page-specific source content uses each template's existing header, footer, CSS and JS.
 (root/'index.html').write_text(str(s),encoding='utf-8')
 for slug in SRC:
  if slug=='index':continue
  page=copy.deepcopy(s)
  footer=page.select_one('.footer-section' if letter=='a' else ('.footer' if letter=='b' else '.section.footer'))
  sections=page.find_all('section')
  for sec in list(sections):
   if not sec.parent:continue
   if sec is footer or (footer and sec in footer.descendants) or sec.get('id')=='Header':continue
   if sec.find_parent('section'):continue
   sec.decompose()
  content=main_content(slug)
  if footer:footer.insert_before(content)
  else:page.body.append(content)
  page.title.string=(SRC[slug].title.get_text() if SRC[slug].title else slug)+' | '+SHORT
  (root/(slug+'.html')).write_text(str(page),encoding='utf-8')
 (root/'README.md').write_text('# '+COMPANY+'\n\nMở index.html hoặc phục vụ thư mục bằng HTTP tĩnh. Các trang .html dùng đường dẫn tương đối.\n\nForm liên hệ chuyển đến trang liên hệ chính thức; không có backend gửi thư trong template.\n\nNguồn duy nhất: https://huynhhoangminh.com/index\n',encoding='utf-8')
 print(letter,'pages',len(SRC),'unmapped',unknown[letter])
(ROOT/'transformation-audit.json').write_text(json.dumps(unknown,ensure_ascii=False,indent=2),encoding='utf-8')
