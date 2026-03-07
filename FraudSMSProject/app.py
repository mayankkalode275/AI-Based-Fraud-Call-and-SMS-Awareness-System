from flask import Flask, request, jsonify
import pickle
import os
import tempfile
from flask_cors import CORS
from metrics import compute_metrics

app = Flask(__name__)
CORS(app)

model = pickle.load(open("model.pkl","rb"))
vectorizer = pickle.load(open("vectorizer.pkl","rb"))

RISKY_WORDS = [
    "urgent","immediately","now","limited","hurry","final","alert",
    "warning","important","act","today","expire","expired","suspend",
    "suspended","blocked","deactivated","locked",
    "win","winner","won","prize","lottery","reward","cash",
    "bonus","gift","free","congratulations","jackpot","claim",
    "bank","account","atm","card","credit","debit",
    "transaction","payment","refund","withdraw","deposit",
    "balance","upi","netbanking","kyc","pan","aadhaar",
    "otp","verify","verification","code","pin",
    "secure","security","update","confirm","validate",
    "click","link","http","www","login","signin",
    "reset","password","details","credentials",
    "legal","notice","court","penalty","fine",
    "complaint","fraud","illegal","tax","income",
    "subscription","renew","recharge","sim","mobile",
    "offer","discount","limited offer","deal"
]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    msg = data.get("message","")

    X = vectorizer.transform([msg])
    result = int(model.predict(X)[0])
    prob = float(model.predict_proba(X).max() * 100)

    prediction = "FRAUD SMS" if result == 1 else "SAFE SMS"

    found = [w for w in RISKY_WORDS if w in msg.lower()]

    return jsonify({
        "prediction": prediction,
        "confidence": round(prob, 2),
        "risky_words": found
    })

@app.route("/speech", methods=["POST"])
def speech():
    try:
        import speech_recognition as sr
    except ImportError:
        return jsonify({"error": "SpeechRecognition library not installed"}), 500

    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    tmp_input = None
    tmp_wav = None
    try:
        suffix = os.path.splitext(audio_file.filename or "audio.webm")[1] or ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            audio_file.save(f.name)
            tmp_input = f.name

        wav_path = tmp_input
        if suffix.lower() != ".wav":
            try:
                from pydub import AudioSegment
                audio_seg = AudioSegment.from_file(tmp_input)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as wf:
                    tmp_wav = wf.name
                audio_seg.export(tmp_wav, format="wav")
                wav_path = tmp_wav
            except Exception as conv_err:
                app.logger.warning("pydub conversion failed, using original file: %s", conv_err)
                wav_path = tmp_input

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)

        try:
            transcription = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            return jsonify({"error": "Could not understand audio. Please speak clearly and try again."}), 422
        except sr.RequestError as e:
            return jsonify({"error": f"Speech recognition service error: {str(e)}"}), 503

        X = vectorizer.transform([transcription])
        result = int(model.predict(X)[0])
        prob = float(model.predict_proba(X).max() * 100)

        prediction = "FRAUD CALL" if result == 1 else "SAFE CALL"
        found = [w for w in RISKY_WORDS if w in transcription.lower()]

        return jsonify({
            "transcription": transcription,
            "prediction": prediction,
            "confidence": round(prob, 2),
            "risky_words": found
        })
    finally:
        if tmp_input and os.path.exists(tmp_input):
            os.unlink(tmp_input)
        if tmp_wav and os.path.exists(tmp_wav):
            os.unlink(tmp_wav)

@app.route("/metrics", methods=["GET"])
def metrics():
    m = compute_metrics("combined_dataset.csv")
    return jsonify(m)

if __name__ == "__main__":
    app.run(debug=True)