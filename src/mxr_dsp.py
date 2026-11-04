import sounddevice as sd
import numpy as np

# Variables globales de parámetros
SAMPLE_RATE = 48000  # Valor inicial por defecto
WIPPER_DIS = 0.5  # Ganancia de distorsión inicial
WIPPER_OUT = 1.0  # Volumen de salida inicial

# Estados iniciales para ambos canales
state = {
    "xc2": np.zeros(2),  # xc2 para ambos canales
    "xc3": np.zeros(2),
    "xc4": np.zeros(2),
    "xc5": np.zeros(2),
    "xc6": np.zeros(2),
}

# Función de la etapa de salida (clipping)
def output_stage(vi, K, Rc4, R5, xc4, xc5, tolerance=1e-5, max_iter=100):
    n = 1.8
    Vt = 22e-3
    Is = 1e-9
    vc5 = np.full_like(vi, 0.7)  # Valor inicial para ambos canales

    for _ in range(max_iter):
        f = vc5 - K * (vi - Rc4 * xc4 + (Rc4 + R5) * (xc5 - 2 * Is * np.sinh(vc5 / (n * Vt))))
        df = 1 + K * (Rc4 + R5) * 2 * Is * np.cosh(vc5 / (n * Vt)) / (n * Vt)

        vc5_new = vc5 - f / df
        if np.all(np.abs(vc5_new - vc5) < tolerance):
            return vc5_new
        vc5 = vc5_new

    raise ValueError("Newton-Raphson no convergió.")


# Función principal del modelo MXR Distortion
def mxr_distortion(vi, Ts, wipper_out, wipper_dis, xc2, xc3, xc4, xc5, xc6):
    rv, r5, c4, c5 = 10e3, 10e3, 1e-6, 1e-9
    Rc4 = Ts / (2 * c4)
    Rc5 = Ts / (2 * c5)
    Rc5v = Rc5 * rv / (Rc5 + rv)
    K = Rc5v / (Rc5v + Rc4 + r5)

    c1, c2, c3, c6 = 1e-9, 10e-9, 47e-9, 1e-6
    r1, r2, r3, r4, r67 = 10e3, 1e6, 4.7e3, 1e6, 500e3
    rv_dis = wipper_dis * 1e6
    rc2 = Ts / (2 * c2)
    rc3 = Ts / (2 * c3)
    rc6 = Ts / (2 * c6)
    req3 = rv_dis + r3
    req2 = r67 * rc6 / (r67 + rc6)

    k_n_inv = 1 + r4 / (rc3 + req3)
    k_inv = r4 / (rc3 + req3)
    k1 = 1 / (rc2 + r1 + r2 + req2)
    k2 = 1 / (rc3 + req3 + r4)

    num_samples, num_channels = vi.shape
    vout = np.zeros_like(vi)

    for n in range(num_samples):
        vo1 = k_n_inv * k1 * ((r2 + req2) * (vi[n, :] - rc2 * xc2) + (rc2 + r1) * req2 * xc6) + k_inv * rc3 * xc3
        xc2 = k1 * (2 * (vi[n, :] - req2 * xc6) + (r1 + r2 + req2 - rc2) * xc2)
        xc6 = (2 * k1 / rc6) * req2 * (vi[n, :] + (r1 + r2 + rc2) * xc6 - rc2 * xc2) - xc6
        xc3 = k2 * ((req3 + r4 - rc3) * xc3 - 2 * vo1)

        vc5 = output_stage(vo1, K, Rc4, r5, xc4, xc5)
        vout[n, :] = wipper_out * vc5
        xc5 = 2 * vc5 / Rc5 - xc5
        xc4 = (2 * (vi[n, :] - vc5) + xc4 * (r5 - Rc4)) / (Rc4 + r5)

    return vout, xc2, xc3, xc4, xc5, xc6


# Callback de audio para procesamiento en tiempo real
def audio_callback(indata, outdata, frames, time, status):
    global state
    if status:
        print(f"Audio callback status: {status}")

    # Procesar directamente en el formato (n_samples, n_channels)
    Ts = 1 / SAMPLE_RATE
    vout, xc2, xc3, xc4, xc5, xc6 = mxr_distortion(
        indata,  # Entrada directamente en formato SoundDevice
        Ts,
        WIPPER_OUT,
        WIPPER_DIS,
        state["xc2"],
        state["xc3"],
        state["xc4"],
        state["xc5"],
        state["xc6"]
    )

    # Guardar los nuevos estados
    state["xc2"], state["xc3"], state["xc4"], state["xc5"], state["xc6"] = xc2, xc3, xc4, xc5, xc6

    # Asignar directamente la salida procesada
    outdata[:] = vout


# ⚠️ Este bloque solo se ejecuta si ejecutas dsp.py directamente:
if __name__ == "__main__":
    BLOCK_SIZE = 512  # define BLOCK_SIZE aquí si no lo has hecho arriba

    try:
        with sd.Stream(
            device="default",
            samplerate=SAMPLE_RATE,
            blocksize=BLOCK_SIZE,
            channels=2,
            dtype='float32',
            callback=audio_callback
        ):
            print("MXR Distortion ejecutándose en estéreo. Presiona Ctrl+C para detener.")
            while True:
                pass
    except KeyboardInterrupt:
        print("\nCerrando procesador de audio...")