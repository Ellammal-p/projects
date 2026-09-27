import os
import sys
import json
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.train_baselines import train_baselines
from ml_model.train_mlp import train_mlp
from ml_model.train_lstm import train_lstm
from ml_model.train_bert import train_bert
from ml_model.train_fusion import train_fusion
from ml_model.preprocess import RISK_LABELS

def run_pipeline():
    print("=========================================================")
    print("       REPRODUCIBLE ML PIPELINE TRAINING & EVALUATION    ")
    print("=========================================================\n")

    # 1 & 2. Train Baselines (Logistic Regression & Random Forest)
    print("--> Training Baseline 1 & Baseline 2 (Logistic Regression & Random Forest)...")
    baseline_res = train_baselines()
    lr_model, lr_metrics = baseline_res['logistic_regression']
    rf_model, rf_metrics = baseline_res['random_forest']

    # 3. Train MLP
    print("\n--> Training Model 3 (PyTorch Multi-Layer Perceptron - MLP)...")
    mlp_model, mlp_metrics = train_mlp()

    # 4. Train LSTM / GRU
    print("\n--> Training Model 4 (PyTorch LSTM / GRU Mood Sequence Classifier)...")
    lstm_model, lstm_metrics = train_lstm()

    # 5. Train BERT / Transformer
    print("\n--> Training Model 5 (HuggingFace DistilBERT / Transformer Journal NLP Classifier)...")
    bert_model, bert_metrics = train_bert()

    # 6. Train Multimodal Fusion Model
    print("\n--> Training Model 6 (PyTorch Multimodal Fusion Deep Learning Model)...")
    fusion_model, fusion_metrics = train_fusion()

    all_metrics = {
        'logistic_regression': lr_metrics,
        'random_forest': rf_metrics,
        'mlp': mlp_metrics,
        'lstm': lstm_metrics,
        'bert': bert_metrics,
        'multimodal_fusion': fusion_metrics,
        'risk_labels': RISK_LABELS
    }

    artifacts_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    
    for filename in ['metrics.json', 'pipeline_metrics.json']:
        metrics_file = os.path.join(artifacts_dir, filename)
        with open(metrics_file, 'w') as f:
            json.dump(all_metrics, f, indent=4)

    print("\n=========================================================")
    print("            FINAL MODEL EVALUATION SUMMARY TABLE         ")
    print("=========================================================")
    print(f"{'Model':<40} | {'Accuracy':<9} | {'Weighted F1':<11} | {'Macro F1':<9}")
    print("-" * 75)
    for key, m in all_metrics.items():
        if key == 'risk_labels':
            continue
        print(f"{m['model_name']:<40} | {m['accuracy']:<9.4f} | {m['f1_weighted']:<11.4f} | {m['f1_macro']:<9.4f}")
    print("=========================================================")
    print(f"\nSaved master pipeline evaluation report to {metrics_file}")
    return all_metrics

if __name__ == '__main__':
    run_pipeline()
