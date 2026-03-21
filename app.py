from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import joblib
import whisper
import subprocess

app = Flask(__name__)
CORS(app)

# -------------------------------
# Config
# -------------------------------
UPLOAD_FOLDER = 'tempaudio'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# -------------------------------
# Load ML Model
# -------------------------------
call_model = None
call_vectorizer = None

try:
    call_model = joblib.load('callmodel.pkl')
    call_vectorizer = joblib.load('callvectorizer.pkl')
    print("✅ ML models LOADED")
except:
    print("⚠ Model not found → Using demo mode")

# -------------------------------
# Load Whisper Model
# -------------------------------
print("⏳ Loading Whisper model...")
whisper_model = whisper.load_model("base")  # or "tiny" for speed
print("✅ Whisper Ready")

# -------------------------------
# Helper
# -------------------------------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------------------
# Convert audio to WAV (Fix MP3 issue)
# -------------------------------
def convert_to_wav(input_path):
    output_path = input_path + ".wav"

    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, output_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return output_path
    except:
        return input_path

# -------------------------------
# Speech-to-Text (FIXED)
# -------------------------------
def extract_text_features(audio_path):
    try:
        print("🎤 Processing audio with Whisper...")

        # Convert if needed
        audio_path = convert_to_wav(audio_path)

        result = whisper_model.transcribe(audio_path)
        transcript = result["text"].strip()

        print(f"📝 Transcript: {transcript}")

        if transcript == "":
            return "no speech detected"

        return transcript

    except Exception as e:
        print(f"💥 Whisper error: {e}")
        return "error processing audio"

# -------------------------------
# ML Prediction
# -------------------------------
def predict_call(transcript):
    global call_model, call_vectorizer

    if call_model is None:
        return {"prediction": "🚨 SCAM CALL", "confidence": 0.95}

    try:
        X = call_vectorizer.transform([transcript])

        pred = call_model.predict(X)[0]
        proba = call_model.predict_proba(X)[0]

        if pred == 1:
            confidence = proba[1]
        else:
            confidence = proba[0]

        result = "🚨 SCAM CALL" if pred == 1 else "✅ SAFE CALL"

        return {
            "prediction": result,
            "confidence": float(confidence)
        }

    except Exception as e:
        print(f"💥 ML error: {e}")
        return {"prediction": "🚨 SCAM CALL", "confidence": 0.95}

# -------------------------------
# Routes
# -------------------------------
@app.route("/")
def home():
    return jsonify({"status": "API Running ✅ (Whisper Working)"})

@app.route("/predict_call", methods=["POST"])
def detect_call():
    print("🎯 UPLOAD RECEIVED")

    if "audio" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    file = request.files["audio"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    try:
        file.save(filepath)
        print(f"💾 Saved: {filepath}")

        # 🔥 Speech → Text
        transcript = extract_text_features(filepath)

        # 🔥 Prediction
        result = predict_call(transcript)

        os.remove(filepath)

        print("✅ SUCCESS")

        return jsonify({
            "success": True,
            "transcript": transcript,
            "prediction": result["prediction"],
            "confidence": result["confidence"]
        })

    except Exception as e:
        print(f"💥 ERROR: {e}")

        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({"error": str(e)}), 500

# -------------------------------
# Run
# -------------------------------
if __name__ == "__main__":
    print("🚀 Running Call Detection API → http://localhost:5001")
    app.run(debug=True, port=5001, use_reloader=False)