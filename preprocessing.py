# ==============================
# STEP 1 — Import Libraries
# ==============================

import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# ==============================
# STEP 2 — Load Dataset
# ==============================

# Replace "data.csv" with your actual file name
df = pd.read_csv(r"C:\Users\HP\Desktop\combined_dataset.csv")


print("First 5 rows of dataset:")
print(df.head())

# ==============================
# STEP 3 — Understand the Data
# ==============================

print("\nDataset Information:")
print(df.info())

print("\nStatistical Summary:")
print(df.describe())

# ==============================
# STEP 4 — Handling Missing Values
# ==============================

# Fill numerical missing values with mean
for col in df.select_dtypes(include=['int64','float64']).columns:
    df[col] = df[col].fillna(df[col].mean())

# Fill categorical missing values with mode
for col in df.select_dtypes(include=['object']).columns:
    df[col] = df[col].fillna(df[col].mode()[0])

print("\nAfter handling missing values:")
print(df.isnull().sum())

# ==============================
# STEP 5 — Encoding Categorical Data
# ==============================

le = LabelEncoder()

for col in df.select_dtypes(include=['object']).columns:
    df[col] = le.fit_transform(df[col])

print("\nAfter encoding categorical data:")
print(df.head())

# ==============================
# STEP 6 — Feature Scaling
# ==============================

scaler = StandardScaler()

# Select only numerical columns
num_cols = df.columns  # assuming all are numeric now

df[num_cols] = scaler.fit_transform(df[num_cols])

print("\nAfter Feature Scaling:")
print(df.head())

# ==============================
# STEP 7 — Train-Test Split
# ==============================

# Assume last column is target variable
X = df.iloc[:, :-1]   # all columns except last
y = df.iloc[:, -1]    # last column

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

print("\nShapes after split:")
print("X_train:", X_train.shape)
print("X_test:", X_test.shape)
print("y_train:", y_train.shape)
print("y_test:", y_test.shape)

print("\nPreprocessing Completed Successfully ✅")