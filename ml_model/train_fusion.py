import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from transformers import AutoTokenizer, AutoModelForSequenceClassification

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.preprocess import load_phq9_data, load_mood_sequence_data, load_journal_text_data

MODEL_NAME = "distilbert/distilbert-base-uncased"

class MultimodalFusionDataset(Dataset):
    def __init__(self, X_tab, X_mood, texts, labels, tokenizer, max_len=64):
        self.X_tab = torch.tensor(X_tab, dtype=torch.float32)
        self.X_mood = torch.tensor(X_mood, dtype=torch.float32).unsqueeze(-1)
        self.texts = texts
        self.labels = torch.tensor(labels, dtype=torch.long)
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_len,
            padding='max_length',
            return_tensors='pt'
        )
        return {
            'tab': self.X_tab[idx],
            'mood': self.X_mood[idx],
            'input_ids': encoding['input_ids'].squeeze(0),
            'attention_mask': encoding['attention_mask'].squeeze(0),
            'label': self.labels[idx]
        }

class TabularSubNet(nn.Module):
    def __init__(self, input_dim=11, out_dim=32):
        super(TabularSubNet, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, out_dim),
            nn.BatchNorm1d(out_dim),
            nn.ReLU()
        )
    def forward(self, x):
        return self.net(x)

class MoodLSTMSubNet(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=32, out_dim=64):
        super(MoodLSTMSubNet, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=0.1
        )
    def forward(self, x):
        out, _ = self.lstm(x)
        return out[:, -1, :] # 64d bidirectional last timestep

class MultimodalFusionNet(nn.Module):
    def __init__(self, num_classes=5):
        super(MultimodalFusionNet, self).__init__()
        self.tab_net = TabularSubNet(input_dim=11, out_dim=32)
        self.mood_net = MoodLSTMSubNet(input_dim=1, hidden_dim=32, out_dim=64)
        
        # Text embedding layer (64d output)
        self.text_dense = nn.Sequential(
            nn.Linear(768, 128),
            nn.ReLU(),
            nn.Linear(128, 64)
        )
        
        # Fusion Classifier (32 + 64 + 64 = 160d input)
        self.fusion_classifier = nn.Sequential(
            nn.Linear(160, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes)
        )

    def forward(self, tab, mood, bert_outputs):
        # bert_outputs shape: (batch_size, 768)
        f_tab = self.tab_net(tab)
        f_mood = self.mood_net(mood)
        f_text = self.text_dense(bert_outputs)
        
        fused = torch.cat([f_tab, f_mood, f_text], dim=1)
        return self.fusion_classifier(fused)

def train_fusion():
    torch.manual_seed(42)
    np.random.seed(42)
    
    # 1. Load aligned datasets (min length 1000)
    _, X_tab, y_tab = load_phq9_data(include_total_score=False)
    _, X_mood, y_mood = load_mood_sequence_data()
    _, X_text, y_text = load_journal_text_data()
    
    n_samples = min(len(X_tab), len(X_mood), len(X_text))
    X_tab = X_tab.iloc[:n_samples]
    X_mood = (X_mood[:n_samples] - 3.0) / 2.0 # Normalized [-1, 1]
    X_text = X_text[:n_samples]
    y = y_tab.values[:n_samples]
    
    # Train / Test split
    indices = np.arange(n_samples)
    idx_train, idx_test = train_test_split(indices, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_tab_scaled = scaler.fit_transform(X_tab)
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    bert_backbone = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=5).distilbert
    bert_backbone.eval()
    
    train_dataset = MultimodalFusionDataset(X_tab_scaled[idx_train], X_mood[idx_train], X_text[idx_train], y[idx_train], tokenizer)
    test_dataset = MultimodalFusionDataset(X_tab_scaled[idx_test], X_mood[idx_test], X_text[idx_test], y[idx_test], tokenizer)
    
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)
    
    fusion_model = MultimodalFusionNet(num_classes=5)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(fusion_model.parameters(), lr=0.002, weight_decay=1e-4)
    
    epochs = 15
    fusion_model.train()
    for epoch in range(epochs):
        for batch in train_loader:
            optimizer.zero_grad()
            with torch.no_grad():
                bert_out = bert_backbone(input_ids=batch['input_ids'], attention_mask=batch['attention_mask']).last_hidden_state[:, 0, :]
            
            outputs = fusion_model(batch['tab'], batch['mood'], bert_out)
            loss = criterion(outputs, batch['label'])
            loss.backward()
            optimizer.step()
            
    # Evaluation
    fusion_model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        for batch in test_loader:
            bert_out = bert_backbone(input_ids=batch['input_ids'], attention_mask=batch['attention_mask']).last_hidden_state[:, 0, :]
            outputs = fusion_model(batch['tab'], batch['mood'], bert_out)
            preds = torch.argmax(outputs, dim=1).numpy()
            all_preds.extend(preds)
            all_labels.extend(batch['label'].numpy())
            
    y_true = np.array(all_labels)
    preds = np.array(all_preds)
    
    fusion_metrics = {
        'model_name': 'Multimodal Fusion Deep Learning Model',
        'accuracy': round(float(accuracy_score(y_true, preds)), 4),
        'precision_weighted': round(float(precision_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'recall_weighted': round(float(recall_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_weighted': round(float(f1_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_macro': round(float(f1_score(y_true, preds, average='macro', zero_division=0)), 4),
        'confusion_matrix': confusion_matrix(y_true, preds).tolist()
    }
    
    artifacts_dir = os.path.join('ml_model', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    torch.save(fusion_model.state_dict(), os.path.join(artifacts_dir, 'fusion_model.pt'))
    
    return fusion_model, fusion_metrics

if __name__ == '__main__':
    model, metrics = train_fusion()
    print("Multimodal Fusion PyTorch Model Trained Successfully.")
    print("Fusion Metrics:", metrics)
