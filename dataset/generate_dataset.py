import os
import numpy as np
import pandas as pd

def generate_phq9_dataset(num_samples=1200, random_state=42):
    """
    Generates a realistic educational dataset based on standard PHQ-9 survey distributions.
    Items Q1-Q9 represent PHQ-9 screening questions scored 0 to 3:
      0: Not at all
      1: Several days
      2: More than half the days
      3: Nearly every day
    """
    np.random.seed(random_state)
    
    # Generate realistic item response correlations
    # Latent severity factor ranging from 0 to 1
    latent_severity = np.random.beta(a=1.8, b=2.2, size=num_samples)
    
    q_data = {}
    for i in range(1, 10):
        # Probabilities adjusted based on latent severity
        probs = np.zeros((num_samples, 4))
        for s in range(num_samples):
            sev = latent_severity[s]
            # Higher severity increases chance of 2 and 3
            p0 = max(0.05, 1.0 - 1.2 * sev)
            p1 = max(0.05, 0.6 * (1 - abs(sev - 0.3)))
            p2 = max(0.05, 0.6 * (1 - abs(sev - 0.6)))
            p3 = max(0.05, 1.2 * sev)
            p_total = p0 + p1 + p2 + p3
            probs[s] = [p0/p_total, p1/p_total, p2/p_total, p3/p_total]
            
        scores = [np.random.choice([0, 1, 2, 3], p=probs[s]) for s in range(num_samples)]
        q_data[f'q{i}'] = scores

    df = pd.DataFrame(q_data)
    
    # Calculate Total PHQ-9 Score (Sum of Q1 to Q9)
    df['total_score'] = df[[f'q{i}' for i in range(1, 10)]].sum(axis=1)
    
    # Demographic features
    df['age'] = np.random.randint(18, 65, size=num_samples).tolist()
    df['gender'] = np.random.choice([0, 1, 2], size=num_samples, p=[0.48, 0.48, 0.04]).tolist() # 0: Female, 1: Male, 2: Other
    
    # Assign Clinical Screening Severity Category based on standard PHQ-9 clinical cutoffs:
    # 0-4: Minimal / None
    # 5-9: Mild
    # 10-14: Moderate
    # 15-19: Moderately Severe
    # 20-27: Severe
    def get_risk_label(score):
        if score <= 4:
            return 0  # Minimal
        elif score <= 9:
            return 1  # Mild
        elif score <= 14:
            return 2  # Moderate
        elif score <= 19:
            return 3  # Moderately Severe
        else:
            return 4  # Severe

    df['risk_class'] = df['total_score'].apply(get_risk_label)
    
    os.makedirs('dataset', exist_ok=True)
    csv_path = os.path.join('dataset', 'phq9_depression_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Successfully generated PHQ-9 dataset with {num_samples} samples at {csv_path}")
    return df

if __name__ == '__main__':
    generate_phq9_dataset()
