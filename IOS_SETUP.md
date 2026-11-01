# iOS Target Setup & Verification Guide

> **Target Status:** UNVERIFIED — Requires macOS environment with Xcode, CocoaPods, and Apple Developer provisioning.

This guide details the exact steps to scaffold, configure, and sign Thinking Bridge on macOS for iOS targets.

---

## 1. Prerequisites (macOS Host)
- macOS Sonoma or Sequoia with Xcode 15+ installed.
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods` or `brew install cocoapods`
- Node.js 20+ and npm installed.

---

## 2. Platform Scaffolding
Run the following commands in the root of the project:

```bash
# 1. Install Capacitor iOS package (if not already installed)
npm install @capacitor/ios

# 2. Add native iOS workspace
npx cap add ios

# 3. Build web bundle and sync native assets/plugins
npm run build
npx cap sync ios
```

---

## 3. Mandatory `Info.plist` Privacy Usage Descriptions
Apple App Store guidelines strictly require usage strings for microphone and speech recognition. Without these keys, the app will crash upon calling the native STT plugin or will be rejected by App Store review.

Open `ios/App/App/Info.plist` (or configure via Xcode Target -> Info tab) and add the following keys:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Thinking Bridge uses your microphone to practice English and Arabic speech conversation with your AI tutor.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>Thinking Bridge uses speech recognition to transcribe your voice during conversation exercises.</string>
```

---

## 4. Guarded Plugins (Android-Only Notice)
- **`capacitor-gemma-3n`**: This plugin is **Android-only**. All calls inside `src/services/localAI.ts` are guarded behind:
  ```typescript
  if (Capacitor.getPlatform() !== 'android') {
    // Graceful fallback to cloud Gemini or offline dictionary
  }
  ```
  On iOS, on-device SLM execution is safely skipped without throwing runtime crashes or unresolved symbols.

---

## 5. CocoaPods Installation & Opening Xcode
From the project root:

```bash
cd ios/App
pod install
cd ../..
npx cap open ios
```

---

## 6. Code Signing & Deployment
1. In Xcode, select the **App** project in the project navigator.
2. Navigate to **Signing & Capabilities**.
3. Check **Automatically manage signing**.
4. Select your **Apple Developer Team**.
5. Set the Bundle Identifier to `com.amrsherif.thinkingenglish` (or matching identifier).
6. Connect an iPhone via USB or select a Simulator (e.g., iPhone 15 Pro).
7. Press `Cmd + R` to build and run.

---

## 7. Verification Checklist
- [ ] `Info.plist` includes `NSMicrophoneUsageDescription`.
- [ ] `Info.plist` includes `NSSpeechRecognitionUsageDescription`.
- [ ] Microphone permission prompt appears on first tap of the mic button.
- [ ] AudioContext autoplay policy allows audio playback after user interaction.
- [ ] Offline banner correctly displays when device is in Airplane Mode.

