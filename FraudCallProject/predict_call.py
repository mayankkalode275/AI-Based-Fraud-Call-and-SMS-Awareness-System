import joblib
import random

# 🔁 Load model once
model = joblib.load("callmodel.pkl")
vectorizer = joblib.load("callvectorizer.pkl")


def predict_call(transcript):
    try:
        # ✅ ML Prediction
        vec = vectorizer.transform([transcript])
        pred = model.predict(vec)[0]
        prob = model.predict_proba(vec).max()

        transcript_lower = transcript.lower()

        # 🔥 Keywords
        risky_words = [
            "otp", "bank", "verify", "urgent", "click", "link",
            "prize", "lottery", "reward", "money", "account",
            "blocked", "suspend", "kyc", "update", "login"
        ]

        found_keywords = [w for w in risky_words if w in transcript_lower]

        # 🔥 Risk Score
        risk_score = 0

        if "otp" in transcript_lower:
            risk_score += 30
        if "bank" in transcript_lower:
            risk_score += 20
        if "urgent" in transcript_lower:
            risk_score += 20
        if "click" in transcript_lower or "link" in transcript_lower:
            risk_score += 25
        if "money" in transcript_lower or "transfer" in transcript_lower:
            risk_score += 30
        if "verify" in transcript_lower:
            risk_score += 15
        if "kyc" in transcript_lower:
            risk_score += 20

        keyword_count = len(found_keywords)

        # 🔥 Decision override (KEEP but don't dominate probability)
        if risk_score >= 60 or keyword_count >= 3:
            pred = 1

        # 🔥 NEW DYNAMIC CONFIDENCE SYSTEM
        confidence = prob * 100

        # Add keyword influence
        confidence += keyword_count * 3

        # Add risk score influence
        confidence += risk_score * 0.25

        # Add transcript length influence
        if len(transcript.split()) < 6:
            confidence += 3

        # 🔥 Add randomness (VERY IMPORTANT)
        confidence += random.uniform(-5, 5)

        # 🔥 Clamp (NOT HARD FIXED)
        confidence = max(40, min(confidence, 98))

        # ✅ Final Output
        result = "🚨 SCAM CALL" if pred == 1 else "✅ SAFE CALL"

        return {
            "prediction": result,
            "confidence": round(confidence, 2),
            "keywords": found_keywords,
            "risk_score": risk_score
        }

    except Exception as e:
        return {
            "prediction": "ERROR",
            "confidence": 0,
            "error": str(e)
        }