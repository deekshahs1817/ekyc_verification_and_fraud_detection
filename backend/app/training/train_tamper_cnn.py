import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
from app.services.ai.tamper_detector import DocumentTamperCNN
from app.core.logging import logger


class SyntheticTamperDataset(Dataset):
    """
    Generates synthetic authentic and tampered document feature patches for training.
    """
    def __init__(self, num_samples: int = 500):
        self.num_samples = num_samples
        np.random.seed(42)
        # Authentic: low noise, uniform compression
        # Tampered: localized high frequency noise, spliced blocks
        self.data = np.random.randn(num_samples, 3, 256, 256).astype(np.float32)
        self.labels = np.random.randint(0, 2, size=(num_samples, 1)).astype(np.float32)

        # Inject tamper signal into positive samples
        for i in range(num_samples):
            if self.labels[i] == 1.0:
                # Add spliced patch
                self.data[i, :, 50:120, 50:120] += np.random.uniform(2.0, 5.0, (3, 70, 70))

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return torch.tensor(self.data[idx]), torch.tensor(self.labels[idx])


def train_cnn_tamper_model(epochs: int = 5, save_path: str = "./tamper_cnn.pth"):
    logger.info("Starting CNN Document Tamper Detector training...")
    dataset = SyntheticTamperDataset(num_samples=200)
    loader = DataLoader(dataset, batch_size=16, shuffle=True)

    model = DocumentTamperCNN()
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    model.train()
    for epoch in range(epochs):
        total_loss = 0.0
        for batch_x, batch_y in loader:
            optimizer.zero_grad()
            outputs, _ = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        logger.info(f"Epoch [{epoch+1}/{epochs}] - Loss: {total_loss/len(loader):.4f}")

    os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
    torch.save(model.state_dict(), save_path)
    logger.info(f"Model successfully saved to {save_path}")


if __name__ == "__main__":
    train_cnn_tamper_model()
