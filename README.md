# Dhvani AI — Voice-First Accessibility Agent

<div align="center">

![Dhvani AI](https://img.shields.io/badge/Dhvani-AI-7C3AED?style=for-the-badge&logo=google-chrome&logoColor=white)
![HackBLR 2026](https://img.shields.io/badge/HackBLR-2026-DB2777?style=for-the-badge)
![PS-3](https://img.shields.io/badge/PS--3-Voice%20AI%20Accessibility-0EA5E9?style=for-the-badge)

**"No screen. No keyboard. No barrier."**

[🌐 Live Demo](https://dhvani-ai-voice-agent.vercel.app) • [🎙️ Try Voice Agent](https://dhvani-ai-voice-agent.vercel.app/demo)

</div>

---

## 🎯 What is Dhvani AI?

**Dhvani** (ध्वनि) means *sound* or *voice* in Sanskrit.

Dhvani AI is a voice-first web accessibility agent built for **285 million visually impaired people** who struggle to use the internet. Users can navigate websites, read content, fill forms, search the web, and get intelligent assistance — entirely through natural voice commands.

No app download. No screen required. Just speak.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **Voice Navigation** | Navigate any website using natural voice commands |
| 📖 **Read Page Content** | AI reads and summarises any webpage aloud |
| 🔍 **Voice Search** | Search Google hands-free |
| 📝 **Form Filling** | Dictate form entries and submit by voice |
| 🌐 **Multi-language** | Hindi, Marathi, Tamil, Telugu + 30 more languages |
| 🆘 **Emergency Help** | One voice command to call family or find hospitals |
| 💬 **Memory** | Remembers full session context |
| 🤖 **Browser Control** | Real browser automation via Puppeteer |

---

## 🏗️ Architecture
User Voice Input (Web Speech API)
↓
Dhvani Frontend (React + Vite)
↓
Groq AI (LLaMA 3.3 70B)  ←→  Puppeteer Backend (Express)
↓                              ↓
Voice Response (TTS)         Real Browser Control

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| **Frontend** | React + Vite + Framer Motion + Three.js | Free |
| **Voice Input** | Web Speech API (Chrome built-in) | Free |
| **AI Brain** | Groq API — LLaMA 3.3 70B Versatile | Free tier |
| **Voice Output** | Web Speech Synthesis API | Free |
| **Browser Control** | Puppeteer (headless Chrome) | Free |
| **Backend** | Node.js + Express | Free |
| **Frontend Hosting** | Vercel | Free |
| **Backend Hosting** | Render | Free |

**Total infrastructure cost: $0**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Chrome browser (for voice features)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/saurabh-v12/Dhvani---Ai-Voice-agent-.git
cd Dhvani---Ai-Voice-agent-

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Running Locally

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Chrome.

---

## 🎮 Voice Commands

| Say this... | What happens |
|---|---|
| *"Open YouTube"* | Browser navigates to YouTube |
| *"Search for news in India"* | Google search opens |
| *"Read the page"* | AI reads current page content aloud |
| *"Scroll down"* | Page scrolls down |
| *"Go back"* | Browser goes back |
| *"Where am I?"* | AI tells you current page |
| *"Emergency help"* | Guides to call family or hospital |

---

## 📁 Project Structure
dhvani-ai/
├── src/
│   ├── components/
│   │   └── Orb/
│   │       └── GlowingOrb.jsx    # 3D Three.js orb
│   ├── pages/
│   │   ├── Landing.jsx           # Landing page
│   │   └── Demo.jsx              # Voice agent
│   ├── router.jsx                # Client-side routing
│   └── main.jsx
├── backend/
│   ├── server.js                 # Express + Puppeteer
│   └── package.json
└── package.json

---

## 🌍 Impact

- **285 million** visually impaired people worldwide
- **49 million** completely blind
- **95%** of websites fail basic accessibility standards
- **12 million+** blind citizens in India alone
- **$13 billion** accessibility tech market by 2027

---

## 👥 Team

**Team Code Verse** — HackBLR 2026

| Name | Role |
|---|---|
| **Saurabh Vishwakarma** | Team Leader & Full Stack Developer |
| **Shivam Kumar Sahu** | Developer |
| **Devanshu Gaidhane** | Developer |
| **Shreya Badge** | Developer |
| **Anshul Thombre** | Developer |

---

## 🏆 Hackathon

- **Event:** HackBLR 2026 — Bengaluru, April 26
- **Problem Statement:** PS-3: Voice AI Agent for Accessibility & Societal Impact
- **Sponsors:** VAPI, Qdrant, Pathway, TRAE

---

## 📄 License

MIT License — feel free to use and build upon this project.

---

<div align="center">

**"Accessibility isn't a feature — it's a right."**

Built with ❤️ by Team Code Verse

</div>
