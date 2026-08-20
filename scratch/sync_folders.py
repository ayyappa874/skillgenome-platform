import os
import shutil

src_root = "c:/Users/Ayyappa/Desktop/skill - Copy"
dst_root = "c:/Users/Ayyappa/Desktop/skill"

files_to_sync = [
    "backend/main.py",
    "backend/train_emotion_model.py",
    "backend/emotion_model.pkl",
    "skillgenome/App.js",
    "skillgenome/screens/Screen3.js",
    "skillgenome/screens/Screen4.js",
    "skillgenome/screens/Screen10.js",
    "skillgenome/screens/RegisterScreen.js",
    "skillgenome/screens/SettingsScreen_uipro.js",
    "skillgenome/screens/Divs28.js",
    "skillgenome/screens/MockInterviewScreen.js",
    "skillgenome/screens/JobMatchesScreen.js",
    "skillgenome/screens/Divs29.js",
    "skillgenome/scratch/create_emotions_table.sql"
]

print("Starting synchronization to mirrored workspace...")
for rel_path in files_to_sync:
    src_file = os.path.join(src_root, rel_path)
    dst_file = os.path.join(dst_root, rel_path)
    
    if os.path.exists(src_file):
        # Create destination directory if it doesn't exist
        os.makedirs(os.path.dirname(dst_file), exist_ok=True)
        # Copy file
        shutil.copy2(src_file, dst_file)
        print(f"Synced: {rel_path}")
    else:
        print(f"Warning: Source file not found: {rel_path}")

print("Workspace sync complete!")
