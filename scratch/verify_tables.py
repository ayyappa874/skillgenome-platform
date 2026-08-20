import urllib.request
import json

SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI'

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

tables = [
    "profiles",
    "journals",
    "emotions",
    "posts",
    "messages",
    "conversations",
    "mentorship_requests",
    "mentor_reviews",
    "mentorship_sessions",
    "mentorship_recommendations",
    "genome_scores",
    "quizzes",
    "quiz_results"
]

print("Starting Supabase Database Verification...\n")

for table in tables:
    url = f"{SUPABASE_URL}/rest/v1/{table}?limit=1"
    req = urllib.request.Request(url, headers=headers, method='GET')
    try:
        with urllib.request.urlopen(req) as res:
            print(f"[OK] Table '{table}': EXISTS (Status 200)")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"[MISSING] Table '{table}': MISSING or ACCESSIBLE ONLY BY SECURE ROLES (Status 404)")
        elif e.code == 401:
            print(f"[AUTH ERROR] Table '{table}': AUTH ERROR (Status 401)")
        else:
            print(f"[ERROR] Table '{table}': ERROR {e.code} ({e.reason})")
    except Exception as e:
        print(f"[ERROR] Table '{table}': General error: {str(e)}")

print("\nVerification Complete.")
