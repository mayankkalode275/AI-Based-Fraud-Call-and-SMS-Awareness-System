# 🛡️ ScamShield – Intelligent Scam Detection

ScamShield is an **AI-powered Fraud SMS Detection system** that analyzes SMS messages and identifies whether they are **SAFE or FRAUD** using **Machine Learning and Risk Analysis**.
The system combines **TF-IDF text processing**, a **Naive Bayes classifier**, and a **rule-based risk keyword engine** to detect suspicious scam messages.

It also provides **confidence scores, risky keyword detection, history tracking, and model performance analytics**.

---

# 🚀 Features

### 🔍 AI Fraud Detection

* Detects whether an SMS is **SAFE** or **FRAUD**
* Uses **Machine Learning (Naive Bayes)** for classification

### 📊 Confidence Scoring

* Shows prediction confidence percentage

### ⚠️ Risk Keyword Detection

Highlights suspicious words such as:

* urgent
* bank
* OTP
* verify
* win
* lottery
* click
* link

### 🧠 Hybrid Detection System

Combines:

* **Machine Learning prediction**
* **Rule-based keyword analysis**

### 📈 Accuracy & Confusion Matrix

Displays model evaluation including:

* Accuracy
* True Positive / False Positive
* Confusion Matrix

### 🕘 Message History

Stores recent analyzed messages locally.

### 🎨 Modern Cyber UI

* React + TypeScript frontend
* Cyber-Neon themed interface
* Clean dashboard experience

---

# 🏗️ System Architecture

User Input (SMS)
↓
React Frontend (UI)
↓
Flask API Backend
↓
TF-IDF Vectorization
↓
Naive Bayes Machine Learning Model
↓
Risk Keyword Analyzer
↓
Prediction + Confidence Score
↓
Frontend Dashboard Display

---

# 🧰 Tech Stack

### Frontend

* React
* TypeScript
* HTML / CSS
* Cyber-Neon UI design

### Backend

* Flask
* Flask-CORS

### Machine Learning

* Python
* Scikit-Learn
* TF-IDF Vectorizer
* Multinomial Naive Bayes

### Data Processing

* Pandas
* NumPy

---

# 📂 Project Structure

```
ScamShield/
│
├── FraudSMSProject/
│   ├── app.py
│   ├── metrics.py
│   ├── train_model.py
│   ├── model.pkl
│   ├── vectorizer.pkl
│   ├── combined_dataset.csv
│   ├── spam.csv
│   ├── spam_texts.csv
│
├── frontend/
│   ├── App.tsx
│   ├── index.tsx
│   ├── styles.css
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/scamshield.git
cd scamshield
```

---

## 2️⃣ Install Python Dependencies

```bash
pip install flask flask-cors pandas scikit-learn
```

---

## 3️⃣ Train the Machine Learning Model

```bash
python train_model.py
```

This will generate:

```
model.pkl
vectorizer.pkl
```

---

## 4️⃣ Start the Flask Backend

```bash
python app.py
```

Server will start at:

```
http://127.0.0.1:5000
```

---

## 5️⃣ Start React Frontend

Navigate to frontend folder:

```bash
npm install
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

# 📊 API Endpoints

### Predict Fraud SMS

**POST**

```
/predict
```

Example request:

```json
{
  "message": "URGENT! Your bank account is blocked. Click link to verify."
}
```

Example response:

```json
{
  "prediction": "FRAUD SMS",
  "confidence": 96.45,
  "risky_words": ["urgent", "bank", "click", "verify"]
}
```

---

### Model Metrics

**GET**

```
/metrics
```

Response example:

```json
{
  "accuracy": 96.82,
  "confusion_matrix": [[1500,45],[60,895]],
  "labels": ["Safe (0)", "Fraud (1)"]
}
```

---

# 📊 Dataset

The model was trained using multiple SMS spam datasets including:

* SMS Spam Collection Dataset
* Custom combined fraud datasets
* Public spam message datasets

All datasets were **cleaned, merged, and preprocessed** before training.

---

# 🧠 Machine Learning Pipeline

1. Data cleaning and preprocessing
2. TF-IDF text vectorization
3. Train-test split
4. Naive Bayes classification
5. Model evaluation
6. Model serialization (pickle)

---

# 🔮 Future Improvements

* Chrome extension for real-time scam detection
* WhatsApp scam message detection
* Deep learning NLP models (BERT / LSTM)
* Adaptive learning from user feedback
* Fraud pattern analytics dashboard

---

# 👨‍💻 Author

**Mayank Kalode**

---

# 📜 License

This project is for **educational and research purposes**.
