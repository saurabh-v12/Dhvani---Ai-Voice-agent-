# CLAUDE.md — Friday AI Project Memory File
# This file helps Claude Code understand the complete project context.
# Always read this file first before making any changes.

---

## PROJECT OVERVIEW

**Project Name:** Friday AI
**Tagline:** "No screen. No keyboard. No barrier."
**Type:** Voice-First AI Accessibility Agent
**Purpose:** Gives visually impaired and blind users complete control of the internet through natural voice commands
**Team:** Code Verse — Leader: Saurabh Vishwakarma
**Event:** HackBLR 2026 — PS-3 (Voice AI for Accessibility)

---

## WHAT THIS PROJECT DOES

Friday AI is a voice-first web accessibility agent with 3 layers:

**Layer 1 — Voice Input**
- Uses Web Speech API built into Chrome
- User speaks naturally — no commands to memorise
- Works in Hindi, Marathi, Tamil, Telugu + 30 Indian languages

**Layer 2 — Browser Automation**
- Puppeteer controls a real Chrome browser
- Opens websites, searches Google/YouTube
- Plays videos, controls volume, mutes, pauses, skips
- Scrolls, clicks buttons, fills forms, reads pages

**Layer 3 — Vision AI**
- After every browser action takes a screenshot
- Sends to Groq LLaMA 4 Scout Vision model
- Describes exactly what's on screen in natural language
- Blind user always knows what happened

**Direct AI Answers**
- Simple questions like "what is 2+2" or "who is Virat Kohli"
- Answered directly by Groq LLaMA 3.3 70B without browser
- No browser needed for knowledge questions

---

## COMPLETE FILE STRUCTURE

```
dhvani-ai/
│
├── src/
│   ├── pages/
│   │   ├── Demo.jsx          ← MAIN VOICE AGENT UI
│   │   └── Landing.jsx       ← Landing page
│   │
│   ├── components/
│   │   └── Orb/
│   │       └── GlowingOrb.jsx ← Three.js 3D animated orb
│   │
│   ├── router.jsx            ← Client-side routing (no React Router)
│   ├── main.jsx              ← Entry point (StrictMode REMOVED - important!)
│   ├── App.jsx               ← App wrapper
│   ├── App.css               ← Global styles
│   └── index.css             ← Tailwind + custom CSS
│
├── backend/
│   ├── server.js             ← EXPRESS + PUPPETEER BACKEND
│   ├── package.json          ← Backend dependencies
│   ├── .env                  ← GROQ_API_KEY (never commit)
│   └── .gitignore            ← Ignores .env and node_modules
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── .env                      ← VITE_GROQ_API_KEY (never commit)
├── .gitignore                ← Ignores .env files
├── vercel.json               ← SPA routing fix for Vercel
├── vite.config.js            ← Vite configuration
├── package.json              ← Frontend dependencies
├── index.html                ← HTML entry point
└── README.md                 ← Project documentation
```

---

## KEY FILES EXPLAINED

### `src/pages/Demo.jsx` — Main Voice Agent
The heart of the frontend. Contains:
- `API_KEY` — Groq API key from environment variable
- `BACKEND` — URL of Puppeteer backend (localhost:3001 or ngrok URL)
- `askGroq()` — calls Groq API for AI responses
- `sendBrowserCommand()` — sends voice commands to Puppeteer backend
- `speakText()` — converts AI response to speech using Web Speech API
- `runPipeline()` — main flow: voice → Groq/browser → speak response
- `handleMicClick()` — starts/stops microphone
- `GlowingOrb` — changes colour based on state (idle/listening/thinking/speaking)
- `QuickCommands` — 6 preset command buttons
- `ConversationBubbles` — shows last 3 messages
- `HistoryDrawer` — full conversation history slide-up panel
- `ControlsBar` — mic button, mute button, history button
- `vapiRef` — Vapi SDK instance (initialised in POLL BACKEND STATUS useEffect, errors caught silently, does NOT replace Web Speech API)

**Orb States:**
- `idle` — blue, tap to speak
- `listening` — pink/red, mic active
- `thinking` — yellow, processing
- `speaking` — green, reading response

**CRITICAL:** StrictMode is REMOVED from main.jsx — adding it back breaks SpeechRecognition (double init bug)

### `backend/server.js` — Puppeteer Browser Control
The backend that controls a real Chrome browser. Contains:

**Key functions:**
- `initBrowser()` — launches Puppeteer Chrome
- `getPage()` — ensures page is alive, recovers if dead
- `safeTitle()` — safely gets page title without crashing
- `getScreenshot()` — takes JPEG screenshot for Vision AI
- `askGroqVision()` — sends screenshot to LLaMA 4 Scout, gets description
- `askGroqDirect()` — answers simple questions without browser
- `saveMemory()` — fire-and-forget: saves command+result to Qdrant; silently skipped if Qdrant is unreachable

**Commands handled:**
- Navigate/Open — 15 preset sites + domain matching
- Search — smart routing (YouTube vs Google based on context)
- Play first video — YouTube video selector
- Mute/Unmute — direct video element control
- Volume up/down — video.volume manipulation
- Pause/Resume — video.pause() / video.play()
- Skip forward/Rewind — video.currentTime += 10
- Fullscreen — keyboard press 'f'
- Read page — extracts title, h1s, paragraphs
- Click/Tap — finds elements by text/aria-label
- Scroll — window.scrollBy
- Type — keyboard.type
- Go back — page.goBack()
- Refresh — page.reload()

**Vision AI flow:**
After every browser action:
1. Wait 800ms for page to settle
2. Take JPEG screenshot (55% quality, 1280x800)
3. Send to Groq LLaMA 4 Scout Vision
4. Get natural language description
5. Return to frontend as the response

**Direct AI detection:**
Checks if command contains question words (what is, who is, how much, etc.)
AND does NOT contain browser trigger words (open, search, play, etc.)
If yes → answers directly without browser

### `src/components/Orb/GlowingOrb.jsx` — 3D Orb
Three.js animated sphere that:
- Changes colour based on orb state
- Has particle effects and glow
- Exports `ORB_STATE_CONFIG` with color/accent per state

### `src/router.jsx` — Custom Router
Simple hash-based router (no React Router dependency)
- `Link` component for navigation
- Routes: `/` → Landing, `/demo` → Demo

### `vercel.json` — SPA Routing Fix
```json
{"rewrites": [{"source": "/(.*)", "destination": "/"}]}
```
Without this, refreshing `/demo` gives 404 on Vercel.

---

## TECH STACK

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React + Vite | Free |
| 3D Orb | Three.js | Free |
| Animations | Framer Motion | Free |
| Styling | Tailwind CSS | Free |
| Voice Input | Web Speech API | Free |
| Voice Output | Speech Synthesis API | Free |
| Voice Pipeline (optional) | Vapi (`@vapi-ai/web`) | Free tier |
| Browser Control | Node.js + Puppeteer | Free |
| API Server | Express.js | Free |
| AI Language | Groq — LLaMA 3.3 70B | Free tier |
| AI Vision | Groq — LLaMA 4 Scout | Free tier |
| Conversation Memory (optional) | Qdrant (`@qdrant/js-client-rest`) | Free tier |
| Frontend Host | Vercel | Free |
| Backend Tunnel | ngrok | Free |
| Version Control | GitHub | Free |

**Total cost: ₹0**

---

## ENVIRONMENT VARIABLES

### Frontend `.env` (in dhvani-ai root):
```
VITE_GROQ_API_KEY=...
VITE_VAPI_KEY=...          ← Vapi public key (optional — leave blank to disable)
```

### Backend `.env` (in dhvani-ai/backend):
```
GROQ_API_KEY=...
QDRANT_URL=...             ← Qdrant cluster URL (optional — falls back to localhost:6333)
QDRANT_API_KEY=...         ← Qdrant API key (optional — leave blank for local instance)
```

**In Demo.jsx:**
```js
const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const BACKEND = 'http://localhost:3001' // change to ngrok URL for remote demos
```

**In server.js:**
```js
require('dotenv').config()
const GROQ_KEY = process.env.GROQ_API_KEY
```

---

## DEPLOYMENT

### Frontend — Vercel
- URL: `https://dhvani-ai-voice-agent.vercel.app`
- Auto-deploys from GitHub main branch
- Environment variable set in Vercel dashboard: `VITE_GROQ_API_KEY`

### Backend — Local + ngrok
- Run locally: `node server.js` in backend folder
- Expose via ngrok: `.\ngrok http 3001`
- Current ngrok URL: `https://gerda-wakeful-roseately.ngrok-free.dev`
- Update `BACKEND` in Demo.jsx when ngrok URL changes

### GitHub Repo
- URL: `https://github.com/saurabh-v12/Dhvani---Ai-Voice-agent-.git`
- Branch: main

---

## HOW TO RUN LOCALLY

**Terminal 1 — Backend:**
```bash
cd S:\HackBlg\CascadeProjects\windsurf-project\dhvani-ai\backend
node server.js
```
Should show:
```
✅ Browser ready
🚀 Friday backend on port 3001
```

**Terminal 2 — ngrok (for remote access):**
```bash
cd C:\Users\vishw\Downloads\ngrok-v3-stable-windows-amd64
.\ngrok http 3001
```

**Terminal 3 — Frontend:**
```bash
cd S:\HackBlg\CascadeProjects\windsurf-project\dhvani-ai
npm run dev
```
Open: `http://localhost:5173/demo`

---

## GIT WORKFLOW

```bash
# Regular push
git add .
git commit -m "message"
git push origin main

# If API key blocked
git checkout --orphan clean-main
git add .
git commit -m "clean push"
git branch -D main
git branch -m main
git push -f origin main

# If conflict after GitHub edit
git pull origin main --rebase
git push origin main
```

---

## KNOWN ISSUES & FIXES

| Issue | Fix |
|---|---|
| SpeechRecognition double init | Remove StrictMode from main.jsx |
| Page title crash (detached frame) | Use safeTitle() function always |
| Chrome not found on Windows | Run `npx puppeteer browsers install chrome` |
| Backend offline after tab close | getPage() auto-recovers with fresh tab |
| ngrok auth error | Run `ngrok config add-authtoken YOUR_TOKEN` |
| GitHub blocks API key push | Use orphan branch or allow secret URL |
| 404 on Vercel refresh | vercel.json rewrite rule |
| headless:false crashes on server | Use headless:true + remove --single-process |

---

## GROQ API MODELS USED

| Model | Purpose | Cost |
|---|---|---|
| `llama-3.3-70b-versatile` | Language understanding, direct answers | Free tier |
| `meta-llama/llama-4-scout-17b-16e-instruct` | Vision AI — sees screenshots | Free tier |

---

## DEMO SCRIPT (for presentations)

1. Say **"Open YouTube"** → Chrome opens YouTube
2. Say **"Search Arijit Singh songs"** → YouTube searches
3. Say **"Play the first video"** → video plays
4. Say **"Mute"** → muted instantly
5. Say **"What is the capital of India?"** → answers directly

**Key talking points:**
- Vision AI literally sees the screen and describes it
- Zero cost infrastructure
- Works in 30+ Indian languages
- No app download needed

---

## BUSINESS MODEL

**B2G** — Government accessibility contracts (RPWD Act 2016)
**B2B** — Enterprise white-labeling for banks, hospitals
**B2C** — Premium subscription ₹99/month

**Unit economics:**
- Cost per session: ₹2.50 (10 commands × ₹0.25)
- Revenue per user: ₹99/month
- Margin: 97%+

---

## FUTURE ROADMAP

1. Browser extension — works on any website automatically
2. React Native mobile app with always-on wake word
3. WhatsApp voice bot for feature phones
4. Government portal integration — DigiLocker, UMANG
5. Self-hosted fine-tuned LLaMA 3B — zero API cost
6. Friday Browser — full Electron-based browser for blind users
7. NVIDIA Riva TTS — more natural Indian voice

---

## IMPORTANT NOTES FOR CLAUDE CODE

1. **Never add StrictMode back** to main.jsx — breaks SpeechRecognition
2. **Always use safeTitle()** — never call p.title() directly
3. **headless: false** for local demo (shows Chrome window)
4. **headless: true** for cloud deployment (no screen on server)
5. **BACKEND constant** in Demo.jsx must match where server.js is running
6. **Vision AI** adds ~1-2 seconds to every response — acceptable for accessibility
7. **Direct answer detection** must check browser triggers first to avoid false matches
8. **Groq free tier** = 14,400 requests/day — enough for demo
9. **ngrok URL changes** every session on free plan — update Demo.jsx each time
10. **vercel.json** must stay in root — removing it breaks /demo route on refresh
11. **Vapi is additive** — initialised once in POLL BACKEND STATUS useEffect; errors caught silently; does NOT replace or touch Web Speech API
12. **Qdrant is additive** — `saveMemory()` is fire-and-forget called just before `res.json()`; empty catch means it never breaks the main command flow; collection `friday_memory` must exist in Qdrant before writes succeed

---

*Last updated: 26 April 2026*
*Project by Team Code Verse — Saurabh Vishwakarma*
