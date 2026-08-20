import os
import re

directories = [
    "c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome",
    "c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/screens"
]

for d in directories:
    if not os.path.exists(d):
        continue
    for f in os.listdir(d):
        if f.endswith(".js"):
            path = os.path.join(d, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            if "Device Setup" in content or "device setup" in content or "DeviceSetup" in content:
                print(f"Device Setup matches in file: {f}")
            if "Password" in content or "password" in content:
                # print some files with passwords
                if "signIn" in content or "Login" in content or "LoginScreen" in f or "Screen4" in f:
                    print(f"Login/Password matches in file: {f}")
