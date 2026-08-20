import urllib.request
import os

qr_data = "exp://10.30.25.233:8081"
url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={urllib.parse.quote(qr_data)}"

dest_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\2d5b62e8-3813-4f91-9aed-8ff55c3adbc5"
dest_path = os.path.join(dest_dir, "expo_qr.png")

print(f"Downloading QR code for: {qr_data}")
try:
    urllib.request.urlretrieve(url, dest_path)
    print(f"✅ Success! QR code saved to: {dest_path}")
except Exception as e:
    print(f"❌ Error downloading QR code: {str(e)}")
