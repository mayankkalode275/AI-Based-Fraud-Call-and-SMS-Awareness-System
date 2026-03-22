import librosa
import numpy as np

# 🔹 SIMPLE MOCK TRANSCRIPT (FAST + SAFE)
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


# 🔹 VOICE TYPE DETECTION
def detect_voice_type(y, sr):
    import numpy as np
    import librosa

    pitch = librosa.yin(y, fmin=50, fmax=300)
    energy = np.mean(librosa.feature.rms(y=y))
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))

    pitch_var = np.var(pitch)
    pitch_mean = np.mean(pitch)

    print("Pitch Var:", pitch_var)
    print("Pitch Mean:", pitch_mean)
    print("Energy:", energy)
    print("ZCR:", zcr)

    # ✅ Better logic
    if pitch_var < 5 and zcr < 0.04 and energy < 0.02:
        return "🤖 BOT VOICE"

    elif pitch_var > 20 and zcr > 0.05:
        return "🧑 HUMAN VOICE"

    else:
        return "⚠️ UNCERTAIN / MIXED VOICE"