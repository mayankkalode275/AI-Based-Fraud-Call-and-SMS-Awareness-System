import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Expanded dataset
data = {
    "text": [
        "your bank account is blocked share otp",
        "you won lottery send processing fee",
        "click this link to verify account",
        "urgent payment required now",
        "your kyc is pending update details",
        "hello your order is delivered",
        "customer support speaking how can I help",
        "your delivery is on the way",
        "meeting scheduled tomorrow",
        "call me when free",
        "congratulations you won prize",
        "send money to claim reward",
        "bank asking for otp is fraud",
        "free gift claim now",
        "limited time offer click link"
    ],
    "label": [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1]
}

df = pd.DataFrame(data)

X = df["text"]
y = df["label"]

vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2)

model = LogisticRegression()
model.fit(X_train, y_train)

print("Train Accuracy:", model.score(X_train, y_train))
print("Test Accuracy:", model.score(X_test, y_test))

joblib.dump(model, "callmodel.pkl")
joblib.dump(vectorizer, "callvectorizer.pkl")

print("✅ Model saved")