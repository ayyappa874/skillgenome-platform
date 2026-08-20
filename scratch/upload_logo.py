import urllib.request
import json
import os

SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI'
LOGO_PATH = r"C:\Users\ASUS\Desktop\skill - Copy\skillgenome\assets\logo.png"

# Setup Authorization headers
headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
}

# 1. Attempt to create the public bucket 'assets'
print("Step 1: Checking/Creating 'assets' public bucket in Supabase storage...")
bucket_payload = {
    "id": "assets",
    "name": "assets",
    "public": True,
    "file_size_limit": 52428800,  # 50MB
    "allowed_mime_types": ["image/png", "image/jpeg", "image/svg+xml"]
}

req_bucket = urllib.request.Request(
    f"{SUPABASE_URL}/storage/v1/bucket",
    data=json.dumps(bucket_payload).encode('utf-8'),
    headers={**headers, 'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req_bucket) as res:
        print("-> Bucket created successfully!")
except urllib.error.HTTPError as e:
    if e.code == 409:
        print("-> Bucket 'assets' already exists.")
    else:
        print(f"-> Error checking/creating bucket: Code {e.code}, message: {e.read().decode('utf-8')}")
except Exception as e:
    print("-> Error creating bucket:", str(e))

# 2. Upload the logo.png file
if not os.path.exists(LOGO_PATH):
    print(f"Error: Logo file not found at {LOGO_PATH}")
    exit(1)

print("\nStep 2: Uploading logo.png to Supabase Storage assets/logo.png...")
with open(LOGO_PATH, "rb") as f:
    file_data = f.read()

req_upload = urllib.request.Request(
    f"{SUPABASE_URL}/storage/v1/object/assets/logo.png",
    data=file_data,
    headers={
        **headers,
        'Content-Type': 'image/png',
        'x-upsert': 'true'  # Overwrite if exists
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req_upload) as res:
        print("-> Logo uploaded successfully!")
        print(f"-> Public URL: {SUPABASE_URL}/storage/v1/object/public/assets/logo.png")
except urllib.error.HTTPError as e:
    print(f"-> Upload failed: Code {e.code}, details: {e.read().decode('utf-8')}")
except Exception as e:
    print("-> Error uploading logo:", str(e))
