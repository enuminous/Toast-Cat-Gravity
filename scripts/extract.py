"""Extract the author's manuscript without executing its embedded code.
Usage: python scripts/extract.py '/path/to/toast cat gravity.pdf'
Requires PyMuPDF and Pillow. Run from the repository root.
"""
import argparse
import hashlib
import io
import json
import re
import shutil
from pathlib import Path

import pymupdf
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
doc = pymupdf.open(args.pdf)
Path('assets').mkdir(exist_ok=True)
pages = []
image_count = 0
for number, page in enumerate(doc, 1):
    blocks, titles = [], []
    previous_box, previous_hard = None, False
    for block in page.get_text('dict')['blocks']:
        if block['type'] != 0:
            continue
        lines, sizes, fonts, hard = [], [], [], []
        for line in block['lines']:
            raw = ''.join(s['text'] for s in line['spans']).strip()
            text = raw.replace('\u200b', '').strip()
            if text:
                lines.append(text)
                hard.append(raw.endswith('\u200b'))
                sizes.extend(s['size'] for s in line['spans'] if s['text'].strip())
                fonts.extend(s['font'] for s in line['spans'] if s['text'].strip())
        if not lines:
            continue
        mono = all('Mono' in f for f in fonts)
        heading = all('Bold' in f for f in fonts) and min(sizes) >= 12.9
        kind = 'code' if mono else ('heading' if heading and len(' '.join(lines)) < 240 else 'text')
        text = lines[0]
        for index, line in enumerate(lines[1:], 1):
            text += ('\n' if mono or hard[index - 1] else ' ') + line
        box = block['bbox']
        continuous = previous_box is not None and -1 <= box[1] - previous_box[3] < 6
        if blocks and kind != 'heading' and blocks[-1]['kind'] == kind and (continuous or mono):
            blocks[-1]['text'] += ('\n' if mono or previous_hard else ' ') + text
        else:
            blocks.append({'kind': kind, 'text': text})
        previous_box, previous_hard = box, hard[-1]
        if kind == 'heading':
            titles.append(text)
    image = None
    if page.get_images():
        raw = doc.extract_image(page.get_images(full=True)[0][0])
        picture = Image.open(io.BytesIO(raw['image'])).convert('RGB')
        picture.thumbnail((1400, 1000))
        image = f'assets/source-{number:02}.webp'
        picture.save(image, 'WEBP', quality=85, method=6)
        image_count += 1
    title = titles[0] if titles else ('Dedications' if number == 2 else 'Continuation')
    pages.append({'number': number, 'title': title, 'blocks': blocks, 'image': image})
normalize = lambda text: re.sub(r'\s+', '', text.replace('\u200b', ''))
assert all(normalize(p.get_text()) == normalize(''.join(b['text'] for b in pages[i]['blocks'])) for i, p in enumerate(doc))
source_bytes = args.pdf.read_bytes()
metadata = {
    'title': 'Toast, Cat, Gravity: The Buttered Cat’s Guide To Reality',
    'credits': ['Matthew Chenoweth Wright', 'Millie Sievert', 'MillieComplex'],
    'pageCount': len(doc), 'imageCount': image_count,
    'sourceFile': args.pdf.name, 'sourceSHA256': hashlib.sha256(source_bytes).hexdigest(),
    'extraction': 'Text unchanged apart from whitespace, removal of zero-width spaces, and geometric paragraph reconstruction. Code blocks are displayed, never executed. Image lettering is not OCR indexed. Original PDF included for exact formatting and equations.',
}
Path('manuscript.js').write_text('window.MANUSCRIPT = ' + json.dumps({**metadata, 'pages': pages}, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf8')
Path('source-manifest.json').write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding='utf8')
shutil.copyfile(args.pdf, 'assets/toast-cat-gravity-manuscript.pdf')
print(f'PASS: {len(pages)} pages, {image_count} charts, zero text discrepancies after whitespace normalization.')
