"""Extract only Ikeda's pp. 21–30 from 製粉振興 No.640 (2026-01-20).
Requires PyMuPDF 1.26.7. Full charts are rendered with their original labels.
"""
import hashlib, html, json, pathlib
import pymupdf
root = pathlib.Path('.cache/other-sources')
doc = pymupdf.open(root / 'seifun.pdf')
figures = {22:(50,416,468,672),23:(50,200,468,672),24:(50,450,468,672),27:(50,50,468,660),28:(50,340,468,672)}
parts = ['<p>池田浩明</p>']
assets=[]
blocks_count=0
for number in range(21,31):
    page=doc[number-1]
    area=pymupdf.Rect(figures[number]) if number in figures else None
    blocks=[b for b in page.get_text('blocks') if b[1]>= (150 if number==21 else 45) and b[3]<680 and (not area or not pymupdf.Rect(b[:4]).intersects(area))]
    blocks.sort(key=lambda b:(0 if b[0]<258 else 1,b[1],b[0]))
    para=''
    for b in blocks:
        text=b[4].strip().replace('\n','')
        if not text: continue
        blocks_count+=1
        if ((b[0]<258 and b[0]>=63) or b[0]>=275) and para:
            parts.append('<p>'+html.escape(para)+'</p>');para=''
        para+=text
    if para:parts.append('<p>'+html.escape(para)+'</p>')
    if area:
        filename='seifun-640-figure-'+str(number)+'.png'
        page.get_pixmap(matrix=pymupdf.Matrix(3,3),clip=area).save(root / filename)
        assets.append(filename)
        parts.append('<figure><img src="ASSET:'+filename+'" alt="製粉振興 No.640 '+str(number)+'ページの図表"><figcaption>製粉振興 No.640、'+str(number)+'ページ</figcaption></figure>')
out=pymupdf.open();out.insert_pdf(doc,from_page=20,to_page=29);out.save(root/'seifun-ikeda.pdf')
assets.append('seifun-ikeda.pdf')
parts.insert(1,'<p><a href="ASSET:seifun-ikeda.pdf">原版PDF（21–30ページ）</a></p>')
(root/'seifun-extracted.json').write_text(json.dumps({'sourceHtml':'\n'.join(parts),'assets':assets,'textBlocks':blocks_count,'pages':list(range(21,31)),'pdfSha256':hashlib.sha256((root/'seifun.pdf').read_bytes()).hexdigest(),'publishedAt':'2026-01-20T00:00:00+09:00'},ensure_ascii=False))
print('Extracted',blocks_count,'text blocks,',len(figures),'complete chart regions, 10 original pages')
