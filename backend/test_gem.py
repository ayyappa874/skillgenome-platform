import urllib.request
import json
import base64

API_KEY = "AIzaSyA7FnBEaQK9xopkeDq-RtjbXpVkBlHhtqg"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

# Use a tiny transparent 1x1 GIF just to see if the API responds properly
dummy_base64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

payload = {
    "contents": [{
        "parts": [
            {"text": "Analyze the facial expression. Output JSON with probabilities (0.0 to 1.0) for: happy, neutral, fear, sad, angry, disgust, surprise."},
            {"inlineData": {"mimeType": "image/jpeg", "data": dummy_base64}}
        ]
    }],
    "generationConfig": {
        "response_mime_type": "application/json"
    }
}

req = urllib.request.Request(URL, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as res:
        print(res.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
