"""Build the README carousel and homepage covers from all captured project pages.

The screenshot order in showcase-slides.json also defines the homepage order.
Run after refreshing the matching <id>-desktop.png screenshots.
Every project holds at full quality, then crossfades to the next (including the loop).
"""
import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/screenshots/concepts"
PREVIEWS = ROOT / "ui-atlas-demo/assets/previews"
PREVIEWS.mkdir(parents=True, exist_ok=True)
projects = json.loads((SOURCE / "showcase-slides.json").read_text(encoding="utf-8"))
assert projects and len({p["href"] for p in projects}) == len(projects)
assert all(p["threeD"] for p in projects[:4]) and not any(p["threeD"] for p in projects[4:])
TRANSITION_STEPS = 4
TRANSITION_FRAME_MS = 60
TRANSITION_COLORS = 128

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
contact = Image.new("RGB", (960, math.ceil(len(projects) / 3) * 244), "#0c130f")
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
    draw.text((931, 23), f"{index+1:02d}/{len(projects)}", font=mono_font, fill="#eff6e9")
    frame.paste(image.resize((1000, 662), Image.Resampling.LANCZOS), (0, 66))
    draw.text((22, 731), "NO SHIT UI / COMPLETE PROJECT COLLECTION", font=mono_font, fill="#95a49a")
    for dot in range(len(projects)):
        x = 978 - len(projects) * 17 + dot * 17
        draw.rounded_rectangle((x, 737, x + 10, 741), radius=2, fill="#c8ff4d" if dot == index else "#405146")
    frames.append(frame)
    x, y = (index % 3) * 320, (index // 3) * 244
    contact.paste(image.resize((320, 212), Image.Resampling.LANCZOS), (x, y))
    ImageDraw.Draw(contact).text((x + 10, y + 219), f'{index+1:02d} {project["name"]}', font=small_font, fill="#eff6e9")

target = SOURCE / "ui-atlas-showcase.gif"
holds = [frame.quantize(colors=256, method=Image.Quantize.MEDIANCUT,
                       dither=Image.Dither.NONE) for frame in frames]
rgb_holds = [hold.convert("RGB") for hold in holds]
animation = []
durations = []
for index, frame in enumerate(rgb_holds):
    following = rgb_holds[(index + 1) % len(rgb_holds)]
    animation.append(holds[index])
    durations.append(2400 if projects[index]["threeD"] else 2200)
    # One palette per transition keeps its colors consistent between steps.
    # Full-quality holds keep their own 256 colors; no global palette is imposed
    # on the collection's very different photographs, gradients, and UI themes.
    samples = Image.new("RGB", (600, 150))
    for sample_index, sample in enumerate((frame, following, Image.blend(frame, following, 0.5))):
        samples.paste(sample.resize((200, 150), Image.Resampling.LANCZOS), (sample_index * 200, 0))
    palette = samples.quantize(colors=TRANSITION_COLORS, method=Image.Quantize.MEDIANCUT,
                               dither=Image.Dither.NONE)
    for step in range(1, TRANSITION_STEPS + 1):
        blended = Image.blend(frame, following, step / (TRANSITION_STEPS + 1))
        animation.append(blended.quantize(palette=palette, dither=Image.Dither.NONE))
        durations.append(TRANSITION_FRAME_MS)
animation[0].save(target, save_all=True, append_images=animation[1:],
                  duration=durations, loop=0, disposal=2, optimize=True)
qa = ROOT / "ui-atlas-demo/output/playwright"
qa.mkdir(parents=True, exist_ok=True)
contact.save(qa / "complete-collection-contact.png")
with Image.open(target) as result:
    assert result.n_frames == len(projects) * (TRANSITION_STEPS + 1)
    assert result.info.get("loop") == 0
    for i in range(result.n_frames):
        result.seek(i)
        assert result.info["duration"] == durations[i]
        if i % (TRANSITION_STEPS + 1) == 0:
            hold = holds[i // (TRANSITION_STEPS + 1)].convert("RGB")
            assert ImageChops.difference(result.convert("RGB"), hold).getbbox() is None
print(json.dumps({"projects": [p["id"] for p in projects], "frames": len(animation),
                  "transitions": len(projects), "transition_ms": TRANSITION_STEPS * TRANSITION_FRAME_MS,
                  "duration_ms": sum(durations), "gif_bytes": target.stat().st_size,
                  "covers": len(list(PREVIEWS.glob("*.webp")))}, indent=2))
