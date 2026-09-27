import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.preprocess import load_phq9_data

class PyTorchMLP(nn.Module):
    def __init__(self, input_dim=11, num_classes=5):
        super(PyTorchMLP, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, num_classes)
        )
        
    def forward(self, x):
        return self.net(x)

def train_mlp():
    torch.manual_seed(42)
    np.random.seed(42)
    
    _, X, y = load_phq9_data(include_total_score=False)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Create DataLoader
    X_train_tensor = torch.tensor(X_train_scaled, dtype=torch.float32)
    y_train_tensor = torch.tensor(y_train.values, dtype=torch.long)
    X_test_tensor = torch.tensor(X_test_scaled, dtype=torch.float32)
    y_test_tensor = torch.tensor(y_test.values, dtype=torch.long)
    
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    
    model = PyTorchMLP(input_dim=X_train.shape[1], num_classes=5)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4)
    
    # Train model
    epochs = 40
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
    
    mlp_metrics = {
        'model_name': 'Multi-Layer Perceptron (MLP)',
        'accuracy': round(float(accuracy_score(y_true, preds)), 4),
        'precision_weighted': round(float(precision_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'recall_weighted': round(float(recall_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_weighted': round(float(f1_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_macro': round(float(f1_score(y_true, preds, average='macro', zero_division=0)), 4),
        'confusion_matrix': confusion_matrix(y_true, preds).tolist()
    }
    
    artifacts_dir = os.path.join('ml_model', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(artifacts_dir, 'mlp_model.pt'))
    
    return model, mlp_metrics

if __name__ == '__main__':
    model, metrics = train_mlp()
    print("MLP Model Trained Successfully.")
    print("MLP Metrics:", metrics)
