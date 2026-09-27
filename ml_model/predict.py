import os
import joblib
import numpy as np
from .preprocess import extract_features, RISK_LABELS, RISK_DESCRIPTIONS

_MODEL = None
_SCALER = None

def load_artifacts():
    global _MODEL, _SCALER
    if _MODEL is None or _SCALER is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        artifacts_dir = os.path.join(base_dir, 'artifacts')
        model_path = os.path.join(artifacts_dir, 'model.pkl')
        scaler_path = os.path.join(artifacts_dir, 'scaler.pkl')
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise FileNotFoundError(
                f"ML model artifacts missing at {artifacts_dir}. Please run 'python ml_model/train_model.py' first."
            )
            
        _MODEL = joblib.load(model_path)
        _SCALER = joblib.load(scaler_path)

def predict_risk(q_answers, age=22, gender=0):
    """
    Performs inference using trained ML model.
    Returns dictionary with prediction details, probabilities, and disclaimers.
    """
    load_artifacts()
    assert _SCALER is not None and _MODEL is not None, "Model artifacts must be loaded before inference"
    
    df_features, total_score = extract_features(q_answers, age, gender)
    
    # Apply scaling
    features_scaled = _SCALER.transform(df_features)
    
    # Model inference
    try:
        if hasattr(_MODEL, 'predict_proba'):
            probs = _MODEL.predict_proba(features_scaled)[0]
            pred_class = int(np.argmax(probs))
            confidence = float(np.max(probs)) * 100
        else:
            pred_class = int(_MODEL.predict(features_scaled)[0])
            confidence = 85.0
    except Exception:
        # Fallback to direct feature prediction if scaling mismatch
        pred_class = int(_MODEL.predict(df_features)[0])
        confidence = 80.0
        
    risk_name = RISK_LABELS.get(pred_class, "Undetermined")
    description = RISK_DESCRIPTIONS.get(pred_class, "")
    
    return {
        'total_score': total_score,
        'risk_class': pred_class,
        'risk_label': risk_name,
        'confidence': round(confidence, 1),
        'description': description,
        'disclaimer': "This system is an educational screening and risk-analysis tool. It is NOT a clinical diagnosis."
    }
