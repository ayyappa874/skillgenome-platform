import os
import re

directories = [
    "c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome",
    "c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/screens"
]

pattern = re.compile(r'emotionAnalysis\??\.\w+')

for directory in directories:
    if not os.path.exists(directory):
        continue
    for filename in os.listdir(directory):
        if filename.endswith(".js"):
            filepath = os.path.join(directory, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            matches = pattern.findall(content)
            if matches:
                print(f"--- File: {filename} ---")
                for match in set(matches):
                    print(f"  {match}")
