from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
from metrics import compute_metrics
import re

app = Flask(__name__)
CORS(app)

# Load ML model and vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

# Risky keywords
risky_keywords = [
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
"offer","discount","limited offer","deal",
"lakh","crore","rupees","rs","money","earn","profit","investment"
]

# urgency words
urgency_words = ["urgent","immediately","hurry","act now","final"]

# money scam indicators
money_words = ["rs","rupees","lakh","crore","cash","prize","win","money"]


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json
    msg = data.get("message", "").lower()

    # ---------------- ML MODEL ----------------

    X = vectorizer.transform([msg])
    model_result = int(model.predict(X)[0])
    model_prob = float(model.predict_proba(X).max() * 100)

    # ---------------- RISK WORDS ----------------

    found_risky = [word for word in risky_keywords if word in msg]

    # ---------------- FRAUD SCORE ----------------

    score = 0

    # ML vote
    if model_result == 1:
        score += 60

    # risky words score
    score += len(found_risky) * 5

    # link detection
    if "http" in msg or "www" in msg or "link" in msg:
        score += 20

    # phone number detection
    if re.search(r"\d{10}", msg):
        score += 10

    # urgency detection
    if any(word in msg for word in urgency_words):
        score += 10

    # money scam detection
    money_flag = any(word in msg for word in money_words)

    if money_flag:
        score += 15

    # ---------------- SMART DECISION ENGINE ----------------

    if model_result == 1 and model_prob >= 80:
        prediction = "FRAUD SMS"

    elif score >= 60:
        prediction = "FRAUD SMS"

    elif score >= 35 and len(found_risky) >= 2:
        prediction = "FRAUD SMS"

    elif money_flag and ("click" in msg or "link" in msg):
        prediction = "FRAUD SMS"

    else:
        prediction = "SAFE SMS"

    # ---------------- RESPONSE ----------------

    return jsonify({
        "prediction": prediction,
        "confidence": round(model_prob, 2),
        "risk_score": score,
        "risky_word_count": len(found_risky),
        "risky_words": found_risky
    })


@app.route("/metrics", methods=["GET"])
def metrics():
    m = compute_metrics("combined_dataset.csv")
    return jsonify(m)


if __name__ == "__main__":
    app.run(debug=True)