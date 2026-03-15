import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
import pickle
import os


def compute_metrics(csv_path="combined_dataset.csv"):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    model_path = os.path.join(BASE_DIR, "model.pkl")
    vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")
    data_path = os.path.join(BASE_DIR, csv_path)

    # Load model
    model = pickle.load(open(model_path, "rb"))
    vectorizer = pickle.load(open(vectorizer_path, "rb"))

    # Load dataset
    df = pd.read_csv(data_path, encoding="latin-1")

    # Keep only first two columns
    df = df.iloc[:, :2]
    df.columns = ["target", "text"]

    # Clean text column
    df["text"] = df["text"].fillna("")
    df = df[df["text"].str.strip() != ""]

    # Clean labels
    df["target"] = df["target"].astype(str).str.strip().str.lower()

    df["target"] = df["target"].replace({
        "spam": 1,
        "ham": 0,
        "1": 1,
        "0": 0
    })

    df["target"] = pd.to_numeric(df["target"], errors="coerce")

    df = df.dropna(subset=["target"])

    print("Rows after cleaning:", len(df))

    if df.empty:
        raise ValueError("Dataset became empty after cleaning.")

    # Split dataset
    X = df["text"]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42
    )

    # Transform using saved vectorizer
    X_test_vec = vectorizer.transform(X_test)

    # Predict
    y_pred = model.predict(X_test_vec)

    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    # Return format (KEEP SAME FOR FRONTEND)
    return {
        "accuracy": round(accuracy * 100, 2),
        "confusion_matrix": cm.tolist(),
        "labels": ["Safe (0)", "Fraud (1)"]
    }