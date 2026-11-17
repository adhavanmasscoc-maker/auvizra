# Auvizra — AI Visual Study Companion (Powered by Vizora Engine)

> **Speak / Type → Understand → Find Visuals → Display Slideshow → Save Study Session.**

**Auvizra** is a real-time, browser-based AI voice-to-visual companion built for students, researchers, developers, and lifelong learners. As you speak aloud or type any topic, Auvizra transcribes speech, extracts core concepts using a sliding context NLP window, queries high-resolution educational media from Wikimedia Commons, generates zero-latency vector schematics, and drives an adaptive, high-contrast slideshow.

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
            ├── Concept Badge Extraction & Auto-Recall Quiz
            └── Multi-Variant Search Expansion
            │
            ▼
[ Dual Visual Pipeline ]
            │
            ├── 1. Vizora Vector Engine: High-fidelity SVG schematics & structural hierarchy
            └── 2. Wikimedia Commons API: Real photography, diagrams, and historical overviews
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

### 1. Dual Visual Engine (Wikimedia + Dynamic Vectors)
- **Always Dual**: Every topic returns both authentic Wikimedia Commons photography/diagrams AND dedicated Vizora SVG vector schematics.
- **Zero Broken Visuals**: If external CDN requests are blocked or rate-limited, the system seamlessly serves guaranteed vector diagrams.
- **Sparsity Expansion**: For rare, hyper-local, or specialized terms (e.g. `Anaipadi Village`), the engine automatically expands queries (`Tamil Nadu village landscape`) and synthesizes specialized regional & structural schematics so the deck always contains 6–8 rich slides.

### 2. Auto-Contrast Studio Canvas
- Many technical diagrams from Wikimedia Commons use transparent backgrounds with black ink. Over dark themes, these lines become invisible.
- Auvizra features an **Auto-Contrast Studio Card** that automatically mounts transparent diagrams onto a crisp white studio card (`⚪ Light`), ensuring razor-sharp contrast for every circuit, arrow, and label.

### 3. Persistent User-Controlled Microphone
- Web Speech API runs in continuous mode (`MIC ON`), persisting across slides and queries until you click `MIC OFF`.
- Concurrently supports instant text typing via the quick visualize bar.

### 4. Dual Operating Modes
- **🎓 Study Mode**: Focuses on architecture diagrams, schematics, recall quizzes, and concept notes.
- **🌐 All Topics**: Universal visual companion for vehicles, animals, landmarks, astronomy, machinery, and daily life.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Multer, `@google/generative-ai`
- **Speech**: Continuous Web Speech API + Web Audio API AnalyserNode + OpenAI Whisper endpoint
- **Intelligence**: Google Gemini 1.5 Flash + Universal Offline Semantic NLP Engine
- **Visuals**: Wikimedia Commons API + Custom Vizora Dynamic SVG Vector Engine
- **Deployment**: Vercel Serverless Functions (`api/index.js`) + Static Edge CDN

---

## 📦 Deployment on Vercel

Auvizra is pre-configured for fullstack single-click deployment on [Vercel](https://vercel.com/):

```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Deploy to production
vercel --prod
```

### Subdomain Recommendations (.vercel.app)
Attach any of these high-trend subdomains in **Vercel Project Settings → Domains**:

1. `auvizra.vercel.app`
2. `auvizra-ai.vercel.app`
3. `auvizra-studio.vercel.app`
4. `aknex-auvizra.vercel.app`
5. `vozqura.vercel.app`
6. `kynviz.vercel.app`
7. `zynqviz.vercel.app`
8. `voxdeck.vercel.app`
9. `echodeck.vercel.app`
10. `voxlens.vercel.app`

---

## 💻 Local Development

```bash
# Run backend server (Port 5000)
npm run dev:server

# Run client dev server (Port 5173)
npm run dev:client
```

Open `http://localhost:5173` to explore in real-time.

---

## 📄 License

MIT License. Educational visuals and Wikimedia Commons media subject to respective Creative Commons / Public Domain licenses.
