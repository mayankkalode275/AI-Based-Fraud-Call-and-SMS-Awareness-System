import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# Load dataset
df = pd.read_csv("combined_dataset.csv")

# Convert spam/ham to 1/0
df['target'] = df['target'].map({'spam':1, 'ham':0})

X = df['text']
y = df['target']

vectorizer = TfidfVectorizer(stop_words='english')
X_vec = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2)

model = MultinomialNB()
model.fit(X_train, y_train)

pickle.dump(model, open("model.pkl","wb"))
pickle.dump(vectorizer, open("vectorizer.pkl","wb"))

print("MODEL CREATED SUCCESSFULLY")
