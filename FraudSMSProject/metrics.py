import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
import pickle
import os
def compute_metrics(csv_path="combined_dataset.csv"):
    import os

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    model = pickle.load(open(os.path.join(BASE_DIR, "model.pkl"), "rb"))
    vectorizer = pickle.load(open(os.path.join(BASE_DIR, "vectorizer.pkl"), "rb"))

    df = pd.read_csv(os.path.join(BASE_DIR, csv_path), encoding="latin-1")

    df = df.iloc[:, :2]
    df.columns = ["target", "text"]

    df["text"] = df["text"].fillna("")
    df = df[df["text"].str.strip() != ""]

    # SAFE LABEL CLEANING
    df["target"] = df["target"].astype(str).str.strip().str.lower()
    df["target"] = df["target"].replace({
        "spam": 1,
        "ham": 0,
        "1": 1,
        "0": 0
    })
    df["target"] = pd.to_numeric(df["target"], errors="coerce")
    df = df.dropna(subset=["target"])

    # 🔎 DEBUG LINE (important)
    print("Rows after cleaning:", len(df))

    if len(df) == 0:
        raise ValueError("Dataset became empty after cleaning.")

    X = df["text"]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    X_test_vec = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    return {
        "accuracy": round(acc * 100, 2),
        "confusion_matrix": cm.tolist(),
        "labels": ["Safe (0)", "Fraud (1)"]
    }