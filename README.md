# MXR Distortion – Digital Emulation (DSP)

Digital model of the **MXR Distortion** guitar pedal, developed as my Final Degree Project
(Audiovisual Systems Engineering, UPC, 2025) and integrated as a plugin for **Volumio**
on a **Raspberry Pi 5 + Pisound** audio card.

> Full thesis (Spanish, PDF) available on request.

## What it does

- **Circuit-level model** of the pedal: the input/gain stage (op-amp, RC networks) is discretised
  with the bilinear (trapezoidal) transform, and the diode clipping stage is solved per sample
  with **Newton–Raphson** on the diode equation (Shockley model).
- Two user controls, as on the real pedal: **Distortion** (gain pot) and **Output** (level).
- **Offline processing** of WAV files in blocks (`src/process_file.py`).
- **Real-time prototype** using `sounddevice` / ALSA (`src/mxr_dsp.py`).
- **Volumio plugin** skeleton (Node.js) with a web configuration UI (`plugin/`).

## Repository structure

```
src/
  mxr_dsp.py        DSP core: circuit model + real-time stream prototype
  process_file.py   Command-line WAV processing
plugin/             Volumio plugin (index.js, UIConfig.json, install.sh…)
alsa/asound.conf    ALSA configuration used with the Pisound card
```

## Quick start

```bash
pip install -r requirements.txt
python src/process_file.py input.wav output.wav --distortion 0.5 --output-level 1.0
```

## Results and limitations

- File-based processing works and reproduces the pedal's clipping character.
- **Real time was not reached** on the Raspberry Pi: the per-sample Newton–Raphson solver in
  pure Python is too slow (around 10× slower than real time on a desktop CPU in my tests).
  For that reason the final plugin processes files instead of a live stream.
- During testing one Pisound op-amp was damaged by an over-driven input, so later tests
  were mono only.

## Next steps

- Port the core to C/C++ (or vectorise with Numba) to make real time possible.
- Replace Newton–Raphson with a precomputed lookup table / wave-digital-filter approach.
- Build the web GUI with real-time spectrum display proposed in the thesis.

## Credits

The Volumio plugin builds on the work of the earlier UPC project
*"Interfície web remota per àudio i efectes de so"* by Gisela León Pipó.

Author: **Francesc Valero Ruiz**
