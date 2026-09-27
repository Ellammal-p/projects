import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Ensure current directory is on path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dataset.generate_dataset import generate_phq9_dataset
from ml_model.preprocess import FEATURE_COLUMNS, RISK_LABELS

def train_and_evaluate():
    dataset_path = os.path.join('dataset', 'phq9_depression_data.csv')
    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating PHQ-9 dataset...")
        generate_phq9_dataset()
        
    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset with shape: {df.shape}")
    
    X = df[FEATURE_COLUMNS]
    y = df['risk_class']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Support Vector Machine': SVC(probability=True, random_state=42)
    }
    
    results = {}
    best_model_name = None
    best_f1 = -1
    best_model_obj = None
    
    print("\n--- Model Training & Evaluation ---")
    for name, model in models.items():
        if name in ['Logistic Regression', 'Support Vector Machine']:
            model.fit(X_train_scaled, y_train)
            preds = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, average='weighted', zero_division=0))
        rec = float(recall_score(y_test, preds, average='weighted', zero_division=0))
        f1 = float(f1_score(y_test, preds, average='weighted', zero_division=0))
        cm = confusion_matrix(y_test, preds).tolist()
        
        results[name] = {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'confusion_matrix': cm
        }
        
        print(f"\nModel: {name}")
        print(f"  Accuracy : {acc:.4f}")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall   : {rec:.4f}")
        print(f"  F1-Score : {f1:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model
            
    print(f"\nBest Model Selected: {best_model_name} with F1-Score: {best_f1:.4f}")
    
    artifacts_dir = os.path.join('ml_model', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    
    # Save Model, Scaler & Metrics
    model_file = os.path.join(artifacts_dir, 'model.pkl')
    scaler_file = os.path.join(artifacts_dir, 'scaler.pkl')
    metrics_file = os.path.join(artifacts_dir, 'metrics.json')
    
    joblib.dump(best_model_obj, model_file)
    joblib.dump(scaler, scaler_file)
    
    meta_info = {
        'best_model_name': best_model_name,
        'feature_columns': FEATURE_COLUMNS,
        'results': results,
        'risk_labels': RISK_LABELS
    }
    with open(metrics_file, 'w') as f:
        json.dump(meta_info, f, indent=4)
        
    print(f"Saved artifacts to {artifacts_dir}:")
    print(f" - Model: {model_file}")
    print(f" - Scaler: {scaler_file}")
    print(f" - Metrics: {metrics_file}")

if __name__ == '__main__':
    train_and_evaluate()
