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

    risky = [
    # Urgency / Pressure
    "urgent", "immediately", "now", "limited", "hurry", "final", "alert",
    "warning", "important", "act", "today", "expire", "expired", "suspend",
    "suspended", "blocked", "deactivated", "locked",

    # Money / Prize / Lottery
    "win", "winner", "won", "prize", "lottery", "reward", "cash", 
    "bonus", "gift", "free", "congratulations", "jackpot", "claim",

    # Banking / Financial
    "bank", "account", "atm", "card", "credit", "debit",
    "transaction", "payment", "refund", "withdraw", "deposit",
    "balance", "upi", "netbanking", "kyc", "pan", "aadhaar",

    # OTP / Verification
    "otp", "verify", "verification", "code", "pin",
    "secure", "security", "update", "confirm", "validate",

    # Phishing / Links
    "click", "link", "http", "www", "login", "signin",
    "reset", "password", "details", "credentials",

    # Threat / Legal Fear
    "legal", "notice", "court", "penalty", "fine",
    "complaint", "fraud", "illegal", "tax", "income",

    # Subscription / Service Scam
    "subscription", "renew", "recharge", "sim", "mobile",
    "offer", "discount", "limited offer", "deal"
]

    found = [w for w in risky if w in msg.lower()]

    return jsonify({
        "prediction": prediction,
        "confidence": round(prob, 2),
        "risky_words": found
    })

@app.route("/metrics", methods=["GET"])
def metrics():
    
    m = compute_metrics("combined_dataset.csv")
    m = compute_metrics("spam.csv")
    m = compute_metrics("spam_texts.csv")
    return jsonify(m)




if __name__ == "__main__":
    app.run(debug=True)
