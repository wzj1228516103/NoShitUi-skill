"""Pin a small selection of verified public-domain Met collection images."""
import concurrent.futures
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'ui-atlas-demo/assets/archive'
TARGET.mkdir(parents=True, exist_ok=True)
OBJECTS = [436535, 436524, 437127, 435882, 436121, 437329]

def get(url):
    with urlopen(Request(url, headers={'User-Agent': 'NoShitUI-educational-showcase/1.0'}), timeout=35) as response:
        return response.read()

def prepare(object_id):
    api = f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}'
    data = json.loads(get(api))
    if not data.get('isPublicDomain') or not data.get('primaryImage'):
        raise RuntimeError(f'{object_id}: object is not a downloadable public-domain image')
    photo = Image.open(BytesIO(get(data['primaryImageSmall'] or data['primaryImage']))).convert('RGB')
    photo.thumbnail((1600, 1600))
    file = TARGET / f'{object_id}.webp'
    photo.save(file, 'WEBP', quality=89, method=6)
    fields = ['objectID', 'title', 'artistDisplayName', 'objectDate', 'objectBeginDate', 'medium', 'dimensions', 'objectURL', 'creditLine', 'isPublicDomain', 'primaryImage', 'primaryImageSmall']
    record = {key:data.get(key) for key in fields}
    record.update(local=f'assets/archive/{object_id}.webp', api=api)
    print(json.dumps({'id':object_id,'title':record['title'],'artist':record['artistDisplayName'],'date':record['objectDate'],'bytes':file.stat().st_size}), flush=True)
    return record

records = []
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    jobs = {pool.submit(prepare, object_id):object_id for object_id in OBJECTS}
    for job in concurrent.futures.as_completed(jobs):
        try: records.append(job.result())
        except Exception as error: print(f'Unverified {jobs[job]}: {error}', flush=True)
records.sort(key=lambda item: item['objectBeginDate'])
(TARGET / 'collection.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
if len(records) < 4: raise RuntimeError('Need at least four verified artworks')
