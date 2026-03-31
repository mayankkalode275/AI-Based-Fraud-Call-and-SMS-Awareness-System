import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# 🔥 Expanded + Better Dataset
data = {
    "text": [
           # 🔴 FRAUD (EXPANDED)

        "your bank account is blocked share otp",
        "you won lottery send processing fee",
        "click this link to verify account",
        "urgent payment required now",
        "your kyc is pending update details",
        "send money to claim reward",
        "free gift claim now",
        "limited time offer click link",
        "your account suspended verify immediately",
        "otp required for transaction share now",
        "you are selected for prize claim reward",
        "click here to update your bank details",
        "unauthorized login detected verify account",
        "payment failed retry with your card details",
        "congratulations you won cashback send details",

        # 🔥 NEW FRAUD VARIATIONS
        "your account will be blocked if not verified now",
        "share your otp to avoid account suspension",
        "urgent action needed click the link now",
        "your debit card is blocked provide details",
        "verify your bank details to continue service",
        "transfer money to receive your prize",
        "you have won iphone pay delivery charges",
        "account security alert update password now",
        "click the link to claim your cashback",
        "your account has suspicious activity verify now",
        "send your card number for verification",
        "your loan is approved share processing fee",
        "you are selected for lucky draw claim now",
        "bank server issue share otp for fixing",
        "update your kyc immediately or account will freeze",
        "pay small fee to unlock your account",
        "confirm your identity by sharing otp",
        "click here for instant reward claim",
        "your transaction is pending verify details",
        "share your credentials to complete process",

        # 🟢 SAFE (EXPANDED)

        "hello your order is delivered",
        "customer support speaking how can I help",
        "your delivery is on the way",
        "meeting scheduled tomorrow",
        "call me when free",
        "thank you for your purchase",
        "your bill payment is successful",
        "appointment confirmed for tomorrow",
        "your parcel has been shipped",
        "team meeting at 5 pm",
        "project submission deadline is next week",
        "reminder for your scheduled appointment",
        "your subscription has been renewed",
        "invoice generated successfully",
        "welcome to our service",

        # 🔥 NEW SAFE VARIATIONS
        "your cab has arrived at your location",
        "thank you for contacting support team",
        "your request has been processed successfully",
        "please review the attached document",
        "your ticket has been booked successfully",
        "delivery will reach by tomorrow evening",
        "your package is out for delivery",
        "meeting has been postponed to next week",
        "please call back when you are available",
        "your account statement is ready",
        "invoice has been sent to your email",
        "thank you for your feedback",
        "your refund has been initiated",
        "order confirmed and will be delivered soon",
        "your service request is completed",
        "team will contact you shortly",
        "your payment has been received",
        "please attend the scheduled call",
        "update shared in the group",
        "system maintenance scheduled tonight"
    ],
    "label": [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,   # fraud
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0    # safe
    ]
}

df = pd.DataFrame(data)

X = df["text"]
y = df["label"]

# 🔥 Better vectorizer
vectorizer = TfidfVectorizer(
    ngram_range=(1,2),   # single + double words
    stop_words='english'
)

X_vec = vectorizer.fit_transform(X)

# 🔥 Better split
X_train, X_test, y_train, y_test = train_test_split(
    X_vec, y, test_size=0.2, random_state=42
)

# 🔥 Better model
model = LogisticRegression(max_iter=200)

model.fit(X_train, y_train)

# ✅ Accuracy
print("Train Accuracy:", round(model.score(X_train, y_train)*100, 2), "%")
print("Test Accuracy:", round(model.score(X_test, y_test)*100, 2), "%")

# 💾 Save
joblib.dump(model, "callmodel.pkl")
joblib.dump(vectorizer, "callvectorizer.pkl")

print("✅ Model saved successfully!")