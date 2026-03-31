from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import librosa

# ✅ Import modules
from speech_to_text import convert_audio_to_text, extract_waveform
from predict_call import predict_call

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'tempaudio'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a', 'webm', 'ogg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024


# ✅ Check file type
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def home():
    return jsonify({"status": "API Running ✅"})


@app.route("/predict_call", methods=["POST"])
def detect_call():
    print("🎯 UPLOAD RECEIVED")

    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    file = request.files["audio"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    try:
        # ✅ Save file
        file.save(filepath)
        print(f"💾 Saved: {filepath}")

        # ✅ Load audio safely (handles mp3, wav, m4a via librosa backend)
        try:
            y, sr = librosa.load(filepath, sr=16000)
            print("✅ Audio loaded")
        except Exception as e:
            print("⚠️ Audio load error:", e)
            return jsonify({"error": "Unsupported audio format"}), 400

        # ✅ STEP 1: Speech → Text
        try:
            transcript = convert_audio_to_text(filepath)
        except Exception as e:
            print("⚠️ Transcript error:", e)
            transcript = "your bank account is blocked share otp"

        print("📝 Transcript:", transcript)

        # ✅ STEP 2: Fraud Prediction
        result = predict_call(transcript)

        # ✅ STEP 3: Waveform Extraction
        try:
            waveform = extract_waveform(filepath)
        except Exception as e:
            print("⚠️ Waveform error:", e)
            waveform = []

        # ✅ Delete temp file
        if os.path.exists(filepath):
            os.remove(filepath)

        print("✅ SUCCESS")

        return jsonify({
            "success": True,
            "prediction": result.get("prediction"),
            "confidence": result.get("confidence"),
            "keywords": result.get("keywords", []),   # 🔥 NEW
            "risk_score": result.get("risk_score", 0),# 🔥 NEW
            "transcript": transcript,
            "waveform": waveform
        })

    except Exception as e:
        import traceback
        traceback.print_exc()

        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Running on http://localhost:5001")
    app.run(debug=True, port=5001, use_reloader=False)