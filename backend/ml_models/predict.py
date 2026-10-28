import os
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "crop_disease_model.h5")
CLASS_INDEX_PATH = os.path.join(BASE_DIR, "class_indices.json")

# Load class indices
with open(CLASS_INDEX_PATH, "r") as f:
    class_map = json.load(f)

# index → class_name
CLASS_NAMES = {v: k for k, v in class_map.items()}

# Crop-wise treatments (SCALABLE)
TREATMENTS = {

    "Potato": {
        "Early_blight": "Remove infected leaves, practice crop rotation, and spray Mancozeb or Chlorothalonil fungicide.",
        "Late_blight": "Immediately remove infected plants and apply systemic fungicides like Metalaxyl.",
        "healthy": "Crop is healthy. Maintain proper irrigation and balanced fertilization."
    },

    "Pumpkin": {
        "Bacterial_Leaf_Spot": "Remove infected leaves and spray copper-based bactericides.",
        "Downy_Mildew": "Ensure good air circulation and apply fungicides like Mancozeb.",
        "Mosaic_Disease": "Remove infected plants immediately and control aphids.",
        "Powdery_Mildew": "Apply sulfur or potassium bicarbonate fungicides.",
        "healthy": "No treatment required. Maintain field hygiene."
    },

    "Rice": {
        "Bacterial_blight": "Use resistant varieties and apply Streptocycline if necessary.",
        "Brown_spot": "Apply fungicides like Propiconazole and improve soil nutrition.",
        "Leaf_smut": "Use certified seeds and follow proper field sanitation.",
        "healthy": "Crop is healthy. Continue recommended agronomic practices."
    },

    "Sugarcane": {
        "Grassy_Shoot": "Remove infected clumps and use disease-free planting material.",
        "Mosaic": "Uproot infected plants and control insect vectors.",
        "Pokkah_Boeng": "Remove affected shoots and apply Carbendazim fungicide.",
        "Red_Leaf_Spot": "Spray copper fungicides and maintain crop hygiene.",
        "Red_Rot": "Destroy infected canes and plant resistant varieties.",
        "Ring_Spot": "Apply appropriate fungicides and avoid water stagnation.",
        "Wilt": "Improve drainage and use disease-free setts.",
        "Yellow_Leaf_Disease": "Remove infected plants and control leafhopper vectors.",
        "healthy": "No treatment needed. Crop is healthy."
    },

    "Tomato": {
        "Bacterial_spot": "Remove infected leaves and spray copper-based bactericides.",
        "Early_blight": "Apply Mancozeb or Chlorothalonil and practice crop rotation.",
        "Late_blight": "Use systemic fungicides like Metalaxyl and destroy infected plants.",
        "Leaf_Mold": "Improve ventilation and apply fungicides such as Chlorothalonil.",
        "Septoria_leaf_spot": "Remove affected leaves and spray copper fungicides.",
        "healthy": "Healthy crop. Maintain proper watering and nutrition."
    }

}

# Load model once
model = load_model(MODEL_PATH)


def predict_disease(img_path):
    if not os.path.exists(img_path):
        raise FileNotFoundError("Image file not found")

    # Preprocess image
    img = image.load_img(img_path, target_size=(128, 128))
    x = image.img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0)

    # Predict
    preds = model.predict(x)
    index = int(np.argmax(preds))
    confidence = float(preds[0][index])


    full_class = CLASS_NAMES[index]  # e.g Tomato___Early_blight
    crop, disease = full_class.split("___")

    if confidence < 0.6:
        return {
            "message": "Please upload a clearer image."
        }
    
    treatment = TREATMENTS.get(crop, {}).get(
        disease, "Consult an agriculture expert"
    )

    return {
        "crop": crop,
        "disease": disease,
        "confidence": round(confidence, 4),
        "treatment": treatment
    }
