"""Optimize the three credited Pexels menu photographs for PLATE."""
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image
target = Path(__file__).resolve().parents[1] / 'ui-atlas-demo/assets/plate'
target.mkdir(parents=True, exist_ok=True)
for name, photo_id in [('pasta',1438672),('salad',1059905),('dessert',6800135)]:
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=1300'
    with urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}),timeout=40) as response:
        image=Image.open(BytesIO(response.read())).convert('RGB')
    image.thumbnail((1300,1500))
    image.save(target/f'{name}.webp','WEBP',quality=86,method=6)
    print(name,image.size,(target/f'{name}.webp').stat().st_size,flush=True)
