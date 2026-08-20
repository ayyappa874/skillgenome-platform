import os
import cv2
import numpy as np
import base64
import joblib

base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'vision_model.pkl')

class EmotionAnalyzer:
    def __init__(self):
        self.model = None
        self.class_indices = None
        self.emotion_labels = {}
        # Using Haar Cascade for fast, local face detection
        self.face_cascade = cv2.CascadeClassifier(os.path.join(base_dir, 'haarcascade_frontalface_default.xml'))
        self._load_resources()
        
    def _load_resources(self):
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            # Random Forest classes usually correspond to the labels we trained it on
            if hasattr(self.model, 'classes_'):
                self.emotion_labels = {i: str(cls).lower() for i, cls in enumerate(self.model.classes_)}
                print(f"[AI-Pipeline] Loaded Vision Model for real-time inference. Classes: {self.emotion_labels}")
            else:
                self.emotion_labels = {0: 'angry', 1: 'disgust', 2: 'fear', 3: 'happy', 4: 'neutral', 5: 'sad', 6: 'surprise'}
        else:
            print(f"[Warning] Model not found at {model_path}. Please run train_vision_model.py first.")

    def analyze_base64(self, base64_str):
        """
        Uses the local Scikit-Learn Vision Model to quickly analyze the facial expression.
        Returns Confident and Stressed scores for the Mock Interview Screen.
        """
        if self.model is None:
            return {"error": "Local Vision model not loaded. Run train_vision_model.py."}
            
        try:
            # Strip data:image header if present
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]
                
            # Decode base64 to numpy array
            img_data = base64.b64decode(base64_str)
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"error": "Failed to decode base64 image"}

            # Convert to grayscale for Haar Cascade and ML Model
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Detect face
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
            if len(faces) == 0:
                # Fallback to the center of the image if no face detected
                h, w = gray.shape
                face_roi = gray[h//4:3*h//4, w//4:3*w//4]
            else:
                # Use the largest face
                x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])
                face_roi = gray[y:y+h, x:x+w]
                
            # Preprocess for Random Forest (48x48, flattened, normalized)
            img_resized = cv2.resize(face_roi, (48, 48))
            feature = (img_resized.flatten() / 255.0).reshape(1, -1)
            
            # Predict probabilities
            if hasattr(self.model, 'predict_proba'):
                predictions = self.model.predict_proba(feature)[0]
                emotion_probs = {self.emotion_labels[i]: float(prob) for i, prob in enumerate(predictions)}
            else:
                return {"error": "Model does not support predict_proba."}
                
            # Ensure all keys exist
            for k in ['happy', 'neutral', 'fear', 'sad', 'angry', 'disgust', 'surprise']:
                if k not in emotion_probs:
                    emotion_probs[k] = 0.0
                    
            happy = emotion_probs.get('happy', 0)
            neutral = emotion_probs.get('neutral', 0)
            fear = emotion_probs.get('fear', 0)
            sad = emotion_probs.get('sad', 0)
            angry = emotion_probs.get('angry', 0)
            disgust = emotion_probs.get('disgust', 0)
            surprise = emotion_probs.get('surprise', 0)
            
            # Derived Metrics Formulas
            confident_raw = (happy * 0.45) + (neutral * 0.25) - (fear * 0.15) - (sad * 0.10) - (angry * 0.05)
            stressed_raw = (fear * 0.35) + (angry * 0.30) + (disgust * 0.20) - (happy * 0.15) - (neutral * 0.10)
            
            # Normalize to 0-100 scale for UI
            def normalize_score(raw, min_val=-0.3, max_val=0.7):
                scaled = ((raw - min_val) / (max_val - min_val)) * 100
                return max(0, min(100, int(scaled)))

            confident_score = normalize_score(confident_raw, min_val=-0.3, max_val=0.7)
            stressed_score = normalize_score(stressed_raw, min_val=-0.25, max_val=0.85)
            
            dominant_emotion = max(emotion_probs, key=emotion_probs.get)
            
            return {
                "dominant_base_emotion": dominant_emotion,
                "base_probabilities": emotion_probs,
                "derived_metrics": {
                    "confident_score": confident_score,
                    "stressed_score": stressed_score,
                    "burnout_risk": "HIGH" if stressed_score > 65 else "MEDIUM" if stressed_score > 30 else "LOW"
                }
            }
            
        except Exception as e:
            print(f"[EmotionAnalyzer] Error processing base64 image: {str(e)}")
            return {"error": str(e)}
