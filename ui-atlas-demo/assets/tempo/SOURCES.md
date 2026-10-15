# TEMPO original session assets

Created for this repository on 2026-10-15. No third-party recordings, samples,
photographs, artwork, fonts, music services, or runtime CDNs are used by TEMPO.
Artist and album names are fictional demo metadata.

## Audio

The reproducible, dependency-free source is `scripts/generate-tempo-audio.py`.
Python's standard library synthesizes every note and percussion hit. Each
arrangement has twelve four-beat bars, four-part chord voicings, bass,
short melodic phrases, kick, snare, hi-hats, a quiet stereo echo, and fades.
No melody or sound recording is imported from an outside work.

| File | Fictional artist | BPM | Duration | Format |
| --- | --- | --- | --- | --- |
| `../audio/sunroom.wav` | The Tempo Ensemble | 100 | 28.800 s | 22,050 Hz, 16-bit stereo PCM |
| `../audio/afterhours.wav` | Soft Circuit | 92 | 31.304 s | 22,050 Hz, 16-bit stereo PCM |
| `../audio/coastline.wav` | Sunday Service | 84 | 34.286 s | 22,050 Hz, 16-bit stereo PCM |

`waveforms.js` contains measured RMS peaks from these files. The player colors
them against the HTMLAudioElement's current time. The decorative meter is a
playback indicator, not a claimed real-time frequency analyzer.

## Artwork

`sunroom.svg`, `afterhours.svg`, and `coastline.svg` are original geometric
cover illustrations, written as editable SVG. Typography uses browser system
fonts. There are no linked or embedded third-party images.

The source files and generated demo assets are included with this repository
under its root MIT license.
