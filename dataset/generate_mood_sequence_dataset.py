import os
import numpy as np
import pandas as pd

def generate_mood_sequence_dataset(num_samples=1000, seq_len=14, random_state=42):
    """
    Generates realistic sequential daily mood data (14 consecutive days).
    Mood scores range from 1 (Very Low) to 5 (Very Good).
    Target 'risk_class' represents overall depression risk:
      0: Minimal Symptoms (High average mood, positive trend)
      1: Mild Symptom Risk (Moderate-high mood, slight variation)
      2: Moderate Symptom Risk (Neutral mood, moderate fluctuation)
      3: Moderately Severe Risk (Low mood, frequent drops)
      4: Severe Symptom Risk (Consistently very low mood)
    """
    np.random.seed(random_state)
    
    rows = []
    for subject_id in range(num_samples):
        # Sample target risk class with distribution matching PHQ-9 survey
        risk_class = np.random.choice([0, 1, 2, 3, 4], p=[0.05, 0.20, 0.35, 0.25, 0.15])
        
        # Mean mood score corresponding to risk class
        # Risk 0 -> Mean ~ 4.2
        # Risk 1 -> Mean ~ 3.6
        # Risk 2 -> Mean ~ 3.0
        # Risk 3 -> Mean ~ 2.2
        # Risk 4 -> Mean ~ 1.4
        base_means = {0: 4.2, 1: 3.6, 2: 3.0, 3: 2.2, 4: 1.4}
        mean_mood = base_means[risk_class] + np.random.normal(0, 0.2)
        
        # Generate 14-day auto-regressive mood trajectory
        mood_seq = []
        curr_mood = mean_mood
        for t in range(seq_len):
            # AR(1) process + noise
            curr_mood = 0.7 * curr_mood + 0.3 * mean_mood + np.random.normal(0, 0.6)
            clipped_score = int(np.clip(round(curr_mood), 1, 5))
            mood_seq.append(clipped_score)
            
        row = {'subject_id': f'SUBJ_{subject_id:04d}', 'risk_class': risk_class}
        for day in range(1, seq_len + 1):
            row[f'day_{day}'] = mood_seq[day - 1]
            
        rows.append(row)
        
    df = pd.DataFrame(rows)
    os.makedirs('dataset', exist_ok=True)
    csv_path = os.path.join('dataset', 'mood_sequence_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Generated mood sequence dataset with {num_samples} samples at {csv_path}")
    return df

if __name__ == '__main__':
    generate_mood_sequence_dataset()
