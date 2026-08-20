import urllib.request
import json

SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI'

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Query conversations
print("Querying conversations...")
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/conversations?limit=5", headers=headers)
conv_id = None
try:
    with urllib.request.urlopen(req) as res:
        convs = json.loads(res.read().decode('utf-8'))
        print("GET conversations status:", res.status)
        print("Conversations found:", len(convs))
        if convs:
            conv_id = convs[0]['id']
            print("Using conversation ID:", conv_id)
except Exception as e:
    print("GET conversations error:", e)

# 2. Query profiles
print("\nQuerying profiles...")
req_p = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/profiles?limit=5", headers=headers)
profile_id = None
try:
    with urllib.request.urlopen(req_p) as res:
        profs = json.loads(res.read().decode('utf-8'))
        print("Profiles found:", len(profs))
        if profs:
            profile_id = profs[0]['id']
            print("Using sender profile ID:", profile_id)
except Exception as e:
    print("GET profiles error:", e)

if not conv_id or not profile_id:
    print("\nCannot test insert, missing conversation or profile.")
    exit(0)

# 3. Try to insert a test message
payload = {
    "conversation_id": conv_id,
    "sender_id": profile_id,
    "text": "Hello, this is a live test message!"
}
print(f"\nInserting test message into conversation {conv_id} from sender {profile_id}...")
req2 = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/messages", 
    data=json.dumps(payload).encode('utf-8'),
    headers=headers,
    method='POST'
)
try:
    with urllib.request.urlopen(req2) as res:
        print("POST messages status:", res.status)
        print("POST messages data:", json.loads(res.read().decode('utf-8')))
except Exception as e:
    if hasattr(e, 'read'):
        print("POST messages error detail:", e.read().decode('utf-8'))
    else:
        print("POST messages error:", e)
