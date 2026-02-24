import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import os

print("Loading datasets...")

# Get current script directory (safe path handling)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load datasets with encoding fix
df1 = pd.read_csv(os.path.join(BASE_DIR, "combined_dataset.csv"), encoding="latin-1")
df2 = pd.read_csv(os.path.join(BASE_DIR, "spam_texts.csv"), encoding="latin-1")
df3 = pd.read_csv(os.path.join(BASE_DIR, "spam.csv"), encoding="latin-1")

# Keep only first 2 columns (label + text)
df1 = df1.iloc[:, :2]
df2 = df2.iloc[:, :2]
df3 = df3.iloc[:, :2]

# Rename columns
df1.columns = ['target', 'text']
df2.columns = ['target', 'text']
df3.columns = ['target', 'text']

# Combine all datasets
df = pd.concat([df1, df2, df3], ignore_index=True)

print("Datasets combined successfully")

# Remove missing values
df['text'] = df['text'].fillna('')
df = df[df['text'].str.strip() != '']

# Convert labels to lowercase (safe cleaning)
df['target'] = df['target'].str.lower()

# Map labels to numeric
df['target'] = df['target'].map({'spam': 1, 'ham': 0})

# Remove rows where mapping failed
df = df.dropna(subset=['target'])

# Remove duplicate messages
df = df.drop_duplicates(subset=['text'])

print("Data cleaned successfully")
print("Total samples after cleaning:", len(df))

# Split features and labels
X = df['text']
y = df['target']

# TF-IDF Vectorization
vectorizer = TfidfVectorizer(stop_words='english')
X_vec = vectorizer.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_vec, y, test_size=0.2, random_state=42
)

# Train model
model = MultinomialNB()
model.fit(X_train, y_train)

print("Model training completed")

# Evaluate model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred)

print("\n===== MODEL PERFORMANCE =====")
print("Accuracy:", round(accuracy * 100, 2), "%")
print("\nConfusion Matrix:")
print(cm)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model and vectorizer
pickle.dump(model, open(os.path.join(BASE_DIR, "model.pkl"), "wb"))
pickle.dump(vectorizer, open(os.path.join(BASE_DIR, "vectorizer.pkl"), "wb"))

print("\nMODEL CREATED & SAVED SUCCESSFULLY")