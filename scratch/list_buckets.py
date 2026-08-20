import urllib.request
import json

SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI'

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

print("Checking Supabase Storage Buckets...")
req = urllib.request.Request(f"{SUPABASE_URL}/storage/v1/bucket", headers=headers, method='GET')

try:
    with urllib.request.urlopen(req) as res:
        buckets = json.loads(res.read().decode('utf-8'))
        print("Buckets found:")
        for b in buckets:
            print(f" - ID: {b.get('id')}, Name: {b.get('name')}, Public: {b.get('public')}")
except Exception as e:
    if hasattr(e, 'read'):
        print("Error details:", e.read().decode('utf-8'))
    else:
        print("Error:", str(e))
