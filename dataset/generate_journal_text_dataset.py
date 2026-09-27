import os
import numpy as np
import pandas as pd

def generate_journal_text_dataset(num_samples=1000, random_state=42):
    """
    Generates realistic journal reflection text entries mapped to risk_class (0 to 4).
    Target 'risk_class':
      0: Minimal Symptoms (Energetic, hopeful, accomplished, focused)
      1: Mild Symptom Risk (Slightly tired, occasional stress, manageable)
      2: Moderate Symptom Risk (Feeling overwhelmed, anxious, low motivation)
      3: Moderately Severe Risk (Persistent sadness, isolation, helpless, exhausted)
      4: Severe Symptom Risk (Overwhelming despair, severe exhaustion, hopeless, breakdown)
    """
    np.random.seed(random_state)
    
    phrases_by_risk = {
        0: [
            "Had a productive day at work. Went for a refreshing run and cooked a healthy dinner.",
            "Feeling great today! Spent quality time with friends and accomplished all my goals.",
            "Woke up energized and optimistic about the upcoming project. Life feels balanced and bright.",
            "Enjoyed reading a new book and relaxing outdoors. Feeling calm, peaceful, and satisfied.",
            "Great workout session this morning. I feel physically fit and mentally focused today."
        ],
        1: [
            "A bit busy today with deadlines, but handled it okay. Looking forward to resting tonight.",
            "Felt slightly stressed during the morning meeting, but relaxed after drinking coffee and taking a walk.",
            "Tired after a long study session. Need to organize my sleep schedule better, but feeling okay.",
            "An ordinary day with minor hiccups. A little overwhelmed by chores, but managing fine.",
            "Work was somewhat hectic, but I managed to finish my priority tasks. Mild fatigue."
        ],
        2: [
            "Feeling quite overwhelmed and anxious about everything piling up. Finding it hard to concentrate.",
            "Struggling to stay motivated today. Everything feels like an uphill effort, even simple tasks.",
            "Woke up feeling down for no clear reason. Cancelled plans with friends to stay home.",
            "Mind keeps racing with negative thoughts. Constant fatigue despite sleeping 8 hours.",
            "Feeling disconnected from people around me. Hard to muster enthusiasm for my hobbies."
        ],
        3: [
            "Spent most of the day in bed feeling deeply exhausted and sad. Nothing seems to bring joy anymore.",
            "Extremely difficult to focus or get out of bed. Constant feeling of hopelessness and emotional burden.",
            "Avoiding everyone's calls. I feel like a failure and dread facing tomorrow.",
            "Heavy feeling in my chest all day. I can barely summon energy to complete basic daily routines.",
            "Internal overwhelming sorrow and persistent fatigue. Hard to see any positive way forward."
        ],
        4: [
            "Complete emotional numbness and severe despair. I feel completely empty, broken, and helpless.",
            "Everything feels unbearable and dark. Unable to function or step outside. Deep unbearable pain.",
            "I feel completely trapped in overwhelming sadness with no relief in sight. Constant crying spells.",
            "Severe exhaustion, hopelessness, and breakdown. I feel completely defeated by life right now.",
            "Engulfed in severe dark depression. Incapable of managing day to day existence."
        ]
    }
    
    rows = []
    for entry_id in range(num_samples):
        risk_class = np.random.choice([0, 1, 2, 3, 4], p=[0.10, 0.20, 0.35, 0.20, 0.15])
        base_text = np.random.choice(phrases_by_risk[risk_class])
        
        # Add slight text variation
        modifiers = [
            " Also reflected on my week.",
            " Thinking about what to do next.",
            " Hope tomorrow brings more clarity.",
            " Need to take better care of myself.",
            " Just recording my thoughts for the day."
        ]
        text = base_text + np.random.choice(modifiers)
        
        rows.append({
            'entry_id': f'TEXT_{entry_id:04d}',
            'text': text,
            'risk_class': risk_class
        })
        
    df = pd.DataFrame(rows)
    os.makedirs('dataset', exist_ok=True)
    csv_path = os.path.join('dataset', 'journal_text_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Generated journal text dataset with {num_samples} samples at {csv_path}")
    return df

if __name__ == '__main__':
    generate_journal_text_dataset()
