"""Generate TEMPO's original audio and measured waveform peaks. No dependencies.

All notes, arrangements, instruments and cover artwork are original to this demo.
Run from any directory: python scripts/generate-tempo-audio.py
Outputs stereo, 16-bit PCM WAV at 22050 Hz (roughly 2.5 MiB per track).
"""
from array import array
import json
import math
from pathlib import Path
import random
import struct
import sys
import wave

RATE = 22050
ROOT = Path(__file__).resolve().parents[1] / 'ui-atlas-demo' / 'assets'
TAU = math.tau


def frequency(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def make_track(name, bpm, chords, melody, seed):
    rng = random.Random(seed)
    beat = 60 / bpm
    duration = beat * 48
    length = int(duration * RATE)
    left = array('f', [0.0]) * length
    right = array('f', [0.0]) * length

    def add_note(note, start, seconds, volume, kind='keys', pan=0.0):
        start_sample = int(start * RATE)
        samples = min(int(seconds * RATE), length - start_sample)
        if samples <= 0:
            return
        hz = frequency(note)
        step = TAU * hz / RATE
        gain_l = math.sqrt((1 - pan) / 2) * volume
        gain_r = math.sqrt((1 + pan) / 2) * volume
        for i in range(samples):
            t = i / RATE
            if kind == 'bass':
                env = min(1, t / .012) * math.exp(-t * 2.5) * min(1, (seconds - t) / .04)
                sound = math.sin(step * i) + .18 * math.sin(step * 2 * i)
            elif kind == 'pad':
                env = min(1, t / .16) * min(1, (seconds - t) / .3)
                sound = .55 * math.sin(step * i) + .22 * math.sin(step * 1.003 * i) + .12 * math.sin(step * 2 * i)
            else:
                env = min(1, t / .006) * math.exp(-t * 3.2) * min(1, (seconds - t) / .04)
                sound = math.sin(step * i) + .3 * math.sin(step * 2 * i) + .09 * math.sin(step * 3 * i)
            value = sound * env
            left[start_sample + i] += value * gain_l
            right[start_sample + i] += value * gain_r

    def drum(start, kind, volume):
        seconds = .26 if kind == 'kick' else .15 if kind == 'snare' else .055
        start_sample = int(start * RATE)
        samples = min(int(seconds * RATE), length - start_sample)
        phase = 0.0
        previous_noise = 0.0
        for i in range(samples):
            t = i / RATE
            noise = rng.uniform(-1, 1)
            if kind == 'kick':
                phase += TAU * (45 + 100 * math.exp(-t * 35)) / RATE
                value = math.sin(phase) * math.exp(-t * 18) * min(1, t / .002)
            elif kind == 'snare':
                value = (noise * .7 + math.sin(TAU * 170 * t) * .3) * math.exp(-t * 30) * min(1, t / .001)
            else:
                value = (noise - previous_noise) * math.exp(-t * 90) * min(1, t / .001)
            previous_noise = noise
            left[start_sample + i] += value * volume * .71
            right[start_sample + i] += value * volume * .69

    # Twelve original four-beat bars, with chord voicings, a bass ostinato,
    # short melodic phrases and a restrained, independently synthesized kit.
    for bar in range(12):
        chord = chords[bar % len(chords)]
        start = bar * 4 * beat
        for j, note in enumerate(chord):
            add_note(note, start + j * .018, beat * 3.8, .075, 'pad', (j - 1.5) * .32)
        for offset in (0, 1.5, 2.5):
            for j, note in enumerate(chord):
                add_note(note + 12, start + offset * beat + j * .009, beat * 1.1, .047, 'keys', .2 - j * .12)
        root = chord[0] - 12
        for offset, note in ((0, root), (1.75, root), (2.5, root + 7), (3.5, root + 12)):
            add_note(note, start + offset * beat, beat * .6, .18, 'bass', -.08)
        for offset in (0, 2, 2.75):
            drum(start + offset * beat, 'kick', .25 if offset != 2.75 else .13)
        for offset in (1, 3):
            drum(start + offset * beat, 'snare', .085)
        for step in range(8):
            offset = step * .5 + (.035 if step % 2 else 0)
            drum(start + offset * beat, 'hat', .035 if step % 2 else .045)
        if bar > 1:
            phrase = melody[bar % len(melody)]
            for j, note in enumerate(phrase):
                if note:
                    add_note(note, start + (.5 + j * .75) * beat, beat * .8, .11, 'keys', .28)

    # Quiet stereo tape-style echo. Feedback uses only past samples.
    delay = int(beat * .75 * RATE)
    for i in range(delay, length):
        left[i] += right[i - delay] * .13
        right[i] += left[i - delay] * .1
    peak = max(max(abs(value) for value in left), max(abs(value) for value in right), .01)
    gain = .82 / peak
    pcm = bytearray(length * 4)
    for i in range(length):
        fade = min(1.0, i / (RATE * .18), (length - 1 - i) / (RATE * 1.15))
        struct.pack_into('<hh', pcm, i * 4, int(left[i] * gain * fade * 32767), int(right[i] * gain * fade * 32767))
    destination = ROOT / 'audio' / f'{name}.wav'
    destination.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(destination), 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm)
    peaks = []
    block = length // 180
    for start in range(0, length, block):
        stop = min(length, start + block)
        rms = math.sqrt(sum(((left[i] + right[i]) * .5 * gain) ** 2 for i in range(start, stop)) / max(1, stop - start))
        peaks.append(rms)
    ceiling = max(peaks) or 1
    print(f'{destination.name}: {duration:.3f}s, stereo PCM, {destination.stat().st_size:,} bytes')
    return [round(max(.045, value / ceiling * .9), 3) for value in peaks]


def main():
    output = {
        'sunroom': make_track('sunroom', 100, [[48, 55, 59, 62], [45, 52, 55, 59], [41, 48, 52, 57], [43, 50, 53, 57]], [[79, 76, 74, 71], [76, 72, 71, 67], [69, 72, 76, 79], [74, 71, 69, 67]], 1101),
        'afterhours': make_track('afterhours', 92, [[45, 52, 55, 59], [41, 48, 52, 57], [48, 55, 59, 62], [43, 50, 53, 57]], [[76, 79, 83, 79], [77, 76, 72, 69], [79, 76, 74, 71], [74, 77, 76, 71]], 2202),
        'coastline': make_track('coastline', 84, [[50, 57, 60, 64], [46, 53, 57, 60], [53, 60, 64, 67], [48, 55, 58, 62]], [[81, 79, 76, 74], [77, 81, 84, 81], [79, 76, 72, 69], [74, 76, 79, 76]], 3303),
    }
    (ROOT / 'tempo').mkdir(parents=True, exist_ok=True)
    (ROOT / 'tempo' / 'waveforms.js').write_text('// Measured RMS peaks from the original local WAV files. Generated by scripts/generate-tempo-audio.py.\nwindow.TEMPO_WAVEFORMS = ' + json.dumps(output, separators=(',', ':')) + ';\n', encoding='utf-8')


if __name__ == '__main__':
    main()
