#!/usr/bin/env python3
"""Import completed, visually reviewed generated portraits as optimized static assets.
No generation, network access or publication. Incomplete sources are never mapped.
"""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image

root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / 'crosswalk-portraits'
entries = json.loads((source / 'manifest.json').read_text())
checksums = {Path(name.strip()).name: digest for digest, name in (line.split(None, 1) for line in (source / 'SHA256SUMS').read_text().splitlines() if line.strip())}
out = root / 'public/paintings/character-portraits'
out.mkdir(parents=True, exist_ok=True)
manifest_file = out / 'manifest.json'
existing = {row['id']: row for row in json.loads(manifest_file.read_text())} if manifest_file.exists() else {}
for item in entries:
    if item.get('status') != 'complete':
        continue
    if not item.get('qa', '').startswith('Visually inspected'):
        raise ValueError('Completed portrait lacks visual review evidence')
    identifier = item['id']
    if not identifier.replace('_', '').isalnum() or identifier != identifier.lower():
        raise ValueError('Unsafe character ID')
    original = Path(item['path']).resolve()
    if original.parent != source or not original.is_file():
        raise ValueError(f'Completed image is missing or outside its source directory: {identifier}')
    digest = hashlib.sha256(original.read_bytes()).hexdigest()
    if checksums.get(original.name) != digest:
        raise ValueError(f'Unverified source checksum: {identifier}')
    if existing.get(identifier, {}).get('source_sha256') == digest:
        continue
    with Image.open(original) as im:
        im.load()
        if im.width != im.height or min(im.size) < 640:
            raise ValueError(f'Portrait must be square and at least 640 pixels: {identifier}')
        image = im.convert('RGB')
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
        target = out / f'{identifier}.webp'
        image.save(target, 'WEBP', quality=86, method=6)
        if target.stat().st_size > 160000:
            image.save(target, 'WEBP', quality=80, method=6)
        if target.stat().st_size > 160000:
            raise ValueError(f'Portrait exceeds delivery budget: {identifier}')
        alt = f"Painted portrait of {item['name']}"
        existing[identifier] = {'id': identifier, 'name': item['name'], 'src': f'/paintings/character-portraits/{identifier}.webp', 'alt': alt, 'width': image.width, 'height': image.height, 'bytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'source_sha256': digest}
rows = sorted(existing.values(), key=lambda row: row['id'])
manifest_file.write_text(json.dumps(rows, indent=2) + '\n')
mapping = {row['id']: {'src': row['src'], 'alt': row['alt']} for row in rows}
(root / 'lib/character-portraits.ts').write_text('/** Only completed, visually reviewed portrait assets are listed here. */\nexport const characterPortraits:Record<string,{src:string;alt:string}>=' + json.dumps(mapping, indent=2) + ';\n')
print(f'Imported {len(rows)}/{len(entries)} completed portraits; incomplete sources remain unmapped.')
