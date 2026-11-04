"""Apply the MXR Distortion model to a WAV file (offline, block-based).

Usage:
    python src/process_file.py input.wav output.wav --distortion 0.5 --output 1.0
"""
import argparse

import numpy as np
import soundfile as sf

from mxr_dsp import mxr_distortion

BLOCK_SIZE = 512


def process(input_path, output_path, distortion, output_level):
    vi, sr = sf.read(input_path, dtype="float32")
    if vi.ndim == 1:
        vi = vi[:, None]
    vi = vi[:, :1]  # mono (left channel)

    state = [np.zeros(1) for _ in range(5)]  # xc2, xc3, xc4, xc5, xc6
    Ts = 1 / sr
    out = []
    for i in range(0, len(vi), BLOCK_SIZE):
        block = vi[i:i + BLOCK_SIZE]
        y, *state = mxr_distortion(block, Ts, output_level, distortion, *state)
        out.append(y)

    sf.write(output_path, np.vstack(out), sr)
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="MXR Distortion - offline WAV processing")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--distortion", type=float, default=0.5, help="Distortion pot position (0-1)")
    p.add_argument("--output-level", type=float, default=1.0, help="Output volume (0-1)")
    a = p.parse_args()
    process(a.input, a.output, a.distortion, a.output_level)
