"""Build the README carousel and homepage covers from all captured project pages.

The screenshot order in showcase-slides.json also defines the homepage order.
Run after refreshing the matching <id>-desktop.png screenshots.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/screenshots/concepts"
PREVIEWS = ROOT / "ui-atlas-demo/assets/previews"
PREVIEWS.mkdir(parents=True, exist_ok=True)
projects = json.loads((SOURCE / "showcase-slides.json").read_text(encoding="utf-8"))
assert len(projects) == 12 and len({p["href"] for p in projects}) == 12
assert all(p["threeD"] for p in projects[:4]) and not any(p["threeD"] for p in projects[4:])

def font(size, *candidates):
    for candidate in candidates:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)

title_font = font(22, "C:/Windows/Fonts/segoeuib.ttf",
                  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                  "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
small_font = font(13, "C:/Windows/Fonts/segoeui.ttf",
                  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                  "/System/Library/Fonts/Supplemental/Arial.ttf")
mono_font = font(13, "C:/Windows/Fonts/consola.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
                 "/System/Library/Fonts/Menlo.ttc")
frames = []
contact = Image.new("RGB", (960, 4 * 244), "#0c130f")
for index, project in enumerate(projects):
    image = Image.open(SOURCE / f'{project["id"]}-desktop.png').convert("RGB")
    assert image.size == (1360, 900), (project["id"], image.size)
    image.resize((960, 635), Image.Resampling.LANCZOS).save(
        PREVIEWS / f'{project["id"]}.webp', "WEBP", quality=83, method=6
    )
    frame = Image.new("RGB", (1000, 752), "#0c130f")
    draw = ImageDraw.Draw(frame)
    draw.text((22, 8), project["name"], font=title_font, fill="#eff6e9")
    draw.text((22, 37), project["subtitle"], font=small_font, fill="#95a49a")
    if project["threeD"]:
        draw.rounded_rectangle((791, 16, 906, 45), radius=5, fill="#c8ff4d")
        draw.text((801, 23), "3D EXPERIENCE", font=mono_font, fill="#17300e")
    draw.text((931, 23), f"{index+1:02d}/12", font=mono_font, fill="#eff6e9")
    frame.paste(image.resize((1000, 662), Image.Resampling.LANCZOS), (0, 66))
    draw.text((22, 731), "NO SHIT UI / COMPLETE PROJECT COLLECTION", font=mono_font, fill="#95a49a")
    for dot in range(len(projects)):
        x = 782 + dot * 17
        draw.rounded_rectangle((x, 737, x + 10, 741), radius=2, fill="#c8ff4d" if dot == index else "#405146")
    frames.append(frame.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE))
    x, y = (index % 3) * 320, (index // 3) * 244
    contact.paste(image.resize((320, 212), Image.Resampling.LANCZOS), (x, y))
    ImageDraw.Draw(contact).text((x + 10, y + 219), f'{index+1:02d} {project["name"]}', font=small_font, fill="#eff6e9")

target = SOURCE / "ui-atlas-showcase.gif"
frames[0].save(target, save_all=True, append_images=frames[1:],
               duration=[2400 if p["threeD"] else 2200 for p in projects],
               loop=0, disposal=2, optimize=True)
qa = ROOT / "ui-atlas-demo/output/playwright"
qa.mkdir(parents=True, exist_ok=True)
contact.save(qa / "complete-collection-contact.png")
with Image.open(target) as result:
    assert result.n_frames == len(projects)
    assert result.info.get("loop") == 0
    durations = []
    for i in range(result.n_frames):
        result.seek(i)
        durations.append(result.info["duration"])
print(json.dumps({"projects": [p["id"] for p in projects], "frames": len(frames),
                  "duration_ms": sum(durations), "gif_bytes": target.stat().st_size,
                  "covers": len(list(PREVIEWS.glob("*.webp")))}, indent=2))
