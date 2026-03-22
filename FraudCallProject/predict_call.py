import joblib

def predict_call(transcript):
    try:
        model = joblib.load("callmodel.pkl")
        vectorizer = joblib.load("callvectorizer.pkl")

        vec = vectorizer.transform([transcript])
        pred = model.predict(vec)[0]
        prob = model.predict_proba(vec).max()

        # 🔥 Boost using keywords
        risky_words = [
            "otp", "bank", "verify", "urgent", "click", "link",
            "prize", "lottery", "reward", "money", "account"
        ]

        score_boost = sum(word in transcript.lower() for word in risky_words)

        if score_boost >= 2:
            pred = 1
            prob = max(prob, 0.85)

        result = "🚨 SCAM CALL" if pred == 1 else "✅ SAFE CALL"

        return {
            "prediction": result,
            "confidence": float(prob * 100)
        }

    except Exception as e:
        return {
            "prediction": "ERROR",
            "confidence": 0,
            "error": str(e)
        }