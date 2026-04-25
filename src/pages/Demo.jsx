import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from '../router.jsx'
import GlowingOrb, { ORB_STATE_CONFIG } from '../components/Orb/GlowingOrb.jsx'

const STATE_META = {
  idle:      { label: 'Tap to speak' },
  listening: { label: 'Listening…' },
  thinking:  { label: 'Thinking…' },
  speaking:  { label: 'Speaking…' },
}

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const BACKEND = 'http://localhost:3001'

const VOICE_PROFILES = {
  woman: { rate: 0.88, pitch: 1.05 },
  man:   { rate: 0.80, pitch: 0.85 },
  soft:  { rate: 0.75, pitch: 1.15 },
}

const MALE_VOICE_NAMES = ['Daniel', 'Alex', 'Fred', 'Ralph', 'Google UK English Male', 'Microsoft David', 'David', 'Mark', 'Tom']

function pickVoice(voices, key) {
  if (!voices.length) return null
  if (key === 'woman') {
    return (
      voices.find(v => v.name === 'Google UK English Female') ||
      voices.find(v => v.name.includes('Microsoft Zira') && !v.name.includes('Desktop')) ||
      voices.find(v => v.name.includes('Samantha')) ||
      voices.find(v => v.lang.startsWith('en') && !MALE_VOICE_NAMES.some(n => v.name.includes(n))) ||
      null
    )
  }
  if (key === 'man') {
    return (
      voices.find(v => v.name === 'Google UK English Male') ||
      voices.find(v => v.name.includes('Microsoft David')) ||
      voices.find(v => v.name.includes('Daniel')) ||
      voices.find(v => v.name.includes('Alex')) ||
      voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-US') && v.localService) ||
      null
    )
  }
  if (key === 'soft') {
    return (
      voices.find(v => v.name === 'Google US English Female') ||
      voices.find(v => v.name.includes('Microsoft Zira Desktop')) ||
      voices.find(v => v.name.includes('Karen')) ||
      voices.find(v => v.name.includes('Fiona')) ||
      voices.find(v => v.lang === 'en-US' && !MALE_VOICE_NAMES.some(n => v.name.includes(n))) ||
      null
    )
  }
  return null
}

const askGroq = async (userMessage) => {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are Dhvani AI, a warm and patient voice-first accessibility agent for blind and visually impaired users. Your responses will be read aloud. Keep every response to 2-3 sentences maximum. No markdown. No bullet points. No lists. Speak naturally as if talking to a person. Be warm and encouraging.'
          },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    }
  )
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices[0].message.content
}

const sendBrowserCommand = async (command, confirmed = false) => {
  try {
    const res = await fetch(`${BACKEND}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, confirmed })
    })
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

const ease = [0.22, 1, 0.36, 1]

function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A12]/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="Back to landing"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-sm font-medium tracking-wide">Dhvani AI</div>
        </div>
      </div>
    </header>
  )
}

function VersionBadge() {
  return (
    <div className="mb-8 flex items-center gap-2 text-xs">
      <span className="text-white/60">Dhvani 1.0</span>
      <span className="rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[#C4B5FD]">
        BETA
      </span>
    </div>
  )
}

function PulseRing({ color, active, delay = 0 }) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full border"
      style={{ borderColor: color }}
      animate={active ? { scale: [1, 1.55], opacity: [0.55, 0] } : { scale: 1, opacity: 0 }}
      transition={active ? { duration: 2.2, repeat: Infinity, ease: 'easeOut', delay } : { duration: 0.3 }}
    />
  )
}

function OrbStage({ state }) {
  const cfg = ORB_STATE_CONFIG[state] || ORB_STATE_CONFIG.idle
  const ringsActive = state === 'listening' || state === 'speaking'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      <PulseRing color={cfg.color} active={ringsActive} delay={0} />
      <PulseRing color={cfg.color} active={ringsActive} delay={0.7} />
      <PulseRing color={cfg.accent} active={ringsActive} delay={1.4} />
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${cfg.color}55 0%, transparent 65%)` }}
        animate={{ opacity: ringsActive ? [0.55, 0.85, 0.55] : 0.45 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <GlowingOrb state={state} className="relative h-[240px] w-[240px]" />
    </div>
  )
}

function VoiceSelector({ voice, onChange }) {
  const options = [
    { key: 'woman', label: '👩 Woman' },
    { key: 'man',   label: '👨 Man' },
    { key: 'soft',  label: '🌸 Soft' },
  ]
  return (
    <div className="mt-5 flex items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition ' +
            (voice === opt.key
              ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#C4B5FD]'
              : 'border-white/10 bg-[#12111A]/80 text-white/50 hover:text-white/80')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StatusText({ state, browserStatus }) {
  const cfg = ORB_STATE_CONFIG[state] || ORB_STATE_CONFIG.idle
  const meta = STATE_META[state] || STATE_META.idle

  return (
    <div className="mt-8 flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 10px ${cfg.color}` }} />
        <span className="text-white/85">{meta.label}</span>
      </div>
      {browserStatus && (
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <span className="h-1 w-1 rounded-full bg-green-400" />
          {browserStatus}
        </div>
      )}
    </div>
  )
}

function WakeWordHint({ active }) {
  return (
    <motion.div
      className="mt-2 flex items-center gap-1.5 text-xs text-white/30"
      animate={{ opacity: active ? [0.4, 0.7, 0.4] : 0.3 }}
      transition={active ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
    >
      <span className={`h-1 w-1 rounded-full ${active ? 'bg-[#7C3AED]' : 'bg-white/20'}`} />
      Say &quot;Hey Friday&quot; to activate
    </motion.div>
  )
}

function ConversationBubbles({ messages }) {
  if (!messages.length) return null
  return (
    <div className="mt-4 w-full space-y-2">
      <AnimatePresence initial={false}>
        {messages.map((m, i) => {
          const isUser = m.role === 'user'
          return (
            <motion.div
              key={`${m.ts}-${i}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              className={
                'rounded-xl border-l-[3px] bg-[#12111A]/85 px-4 py-3 text-sm backdrop-blur ' +
                (isUser ? 'border-[#7C3AED]' : 'border-[#10B981]')
              }
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {isUser ? 'You' : 'Dhvani'}
              </div>
              <div className="mt-1 leading-snug text-white/90">{m.text}</div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default function Demo() {
  const [orbState, setOrbState] = useState('idle')
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [toasts, setToasts] = useState([])
  const [browserStatus, setBrowserStatus] = useState(null)
  const [backendReady, setBackendReady] = useState(false)
  const [voice, setVoice] = useState('woman')
  const [wakeActive, setWakeActive] = useState(false)

  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const transcriptRef = useRef('')
  const mutedRef = useRef(false)
  const orbStateRef = useRef('idle')
  const pipelineRef = useRef(null)
  const backendReadyRef = useRef(false)
  const pendingCommandRef = useRef(null)
  const wakeRecognitionRef = useRef(null)
  const wakeActiveRef = useRef(false)
  const voiceRef = useRef('woman')
  const voicesRef = useRef([])

  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { orbStateRef.current = orbState }, [orbState])
  useEffect(() => { backendReadyRef.current = backendReady }, [backendReady])
  useEffect(() => { voiceRef.current = voice }, [voice])

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
      console.log('Available voices:', voicesRef.current.map(v => v.name))
    }
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    loadVoices()
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // ── POLL BACKEND STATUS ──
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BACKEND}/status`)
        const data = await res.json()
        if (data.ready) {
          setBackendReady(true)
          setBrowserStatus(data.title || 'Browser ready')
        } else {
          setBackendReady(false)
        }
      } catch {
        setBackendReady(false)
        setBrowserStatus(null)
      }
    }
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  const pushToast = useCallback((message) => {
    if (!message) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((list) => [...list, { id, message }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000)
  }, [])

  const addToHistory = useCallback((role, text) => {
    setHistory((h) => [...h, { role, text, ts: Date.now() + h.length }])
  }, [])

  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return }
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      const profile = VOICE_PROFILES[voiceRef.current] || VOICE_PROFILES.woman
      utt.rate = profile.rate
      utt.pitch = profile.pitch
      utt.volume = 1
      const preferred = pickVoice(voicesRef.current, voiceRef.current)
      console.log('Selected voice:', preferred?.name || 'default')
      if (preferred) utt.voice = preferred
      const timeout = setTimeout(resolve, (text.length / 10 * 1000) + 3000)
      utt.onend = () => { clearTimeout(timeout); resolve() }
      utt.onerror = () => { clearTimeout(timeout); resolve() }
      window.speechSynthesis.speak(utt)
    })
  }, [])

  const autoRestartMic = useCallback(() => {
    if (!recognitionRef.current || isRecognizingRef.current) return
    try {
      recognitionRef.current.start()
      setOrbState('listening')
    } catch { /* recognition may already be starting */ }
  }, [])

  // ── MAIN PIPELINE ──
  const runPipeline = useCallback(async (text) => {
    if (!text.trim()) return
    setOrbState('thinking')

    try {
      const lowerText = text.toLowerCase().trim()

      if (pendingCommandRef.current) {
        const isYes = ['yes', 'yeah', 'yep', 'yup', 'ok', 'okay', 'sure', 'confirm', 'do it'].some(w => lowerText.includes(w))
        const isNo  = ['no', 'nope', 'cancel', 'stop', 'nevermind', 'never mind', 'abort'].some(w => lowerText.includes(w))

        if (isYes) {
          const commandToConfirm = pendingCommandRef.current
          pendingCommandRef.current = null
          addToHistory('user', text)
          if (backendReadyRef.current) {
            const data = await sendBrowserCommand(commandToConfirm, true)
            if (data?.result) {
              try {
                const s = await fetch(`${BACKEND}/status`)
                const sd = await s.json()
                if (sd.title) setBrowserStatus(sd.title)
              } catch { /* noop */ }
              const groqInput = `The user confirmed: "${commandToConfirm}". Result: ${data.result}. Summarise in 1-2 warm friendly sentences.`
              const reply = await askGroq(groqInput)
              addToHistory('ai', reply)
              if (!mutedRef.current) { setOrbState('speaking'); await speakText(reply) }
            }
          }
        } else if (isNo) {
          pendingCommandRef.current = null
          addToHistory('user', text)
          addToHistory('ai', 'Cancelled.')
          if (!mutedRef.current) { setOrbState('speaking'); await speakText('Cancelled.') }
        } else {
          const clarify = 'Please say yes to confirm, or no to cancel.'
          addToHistory('user', text)
          addToHistory('ai', clarify)
          if (!mutedRef.current) {
            setOrbState('speaking')
            await speakText(clarify)
            autoRestartMic()
            return
          }
        }

        setOrbState('idle')
        return
      }

      let groqInput = text

      if (backendReadyRef.current) {
        const data = await sendBrowserCommand(text, false)

        if (data) {
          if (data.requiresConfirmation) {
            pendingCommandRef.current = text
            addToHistory('user', text)
            addToHistory('ai', data.result)
            if (!mutedRef.current) {
              setOrbState('speaking')
              await speakText(data.result)
              autoRestartMic()
              return
            }
            setOrbState('idle')
            return
          }

          if (data.result) {
            try {
              const s = await fetch(`${BACKEND}/status`)
              const sd = await s.json()
              if (sd.title) setBrowserStatus(sd.title)
            } catch { /* noop */ }

            groqInput = `The user said: "${text}". The browser action result: ${data.result}. Summarise what happened in 1-2 warm friendly sentences for a visually impaired user. Be specific about what page or action occurred.`
          }
        }
      }

      const reply = await askGroq(groqInput)
      addToHistory('user', text)
      addToHistory('ai', reply)

      if (!mutedRef.current) {
        setOrbState('speaking')
        await speakText(reply)
      }
    } catch (e) {
      pushToast('Error: ' + e.message)
    }

    setOrbState('idle')
  }, [addToHistory, speakText, pushToast, autoRestartMic])

  useEffect(() => { pipelineRef.current = runPipeline }, [runPipeline])

  // ── WAKE WORD DETECTION ──
  const startWakeListening = useCallback(() => {
    if (isRecognizingRef.current) return
    if (wakeActiveRef.current) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    try {
      const wr = new SR()
      wr.lang = 'en-IN'
      wr.continuous = true
      wr.interimResults = true
      wr.maxAlternatives = 1

      wr.onstart = () => {
        wakeActiveRef.current = true
        setWakeActive(true)
      }

      wr.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript.toLowerCase()
          if (t.includes('friday')) {
            try { wr.stop() } catch { /* noop */ }
            wakeActiveRef.current = false
            setWakeActive(false)
            wakeRecognitionRef.current = null
            setTimeout(() => {
              if (orbStateRef.current === 'idle' && !isRecognizingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start()
                  setOrbState('listening')
                } catch { /* noop */ }
              }
            }, 200)
            return
          }
        }
      }

      wr.onend = () => {
        wakeActiveRef.current = false
        setWakeActive(false)
        wakeRecognitionRef.current = null
        if (!isRecognizingRef.current) {
          setTimeout(() => startWakeListening(), 1000)
        }
      }

      wr.onerror = (e) => {
        wakeActiveRef.current = false
        setWakeActive(false)
        wakeRecognitionRef.current = null
        const delay = (e.error === 'no-speech' || e.error === 'aborted') ? 500 : 2000
        setTimeout(() => startWakeListening(), delay)
      }

      wakeRecognitionRef.current = wr
      wr.start()
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => startWakeListening(), 1500)
    return () => {
      clearTimeout(t)
      if (wakeRecognitionRef.current) {
        try { wakeRecognitionRef.current.stop() } catch { /* noop */ }
      }
    }
  }, [startWakeListening])

  // ── SPEECH RECOGNITION ──
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { pushToast('Use Chrome for voice features'); return }

    const r = new SR()
    r.lang = 'en-IN'
    r.continuous = false
    r.interimResults = false
    r.maxAlternatives = 1

    let safetyTimeout = null

    r.onstart = () => {
      isRecognizingRef.current = true
      transcriptRef.current = ''
      safetyTimeout = setTimeout(() => {
        try { r.stop() } catch { /* noop */ }
      }, 8000)
    }

    r.onresult = (e) => {
      transcriptRef.current = e.results[0][0].transcript
    }

    r.onend = () => {
      clearTimeout(safetyTimeout)
      isRecognizingRef.current = false
      const text = transcriptRef.current.trim()
      transcriptRef.current = ''
      if (!text) { setOrbState('idle'); return }
      pipelineRef.current?.(text)
      setTimeout(() => startWakeListening(), 500)
    }

    r.onerror = (e) => {
      clearTimeout(safetyTimeout)
      isRecognizingRef.current = false
      setOrbState('idle')
      if (e.error === 'not-allowed') pushToast('Allow microphone access in Chrome settings')
      else if (e.error === 'network') pushToast('Network error — check connection')
      else if (e.error !== 'no-speech') pushToast('Mic error: ' + e.error)
      setTimeout(() => startWakeListening(), 500)
    }

    recognitionRef.current = r
    return () => { clearTimeout(safetyTimeout); recognitionRef.current = null }
  }, [pushToast, startWakeListening])

  const handleMicClick = () => {
    if (orbStateRef.current !== 'idle') return
    if (isRecognizingRef.current) return
    if (!recognitionRef.current) { pushToast('Use Chrome for voice features'); return }
    // pause wake recognition while main mic is active
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.stop() } catch { /* noop */ }
      wakeRecognitionRef.current = null
      wakeActiveRef.current = false
      setWakeActive(false)
    }
    try {
      recognitionRef.current.start()
      setOrbState('listening')
    } catch (e) {
      isRecognizingRef.current = false
      setOrbState('idle')
      pushToast('Could not start mic: ' + e.message)
    }
  }

  const handleMuteToggle = () => {
    setMuted((m) => {
      const next = !m
      if (next) {
        try { window.speechSynthesis.cancel() } catch { /* noop */ }
        setOrbState((s) => (s === 'speaking' ? 'idle' : s))
      }
      return next
    })
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A12] text-white">
      <div className="pointer-events-none fixed inset-0 dhvani-dotgrid" />

      {/* Backend status pill */}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#12111A]/90 px-3 py-1.5 text-xs backdrop-blur">
        <span className={`h-1.5 w-1.5 rounded-full ${backendReady ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-white/50">{backendReady ? 'Browser connected' : 'Backend offline'}</span>
      </div>

      <div className="relative flex min-h-screen flex-col">
        <TopNav />
        <main className="flex flex-1 items-center justify-center px-6 pb-40 pt-10">
          <div className="flex w-full flex-col items-center" style={{ maxWidth: 420 }}>
            <VersionBadge />
            <OrbStage state={orbState} />
            <VoiceSelector voice={voice} onChange={setVoice} />
            <StatusText state={orbState} browserStatus={browserStatus} />
            <WakeWordHint active={wakeActive} />
            <ConversationBubbles messages={history.slice(-3)} />
          </div>
        </main>
        <ControlsBar
          orbState={orbState}
          muted={muted}
          historyOpen={historyOpen}
          onMic={handleMicClick}
          onMute={handleMuteToggle}
          onHistory={() => setHistoryOpen((v) => !v)}
        />
      </div>

      <HistoryDrawer open={historyOpen} history={history} onClose={() => setHistoryOpen(false)} onClear={() => setHistory([])} />
      <ToastStack toasts={toasts} />
    </div>
  )
}

function HistoryDrawer({ open, history, onClose, onClear }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-modal="true" role="dialog" aria-label="Conversation history">
          <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose() }}
            className="absolute inset-x-0 bottom-0 flex max-h-[78vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#12111A] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 cursor-grab rounded-full bg-white/20 active:cursor-grabbing" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Conversation</div>
                <div className="text-xs text-white/50">{history.length} {history.length === 1 ? 'message' : 'messages'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClear} disabled={!history.length} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Clear</button>
                <button type="button" onClick={onClose} aria-label="Close history" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/80 transition hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {history.length === 0
                ? <div className="flex h-full items-center justify-center py-10 text-sm text-white/40">No messages yet.</div>
                : <ConversationBubbles messages={history} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ToastStack({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: -24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.97 }} transition={{ type: 'spring', damping: 22, stiffness: 280 }} className="pointer-events-auto max-w-sm rounded-xl border border-red-500/30 bg-[#18172A]/95 px-4 py-2.5 text-sm text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur" role="alert">
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function ControlsBar({ orbState, muted, historyOpen, onMic, onMute, onHistory }) {
  const listening = orbState === 'listening'
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto flex w-full max-w-[420px] items-center justify-between gap-6 px-6 pb-8">
        <button type="button" onClick={onMute} aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'} className={'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition ' + (muted ? 'border-[#DB2777]/50 bg-[#DB2777]/15 text-[#FBCFE8]' : 'border-white/10 bg-white/5 text-white/80 hover:text-white')}>
          {muted ? <IconVolumeOff /> : <IconVolume />}
        </button>
        <motion.button type="button" onClick={onMic} aria-label="Toggle microphone" className="pointer-events-auto relative flex items-center justify-center rounded-full text-white" style={{ width: 68, height: 68, background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #7C3AED 100%)', boxShadow: listening ? '0 0 34px rgba(219,39,119,0.8), 0 0 70px rgba(219,39,119,0.45)' : '0 0 24px rgba(124,58,237,0.55)' }} animate={listening ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={listening ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }} whileTap={{ scale: 0.96 }}>
          {listening ? <IconStop /> : <IconMic />}
        </motion.button>
        <button type="button" onClick={onHistory} aria-pressed={historyOpen} aria-label="Toggle history" className={'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition ' + (historyOpen ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-white/80 hover:text-white')}>
          <IconHistory />
        </button>
      </div>
    </div>
  )
}

function IconMic() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
}

function IconStop() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
}

function IconVolume() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
}

function IconVolumeOff() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" /><path d="m22 9-5 5" /><path d="m17 9 5 5" /></svg>
}

function IconHistory() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></svg>
}
