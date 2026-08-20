import os
import glob
import cv2
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import sys

# Windows console encoding fix
sys.stdout.reconfigure(encoding='utf-8')

# =====================================================================
# VISION EMOTION ML TRAINING SCRIPT (Scikit-Learn)
# =====================================================================
# INSTRUCTIONS:
# 1. Dataset should be organized by emotion in DATASET_PATH
# 2. Images should be 48x48 (like FER2013). They will be flattened.
# 3. This script will output `vision_model.pkl` to be loaded in main.py.

DATASET_PATH = "./dataset/emotions/train"
MODEL_OUTPUT = "vision_model.pkl"

def extract_vision_features(file_path):
    """
    Reads an image, converts to grayscale, resizes to 48x48, 
    and flattens into a 1D array of 2304 pixels.
    """
    try:
        # Load grayscale
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None
        # Resize to standard 48x48
        img = cv2.resize(img, (48, 48))
        # Flatten and normalize
        return img.flatten() / 255.0
    except Exception as e:
        print(f"Error extracting features from {file_path}: {e}")
        return None

def train_model():
    print("[*] Starting Vision ML Training Pipeline...")
    
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset folder '{DATASET_PATH}' not found!")
        return

    features = []
    labels = []
    
    categories = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))]
    
    if not categories:
        print("Error: No emotion category folders found inside the dataset folder.")
        return
        
    print(f"Found Emotion Categories: {categories}")

    # Process each image file
    for category in categories:
        folder_path = os.path.join(DATASET_PATH, category)
        # Support .jpg, .png
        image_files = []
        for ext in ('*.jpg', '*.jpeg', '*.png'):
            image_files.extend(glob.glob(os.path.join(folder_path, ext)))
            
        print(f"Extracting features from {len(image_files)} files in '{category}'...")
        
        for file in image_files:
            feat = extract_vision_features(file)
            if feat is not None:
                features.append(feat)
                labels.append(category)

    if not features:
        print("Error: No valid image features extracted. Check your dataset files.")
        return

    # Convert to numpy arrays
    X = np.array(features)
    y = np.array(labels)

    print(f"Feature extraction complete. Total samples: {len(X)}")

    # Split into 80% Training and 20% Testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Vision Classifier (this may take 1-3 minutes)...")
    # Limiting depth to 20 and estimators to 50 for faster training without TensorFlow
    model = RandomForestClassifier(n_estimators=50, max_depth=20, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Evaluate the model
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print("\nModel Evaluation Results:")
    print(f"Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, predictions))

    # Save the model
    print(f"Saving model to {MODEL_OUTPUT}...")
    joblib.dump(model, MODEL_OUTPUT)
    print("Pipeline Complete! The vision model is ready for real-time analysis.")

if __name__ == "__main__":
    train_model()
