from PIL import Image
import os
import random

import torch
import torchvision.transforms as transforms
from torchvision import models


MODEL_PATH = "models/model.pth"


def load_model():
    if os.path.exists(MODEL_PATH):
        model = models.resnet18(weights=None)
        model.fc = torch.nn.Linear(model.fc.in_features, 2)

        model.load_state_dict(
            torch.load(MODEL_PATH, map_location="cpu")
        )

        model.eval()
        return model, False

    return None, True


model, is_demo = load_model()


def predict(image: Image.Image):
    if is_demo:
        return random.choice(["good", "defect"]), 0.0, True

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    img_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)

    label = "defect" if predicted.item() == 0 else "good"

    return label, confidence.item(), False