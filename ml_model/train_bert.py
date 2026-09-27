import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from transformers import AutoTokenizer, AutoModelForSequenceClassification

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.preprocess import load_journal_text_data

MODEL_NAME = "distilbert/distilbert-base-uncased"

class JournalDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=64):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, item):
        text = str(self.texts[item])
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_len,
            padding='max_length',
            return_tensors='pt'
        )
        item_dict = {
            'input_ids': encoding['input_ids'].squeeze(0),
            'attention_mask': encoding['attention_mask'].squeeze(0)
        }
        if self.labels is not None:
            item_dict['label'] = torch.tensor(self.labels[item], dtype=torch.long)
        return item_dict

def train_bert():
    torch.manual_seed(42)
    np.random.seed(42)
    
    _, X, y = load_journal_text_data()
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=5)
    
    train_dataset = JournalDataset(X_train, y_train, tokenizer)
    test_dataset = JournalDataset(X_test, y_test, tokenizer)
    
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)
    
    optimizer = optim.AdamW(model.parameters(), lr=2e-4)
    criterion = nn.CrossEntropyLoss()
    
    epochs = 4
    model.train()
    for epoch in range(epochs):
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch['input_ids']
            attention_mask = batch['attention_mask']
            labels = batch['label']
            
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            
    # Evaluate on test set
    model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch['input_ids']
            attention_mask = batch['attention_mask']
            labels = batch['label']
            
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=1).numpy()
            
            all_preds.extend(preds)
            all_labels.extend(labels.numpy())
            
    y_true = np.array(all_labels)
    preds = np.array(all_preds)
    
    bert_metrics = {
        'model_name': 'BERT / Transformer Journal NLP Classifier',
        'accuracy': round(float(accuracy_score(y_true, preds)), 4),
        'precision_weighted': round(float(precision_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'recall_weighted': round(float(recall_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_weighted': round(float(f1_score(y_true, preds, average='weighted', zero_division=0)), 4),
        'f1_macro': round(float(f1_score(y_true, preds, average='macro', zero_division=0)), 4),
        'confusion_matrix': confusion_matrix(y_true, preds).tolist()
    }
    
    artifacts_dir = os.path.join('ml_model', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(artifacts_dir, 'bert_model.pt'))
    
    return model, bert_metrics

if __name__ == '__main__':
    model, metrics = train_bert()
    print("BERT / Transformer Model Trained Successfully.")
    print("BERT Metrics:", metrics)
