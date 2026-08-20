import urllib.request
import json
import random

SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI'

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
}

# Generate a random test email
random_id = random.randint(1000, 9999)
test_email = f"test_otp_{random_id}@yopmail.com"
test_password = "TestPassword123!"

print(f"Attempting to sign up test user: {test_email} ...")

payload = {
    "email": test_email,
    "password": test_password
}

req = urllib.request.Request(
    f"{SUPABASE_URL}/auth/v1/signup",
    data=json.dumps(payload).encode('utf-8'),
    headers=headers,
    method='POST'
)

try:
    with urllib.request.urlopen(req) as res:
        response_data = json.loads(res.read().decode('utf-8'))
        print("\n[SUCCESS] Signup request accepted by Supabase!")
        print("Response Code:", res.status)
        
        # Check if the user needs confirmation
        user = response_data.get("user", {})
        confirmation_sent = response_data.get("confirmation_sent", False)
        identities = user.get("identities", [])
        
        print(f"User ID: {user.get('id')}")
        print(f"Is Email Confirmed?: {user.get('email_confirmed_at') is not None}")
        
        if not user.get('email_confirmed_at'):
            print("\nVerification status: PENDING.")
            print("Supabase has initiated the email OTP flow. Please check if an email arrives!")
        else:
            print("\nVerification status: AUTO-CONFIRMED (Email confirmation is disabled in Supabase).")
            
except urllib.error.HTTPError as e:
    print("\n[FAILED] Supabase rejected the signup request.")
    print("HTTP Error Code:", e.code)
    try:
        error_detail = json.loads(e.read().decode('utf-8'))
        print("Error Message:", error_detail.get("msg", error_detail))
    except:
        print("Could not parse error message.")
except Exception as e:
    print(f"\n[ERROR] General exception: {str(e)}")
