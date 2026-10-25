exec(open('fetch_source.py',encoding='utf-8').read().split('slugs=')[0])
urls=set()
for p in dest.glob('*.html'):
 s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 for a in s.select('.product-name a, a.news, .news a, a.news-item, .news-name a'):
  if a.get('href'):urls.add(urljoin(base,a['href']))
 for a in s.select('.grid-news a, .product a'):
  if a.get('href'):urls.add(urljoin(base,a['href']))
urls={u for u in urls if urlparse(u).netloc=='huynhhoangminh.com'}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:r=list(ex.map(lambda u:get(u,dest/(urlparse(u).path.strip('/').replace('/','_')+'.html')),sorted(urls)))
print(json.dumps(r,ensure_ascii=False,indent=2))
(dest/'detail-requests.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
