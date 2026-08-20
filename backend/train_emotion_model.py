import os
import glob
import librosa
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# =====================================================================
# EMOTION ML TRAINING SCRIPT
# =====================================================================
# INSTRUCTIONS:
# 1. Place your audio dataset inside a folder named 'dataset'.
# 2. Organize audio files by emotion, e.g., dataset/Happy/01.wav, dataset/Sad/02.wav
# 3. Run this script: `python train_emotion_model.py`
# 4. It will extract MFCC features and train a fast Random Forest model.
# 5. It will output `emotion_model.pkl` to load into FastAPI.

DATASET_PATH = "./dataset/emotions/train"
MODEL_OUTPUT = "emotion_model.pkl"

def extract_features(file_path):
    """
    Extracts acoustic features from an audio file using Librosa.
    We extract MFCCs (Mel-Frequency Cepstral Coefficients) which represent the shape of the vocal tract.
    """
    try:
        # Load audio (downsample to 22050 Hz for faster processing)
        y, sr = librosa.load(file_path, sr=22050, duration=3.0)
        
        # Extract MFCC features (40 bands)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        
        # Calculate the mean of each MFCC band over time
        mfccs_scaled = np.mean(mfccs.T, axis=0)
        return mfccs_scaled
    except Exception as e:
        print(f"Error extracting features from {file_path}: {e}")
        return None

def train_model():
    print("🚀 Starting Emotion ML Training Pipeline...")
    
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Error: Dataset folder '{DATASET_PATH}' not found!")
        print("Please create a 'dataset' folder and organize your audio files by emotion category.")
        return

    features = []
    labels = []
    
    # Iterate through all subdirectories in the dataset folder
    # Each subdirectory name is treated as the emotion label (e.g. 'Happy', 'Sad')
    categories = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))]
    
    if not categories:
        print("❌ Error: No emotion category folders found inside the dataset folder.")
        return
        
    print(f"📁 Found Emotion Categories: {categories}")

    # Process each audio file
    for category in categories:
        folder_path = os.path.join(DATASET_PATH, category)
        # Support .wav, .mp3, .m4a
        audio_files = []
        for ext in ('*.wav', '*.mp3', '*.m4a'):
            audio_files.extend(glob.glob(os.path.join(folder_path, ext)))
            
        print(f"⏳ Extracting features from {len(audio_files)} files in '{category}'...")
        
        for file in audio_files:
            feat = extract_features(file)
            if feat is not None:
                features.append(feat)
                labels.append(category)

    if not features:
        print("❌ Error: No valid audio features extracted. Check your audio files.")
        return

    # Convert to numpy arrays for Scikit-Learn
    X = np.array(features)
    y = np.array(labels)

    print(f"✅ Feature extraction complete. Total samples: {len(X)}")

    # Split into 80% Training and 20% Testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("🧠 Training Random Forest Classifier...")
    # Random Forest is highly robust for acoustic feature classification
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Evaluate the model
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print("\n📊 Model Evaluation Results:")
    print(f"Accuracy: {accuracy * 100:.2f}%\n")
    print(classification_report(y_test, predictions))

    # Save the model to disk for FastAPI
    joblib.dump(model, MODEL_OUTPUT)
    print(f"💾 Success! Model saved as '{MODEL_OUTPUT}'")
    print("You can now deploy this .pkl file with your FastAPI backend!")

if __name__ == "__main__":
    train_model()
