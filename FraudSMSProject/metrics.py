import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
import pickle

def compute_metrics(csv_path="combined_dataset.csv"):
    # load trained model + vectorizer
    model = pickle.load(open("model.pkl","rb"))
    vectorizer = pickle.load(open("vectorizer.pkl","rb"))

    df = pd.read_csv(csv_path)
    df["target"] = df["target"].map({"spam": 1, "ham": 0})

    X = df["text"]
    y = df["target"]

    # fixed split so accuracy is stable in demo
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    X_test_vec = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)  # [[TN, FP],[FN, TP]]

    return {
        "accuracy": round(acc * 100, 2),
        "confusion_matrix": cm.tolist(),
        "labels": ["ham(0)=safe", "spam(1)=fraud"]
    }
