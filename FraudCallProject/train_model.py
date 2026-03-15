import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Create sample dataset
data = {
    "text": [
        "your bank account is blocked share your OTP immediately",
        "you won lottery send processing fee",
        "amazon order issue click this link",
        "hello this is customer support",
        "your delivery is on the way",
        "police arrest warrant pay fine now"
    ],
    "label": [1, 1, 1, 0, 0, 1]
}

df = pd.DataFrame(data)
X = df["text"]
y = df["label"]

# Train model
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

print(f"Training Accuracy: {model.score(X_train, y_train):.2f}")
print(f"Testing Accuracy: {model.score(X_test, y_test):.2f}")

# Save models
joblib.dump(model, 'callmodel.pkl')
joblib.dump(vectorizer, 'callvectorizer.pkl')
print("Models saved: callmodel.pkl, callvectorizer.pkl")
