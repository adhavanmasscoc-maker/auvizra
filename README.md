# Auvizra — Universal Visual Companion

> **Speak / Type → Understand → Find Visuals → Display Slideshow → Save Study Session.**

**Auvizra** is a real-time, browser-based AI voice-to-visual companion built for students, researchers, developers, and lifelong learners. As you speak aloud or type any topic, Auvizra transcribes speech, extracts core concepts using a sliding context NLP window, queries high-resolution educational media, generates on-the-fly AI schematics, and drives an adaptive, high-contrast slideshow.

---

## ⚡ Key Highlights & Architecture

```
[ User Voice / Typed Text ]
            │
            ▼
[ Continuous Microphone Stream & Waveform ] (Web Speech API + Web Audio API)
            │
            ▼
[ Sliding Context Intelligence ] (Gemini 1.5 Flash + Universal Semantic Engine)
            │
            ├── Topic & Subtopic Resolution (Universal domain support)
            ├── Stopword & Profanity Filter (Clean badges & timeline)
            ├── Concept Badge Extraction & Auto-Recall Quiz
            └── Multi-Variant Search Expansion
            │
            ▼
[ 4-Tier Zero-Broken-Image Waterfall ]
            │
            ├── Tier 1: Wikipedia PageImages API + Openverse API + Wikimedia Commons
            ├── Tier 2: Pollinations.ai Dynamic Technical AI Diagrams
            ├── Tier 3: Auvizra Dynamic Vector Engine (SVG schematics & hierarchies)
            └── Tier 4: Client-side Deterministic SVG Schematics (3500ms Watchdog)
            │
            ▼
[ Relevance Gate & Auto-Proxy ]
            │
            ├── Strict keyword boundaries (Zero unrelated naval/generic charts)
            ├── Safe image proxy with descriptive User-Agent & HTTP 200 SVG fallback
            │
            ▼
[ Studio Canvas Slideshow Viewport ] (Framer Motion)
            │
            ├── ⚪ Light Canvas: Crisp white studio backdrop for black-ink diagrams & transparent SVGs
            ├── Auto Adaptive: Intelligent contrast detection
            ├── ⚫ OLED Dark: Deep OLED contrast for astronomy & dark-mode vectors
            └── 📐 Blueprint Grid: Engineering schematic backdrop
```

---

## 🚀 Features

### 1. 4-Tier Visual Waterfall (Zero Broken Images)
- **Tier 1 (Verified Knowledge Media)**: Authentic photography, diagrams, and historical overviews from Wikipedia PageImages, Openverse, and Wikimedia Commons.
- **Tier 2 (On-Demand AI Diagrams)**: High-definition technical infographics generated dynamically via Pollinations.ai.
- **Tier 3 (Auvizra Dynamic Vector Schematics)**: High-contrast node-link architectures, component hierarchies, and spatial context maps rendered with responsive SVG viewports.
- **Tier 4 (Fail-Safe Client Schematics)**: 3500ms watchdog timer automatically synthesizes local vector schematics if network connections stall.

### 2. Universal Topic Intelligence & Clean Badges
- **Universal Domain Support**: Seamlessly classifies queries across computer science, electronics, medicine, geography, nature, pop culture, and daily life.
- **Grammatical Integrity**: Eliminates mid-sentence subtitle cutoffs (e.g. trailing "Using A").
- **Content & Profanity Guardrails**: Automatic filtering keeps study timelines and concept pills clean.

### 3. Studio Canvas Modes
- **⚪ Light**: Crisp white studio backdrop for black-ink diagrams and transparent SVGs.
- **Auto**: Automatically provides white backing for transparent diagrams so black text is always readable.
- **⚫ Dark**: High-contrast OLED dark theme for glowing vector schematics.
- **📐 Grid**: Technical blueprint grid for engineering diagrams.

---

## 🌐 Live Production Deployments (Vercel)

- **Primary**: [https://auvizra.vercel.app](https://auvizra.vercel.app)
- **AI Domain**: [https://auvizra-ai.vercel.app](https://auvizra-ai.vercel.app)
- **Studio Domain**: [https://auvizra-studio.vercel.app](https://auvizra-studio.vercel.app)
- **AKNEX Ecosystem**: [https://aknex-auvizra.vercel.app](https://aknex-auvizra.vercel.app)
- **Vozqura**: [https://vozqura.vercel.app](https://vozqura.vercel.app)
- **Kynviz**: [https://kynviz.vercel.app](https://kynviz.vercel.app)
- **Zynqviz**: [https://zynqviz.vercel.app](https://zynqviz.vercel.app)

---

## 🛠️ Development & Quickstart

```bash
# Clone the repository
git clone https://github.com/adhavanmasscoc-maker/auvizra.git
cd auvizra

# Install dependencies
npm install
cd client && npm install && cd ..

# Start backend (port 5000)
node server/server.js

# Start frontend dev server (port 5173)
cd client && npm run dev
```

---

## 📄 License

MIT License — Created by **Aadhavan K, B.E., M.Tech., Ph.D.**
