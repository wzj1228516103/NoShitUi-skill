"""Download and optimize the credited STAY concept photographs."""
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

target = Path(__file__).resolve().parents[1] / 'ui-atlas-demo/assets/stay'
target.mkdir(parents=True, exist_ok=True)
photos = [('retreat', '8047501', 1800), ('architecture', '37079034', 1100), ('room', '14746026', 1100)]
for name, photo_id, width in photos:
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w={width}'
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
        photo = Image.open(BytesIO(response.read())).convert('RGB')
    photo.thumbnail((width, width * 2))
    destination = target / f'{name}.webp'
    photo.save(destination, 'WEBP', quality=86, method=6)
    print(name, photo.size, destination.stat().st_size)
