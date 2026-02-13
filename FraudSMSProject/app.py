from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
from metrics import compute_metrics

app = Flask(__name__)
CORS(app)

model = pickle.load(open("model.pkl","rb"))
vectorizer = pickle.load(open("vectorizer.pkl","rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    msg = data.get("message","")

    X = vectorizer.transform([msg])
    result = int(model.predict(X)[0])
    prob = float(model.predict_proba(X).max() * 100)

    prediction = "FRAUD SMS" if result == 1 else "SAFE SMS"

    risky = ["win","urgent","click","bank","account","offer","otp","prize","verify","blocked"]
    found = [w for w in risky if w in msg.lower()]

    return jsonify({
        "prediction": prediction,
        "confidence": round(prob, 2),
        "risky_words": found
    })

@app.route("/metrics", methods=["GET"])
def metrics():
    m = compute_metrics("combined_dataset.csv")
    return jsonify(m)

if __name__ == "__main__":
    app.run(debug=True)
