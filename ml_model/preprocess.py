import os
import numpy as np
import pandas as pd

ITEM_FEATURE_COLUMNS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'age', 'gender']
FULL_FEATURE_COLUMNS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'total_score', 'age', 'gender']
FEATURE_COLUMNS = ITEM_FEATURE_COLUMNS

RISK_LABELS = {
    0: "Minimal Symptoms",
    1: "Mild Symptom Risk",
    2: "Moderate Symptom Risk",
    3: "Moderately Severe Risk",
    4: "Severe Symptom Risk"
}

RISK_DESCRIPTIONS = {
    0: "Minimal or no depressive symptoms indicated. Maintain healthy lifestyle habits and routine self-care.",
    1: "Mild depressive symptoms detected. Monitoring mood and engaging in wellness activities is recommended.",
    2: "Moderate depressive symptoms detected. Consider speaking with a healthcare professional or counselor.",
    3: "Moderately severe depressive symptoms indicated. Consultation with a licensed mental health specialist is strongly advised.",
    4: "Severe depressive symptoms indicated. Urgent consultation with a healthcare professional or crisis helpline is strongly recommended."
}

def extract_features(q_answers, age=22, gender=0):
    """
    Extracts tabular features from PHQ-9 survey response list (9 items).
    Calculates total_score and returns (df_features, total_score).
    """
    if len(q_answers) != 9:
        raise ValueError("q_answers must contain exactly 9 item scores (0 to 3)")
    
    total_score = int(sum(q_answers))
    feature_dict = {f'q{i+1}': [q_answers[i]] for i in range(9)}
    feature_dict['age'] = [int(age)]
    feature_dict['gender'] = [int(gender)]
    
    df_features = pd.DataFrame(feature_dict)[ITEM_FEATURE_COLUMNS]
    return df_features, total_score

def load_phq9_data(include_total_score=False):
    """
    Loads PHQ-9 dataset.
    include_total_score: If False, excludes 'total_score' to prevent deterministic target leakage.
    """
    csv_path = os.path.join('dataset', 'phq9_depression_data.csv')
    if not os.path.exists(csv_path):
        from dataset.generate_dataset import generate_phq9_dataset
        generate_phq9_dataset()
        
    df = pd.read_csv(csv_path)
    feature_cols = FULL_FEATURE_COLUMNS if include_total_score else ITEM_FEATURE_COLUMNS
    X = df[feature_cols]
    y = df['risk_class']
    return df, X, y

def load_mood_sequence_data():
    csv_path = os.path.join('dataset', 'mood_sequence_data.csv')
    if not os.path.exists(csv_path):
        from dataset.generate_mood_sequence_dataset import generate_mood_sequence_dataset
        generate_mood_sequence_dataset()
        
    df = pd.read_csv(csv_path)
    day_cols = [c for c in df.columns if c.startswith('day_')]
    X = df[day_cols].values
    y = df['risk_class'].values
    return df, X, y

def load_journal_text_data():
    csv_path = os.path.join('dataset', 'journal_text_data.csv')
    if not os.path.exists(csv_path):
        from dataset.generate_journal_text_dataset import generate_journal_text_dataset
        generate_journal_text_dataset()
        
    df = pd.read_csv(csv_path)
    X = df['text'].values
    y = df['risk_class'].values
    return df, X, y

