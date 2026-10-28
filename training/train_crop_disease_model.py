import tensorflow as tf
from tensorflow.keras.models import Sequential#type: ignore
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, Input#type: ignore
from tensorflow.keras.preprocessing.image import ImageDataGenerator#type: ignore
from tensorflow.keras.callbacks import EarlyStopping#type: ignore
import json

# Image parameters
IMG_SIZE = 128 
BATCH_SIZE = 32

train_dir = "dataset/train"
val_dir = "dataset/val"

# Data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True,
    vertical_flip=True,
    shear_range=0.2,
    brightness_range=[0.8, 1.2]
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

# ✅ SAVE CLASS ORDER (VERY IMPORTANT)
with open("class_indices.json", "w") as f:
    json.dump(train_data.class_indices, f)

print("Class indices saved:", train_data.class_indices)

val_data = val_datagen.flow_from_directory(
    val_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

# CNN Model
model = Sequential([
    Input(shape=(IMG_SIZE, IMG_SIZE, 3)),

    Conv2D(32, (3,3), activation='relu'),#convolution layer detects basic features like edges and color changes.
    MaxPooling2D(2,2),   #Max pooling reduces size and removes noise.

    Conv2D(64, (3,3), activation='relu'),#Deeper layers learn complex disease patterns
    MaxPooling2D(2,2),

    Conv2D(128, (3,3), activation='relu'),
    MaxPooling2D(2,2),

    Flatten(),    #Flatten converts feature maps into vectors.
    Dense(128, activation='relu'),    #Dense layers combine features.
    Dropout(0.5),
    Dense(train_data.num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

early_stop = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

# Train model
model.fit(
    train_data,
    validation_data=val_data,
    epochs=50,
    callbacks=[early_stop]
)

# ✅ GENERIC NAME (supports all crops)
model.save("crop_disease_model.h5")

print("✅ Model and class indices saved successfully")
