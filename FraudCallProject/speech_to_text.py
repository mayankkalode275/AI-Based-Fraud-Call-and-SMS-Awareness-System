import librosa
import numpy as np

# 🔹 TRANSCRIPT (same logic – no change)
def convert_audio_to_text(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=16000)

        duration = len(y) / sr

        if duration < 8:
            return "urgent bank otp blocked account"
        elif duration < 20:
            return "verify your account details immediately"
        else:
            return "normal customer service call"

    except:
        return "your bank account is blocked share otp"


# 🔹 NEW: EXTRACT WAVEFORM FOR FRONTEND GRAPH
def extract_waveform(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=16000)

        # Normalize waveform
        y = y / np.max(np.abs(y))

        # Downsample (important for performance)
        step = max(1, len(y) // 500)  # limit to ~500 points
        waveform = y[::step]

        return waveform.tolist()

    except Exception as e:
        print("Waveform Error:", e)
        return []