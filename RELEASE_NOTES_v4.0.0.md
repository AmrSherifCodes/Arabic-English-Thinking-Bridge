# 🚀 Thinking Bridge v3.1.0 — Public Release Notes

> **"Stop Translating. Start Thinking in 10+ Languages."**
> The open-source, AI-powered cognitive bridge for Arabic speakers learning global languages natively without word-for-word translation.

---

### 🌟 Key Highlights & Feature Overhaul

#### 1. 🧠 Multi-Language Cognitive Rewiring (10+ Languages)
- **27 Adaptive Levels Across A0–C2**: Built-in curriculum mapping L1 structural transfer rules for **English, German, Japanese, Spanish, French, Italian, Chinese, Turkish, Russian, and Korean**.
- **Interactive Adaptive Placement**: 3-question diagnostic reflex test measuring copula omission, conditionals, and corporate hedging to automatically place learners in their exact CEFR stage.
- **SM-2 Spaced Repetition Engine**: Integrated 4,090+ card retention vault with zero-login, local-first storage.

#### 2. 🎙️ Real-Time Voice AI Coach & Audio Engine
- **Cross-Platform MediaRecorder STT**: Universal audio recording pipeline with Voice Activity Detection (VAD) for automatic 1.5s silence finalization.
- **Instant Automatic Barge-In**: Interrupt Amr (the AI coach) at any moment while speaking; the system cancels TTS playback instantly and listens.
- **Client-Side Gemini 2.5 Flash**: Direct, low-latency streaming utilizing `@google/genai` in the browser.
- **LTR English Sentence Word Alignment**: Corrected bidirectional rendering on English voice chips for natural left-to-right reading order in RTL mode.

#### 3. 🔑 Bring Your Own Key (BYOK) Model
- **Unlimited Free AI Access**: Option to save your personal Gemini API key from Google AI Studio (`tb.userApiKey`) directly in Settings.
- **1-Minute Interactive BYOK Guide**: Built-in modal with direct links and 2-step setup.
- **Strict Local Vault**: API keys are stored 100% locally on device and never logged or transmitted to central servers.
- **Rate-Limit Fallback**: Generous 3 req/day free IP tier with smooth, automatic fallback to the offline deterministic conversational engine on limit hit (`FREE_LIMIT_REACHED`).

#### 4. 🎨 World-Class Landing Page & Route Separation
- **Route Separation (`/` vs `/app`)**: Dedicated marketing landing page at `/` with direct single-click launch to `/app`.
- **CRO Features**: Dynamic CTA buttons ("Resume Learning Deutsch 🇩🇪 🚀"), 10-language animated marquee, 3D tilt feature cards (`TiltCard`), and 3-step visual timeline.
- **Interactive 3D Mouse Parallax**: Glassmorphic ambient background orb with mobile/touchscreen performance guards.
- **YouTube Bridge Modal**: 16:9 embedded video player container for the 15-minute documentary launch with channel subscribe affordances.

#### 5. ⚡ Performance & Cross-Platform Support
- **Vite Rollup Code-Splitting**: Manual vendor chunking (`react-vendor`, `gemini-sdk`, `curriculum-data`, `supabase-vendor`, `icons-vendor`, `capacitor-vendor`) reducing main bundle to **196 KB**.
- **Tauri v2 Windows Desktop**: Full scaffold with native Rust build hooks (`Cargo.toml`, `lib.rs`, `main.rs`) and WebView2 microphone capabilities (`capabilities/default.json`).
- **Capacitor Mobile Native**: Android APK v3.1.0 build with release signing configuration (`keystore.properties`) and safe-area insets.
- **iOS & Desktop PWA**: Standalone PWA support with service worker precaching.
- **SEO & JSON-LD**: Embedded `SoftwareApplication` Google Structured Data and Open Graph image tags (`og-image.jpg`).

---

### 📦 Installation & Links

- 🌐 **Web Application**: [https://tb-eg.vercel.app/app](https://tb-eg.vercel.app/app)
- 📲 **Android APK Download**: [https://tb-eg.vercel.app/download](https://tb-eg.vercel.app/download)
- 🐙 **GitHub Repository**: [https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge](https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge)
- 🎬 **YouTube Channel**: [@SciAmrSherif](https://www.youtube.com/@SciAmrSherif?sub_confirmation=1)

---

### 👨‍💻 Author & License
Crafted with ❤️ in **Alexandria, Egypt 🇪🇬** by **Amr Sherif**.  
Released as 100% Free & Open Source under CC0 1.0 Public Domain & MIT License.
