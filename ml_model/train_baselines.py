import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.preprocess import load_phq9_data

def train_baselines():
    _, X, y = load_phq9_data(include_total_score=False)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Baseline 1: Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train_scaled, y_train)
    lr_preds = lr.predict(X_test_scaled)
    
    lr_metrics = {
        'model_name': 'Logistic Regression',
        'accuracy': round(float(accuracy_score(y_test, lr_preds)), 4),
        'precision_weighted': round(float(precision_score(y_test, lr_preds, average='weighted', zero_division=0)), 4),
        'recall_weighted': round(float(recall_score(y_test, lr_preds, average='weighted', zero_division=0)), 4),
        'f1_weighted': round(float(f1_score(y_test, lr_preds, average='weighted', zero_division=0)), 4),
        'f1_macro': round(float(f1_score(y_test, lr_preds, average='macro', zero_division=0)), 4),
        'confusion_matrix': confusion_matrix(y_test, lr_preds).tolist()
    }
    
    # Baseline 2: Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train_scaled, y_train)
    rf_preds = rf.predict(X_test_scaled)
    
    rf_metrics = {
        'model_name': 'Random Forest',
        'accuracy': round(float(accuracy_score(y_test, rf_preds)), 4),
        'precision_weighted': round(float(precision_score(y_test, rf_preds, average='weighted', zero_division=0)), 4),
        'recall_weighted': round(float(recall_score(y_test, rf_preds, average='weighted', zero_division=0)), 4),
        'f1_weighted': round(float(f1_score(y_test, rf_preds, average='weighted', zero_division=0)), 4),
        'f1_macro': round(float(f1_score(y_test, rf_preds, average='macro', zero_division=0)), 4),
        'confusion_matrix': confusion_matrix(y_test, rf_preds).tolist()
    }
    
    artifacts_dir = os.path.join('ml_model', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    joblib.dump(lr, os.path.join(artifacts_dir, 'lr_model.pkl'))
    joblib.dump(rf, os.path.join(artifacts_dir, 'rf_model.pkl'))
    
    # Save best baseline model as default model.pkl for predict inference
    best_baseline = rf if rf_metrics['f1_weighted'] >= lr_metrics['f1_weighted'] else lr
    joblib.dump(best_baseline, os.path.join(artifacts_dir, 'model.pkl'))
    joblib.dump(scaler, os.path.join(artifacts_dir, 'scaler.pkl'))
    
    return {'logistic_regression': (lr, lr_metrics), 'random_forest': (rf, rf_metrics)}

if __name__ == '__main__':
    res = train_baselines()
    print("Baseline Models Trained Successfully.")
    print("LR Metrics:", res['logistic_regression'][1])
    print("RF Metrics:", res['random_forest'][1])
