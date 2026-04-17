# Dhvani AI — Voice-First Accessibility Agent

<div align="center">

![Dhvani AI](https://img.shields.io/badge/Dhvani-AI-7C3AED?style=for-the-badge&logo=google-chrome&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

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

## 📁 Project Structure

```
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
```

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
