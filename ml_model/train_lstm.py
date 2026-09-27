import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.preprocess import load_mood_sequence_data

class MoodLSTM(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=32, num_layers=2, num_classes=5):
        super(MoodLSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.2
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, num_classes)
        )
        
    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        lstm_out, _ = self.lstm(x)
        # Use last timestep output
        last_out = lstm_out[:, -1, :]
        return self.fc(last_out)

def train_lstm():
    torch.manual_seed(42)
    np.random.seed(42)
    
    _, X, y = load_mood_sequence_data()
    
    # Normalize ratings (scale 1-5 to range -1 to 1)
    X_norm = (X - 3.0) / 2.0
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_norm, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Reshape for LSTM: (batch_size, seq_len, 1)
    X_train_tensor = torch.tensor(X_train, dtype=torch.float32).unsqueeze(-1)
    y_train_tensor = torch.tensor(y_train, dtype=torch.long)
    X_test_tensor = torch.tensor(X_test, dtype=torch.float32).unsqueeze(-1)
    y_test_tensor = torch.tensor(y_test, dtype=torch.long)
    
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    
    model = MoodLSTM(input_dim=1, hidden_dim=32, num_layers=2, num_classes=5)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.003, weight_decay=1e-4)
    
    epochs = 35
    model.train()
    for epoch in range(epochs):
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
    # Evaluate on test set
    model.eval()
    with torch.no_grad():
        test_outputs = model(X_test_tensor)
        preds = torch.argmax(test_outputs, dim=1).numpy()
        
    y_true = y_test_tensor.numpy()
    
    lstm_metrics = {
        'model_name': 'LSTM / GRU Mood Sequence Classifier',
        'accuracy': round(float(accuracy_score(y_true, preds)), 4),
        'precision_weighted': round(float(precision_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'recall_weighted': round(float(recall_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_weighted': round(float(f1_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_macro': round(float(f1_score(y_true, preds, average='macro', zero_division=0)), 4),
        'confusion_matrix': confusion_matrix(y_true, preds).tolist()
    }
    
    artifacts_dir = os.path.join('ml_model', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(artifacts_dir, 'lstm_model.pt'))
    
    return model, lstm_metrics

if __name__ == '__main__':
    model, metrics = train_lstm()
    print("LSTM Sequence Model Trained Successfully.")
    print("LSTM Metrics:", metrics)
