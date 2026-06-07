from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .model import predict


app = FastAPI(title="Fresh Fruit CV API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")

    label, confidence, demo = predict(image)

    return {
        "label": label,
        "confidence": confidence,
        "demo": demo,
    }