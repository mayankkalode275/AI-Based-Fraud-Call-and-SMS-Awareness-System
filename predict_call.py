import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

def predict_call(transcript):
    """Predict if call transcript is fraudulent"""
    try:
        # Load models
        model = joblib.load('callmodel.pkl')
        vectorizer = joblib.load('callvectorizer.pkl')
        
        # Transform text
        text_vec = vectorizer.transform([transcript])
        prediction = model.predict(text_vec)[0]
        probability = model.predict_proba(text_vec).max()
        
        result = "SCAM CALL" if prediction == 1 else "SAFE CALL"
        
        return {
            "prediction": result,
            "confidence": float(probability)
        }
    except Exception as e:
        return {
            "prediction": "ERROR",
            "confidence": 0.0,
            "error": str(e)
        }
