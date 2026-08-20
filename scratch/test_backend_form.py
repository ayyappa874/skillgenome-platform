import requests
import json

url = "http://127.0.0.1:8000/api/analyze-emotion"
data = {
    "duration": "15",
    "mood": "Confident"
}

try:
    response = requests.post(url, data=data)
    print("STATUS CODE:", response.status_code)
    if response.status_code == 200:
        res_data = response.json()
        print("RESPONSE SUCCESS:")
        print(json.dumps(res_data, indent=2))
        
        # Verify fields
        print("eqScore in data:", "eqScore" in res_data)
        print("eq_score in data:", "eq_score" in res_data)
        print("aiFeedback in data:", "aiFeedback" in res_data)
        print("ai_feedback in data:", "ai_feedback" in res_data)
    else:
        print("ERROR:", response.text)
except Exception as e:
    print("CONNECTION FAILED:", str(e))
