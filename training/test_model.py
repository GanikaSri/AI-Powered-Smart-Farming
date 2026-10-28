from tensorflow.keras.models import load_model#type: ignore
from tensorflow.keras.preprocessing import image#type: ignore
import numpy as np

model = load_model("crop_disease_model.h5")

CLASS_NAMES = [
    "Tomato___Bacterial_spot",   # 0
    "Tomato___Early_blight",     # 1
    "Tomato___Late_blight",      # 2
    "Tomato___Leaf_Mold",        # 3
    "Tomato___Septoria_leaf_spot", # 4
    "Tomato___healthy"           # 5
]


img = image.load_img("test_leaf.jpg", target_size=(128,128))
x = image.img_to_array(img) / 255.0
x = np.expand_dims(x, axis=0)

pred = model.predict(x)
index = np.argmax(pred)

print("Prediction:", CLASS_NAMES[index])
print("Confidence:", pred[0][index])
