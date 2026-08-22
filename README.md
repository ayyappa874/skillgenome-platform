# SkillGenome

## 🌍 Universal Architecture
**SkillGenome uses a Unified Universal Architecture.** 
The `skillgenome-mobile` directory is the **single source of truth** for both the iOS/Android Mobile App and the Web Application. It is powered by Expo and React Native Web. 

> **Note:** The `skillgenome-web` directory is deprecated and non-functional. Do not use it. All web compilation happens natively via the `skillgenome-mobile` folder.

## 🚀 Running the App
To start the application for both Web and Mobile testing:
```bash
cd skillgenome-mobile
npm run web
```

## 🧪 Isolated E2E Testing
Testing is performed via the Zero-Touch Sandbox located in `skillgenome-e2e-tests`. This ensures zero dependency conflicts with the core React Native application.
```bash
cd skillgenome-e2e-tests
npx playwright test --ui
```
