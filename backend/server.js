require('dotenv').config()
const express = require('express')
const cors = require('cors')
const puppeteer = require('puppeteer')

const app = express()
app.use(cors())
app.use(express.json())

let browser = null
let page = null

const GROQ_KEY = process.env.GROQ_API_KEY

// ── INIT BROWSER ──
async function initBrowser() {
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const pages = await browser.pages()
    page = pages[0] || await browser.newPage()
    await page.goto('https://google.com', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})

    browser.on('targetdestroyed', async (target) => {
      if (target.type() === 'page') {
        try {
          const remaining = await browser.pages()
          if (remaining.length === 0) {
            page = await browser.newPage()
            await page.goto('https://google.com', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
          } else {
            page = remaining[remaining.length - 1]
          }
        } catch (e) { console.log('Tab recovery error:', e.message) }
      }
    })

    browser.on('disconnected', () => {
      console.log('Browser disconnected — relaunching...')
      setTimeout(initBrowser, 2000)
    })

    console.log('✅ Browser ready')
  } catch (e) {
    console.error('Failed to launch browser:', e.message)
    setTimeout(initBrowser, 3000)
  }
}

// ── ENSURE PAGE IS ALIVE ──
async function getPage() {
  try {
    if (!browser || !browser.isConnected()) {
      await initBrowser()
      await new Promise(r => setTimeout(r, 2000))
    }
    const pages = await browser.pages()
    if (pages.length === 0) {
      page = await browser.newPage()
      await page.goto('https://google.com', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
      return page
    }
    page = pages[pages.length - 1]
    await page.evaluate(() => document.title)
    return page
  } catch {
    try {
      page = await browser.newPage()
      await page.goto('https://google.com', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
      return page
    } catch { return null }
  }
}

// ── SAFE TITLE ──
async function safeTitle(p) {
  try { return await p.evaluate(() => document.title) } catch { return 'Unknown page' }
}

// ── SCREENSHOT ──
async function getScreenshot(p) {
  try {
    return await p.screenshot({ encoding: 'base64', type: 'jpeg', quality: 55, clip: { x: 0, y: 0, width: 1280, height: 800 } })
  } catch { return null }
}

// ── GROQ DIRECT ANSWER ──
async function askGroqDirect(userCommand) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are Dhvani AI, a warm helpful voice assistant for visually impaired users. Answer questions directly and conversationally in 1-3 sentences. No markdown. No bullet points. Speak naturally.'
          },
          { role: 'user', content: userCommand }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    })
    const data = await response.json()
    if (data.error) return null
    return data.choices[0].message.content
  } catch { return null }
}

// ── GROQ VISION ──
async function askGroqVision(screenshot, userCommand, actionDone) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `You are Dhvani AI, a voice assistant for blind users. Give ONE short sentence response only. Maximum 15 words. Be direct and specific. No filler words. No markdown.`
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${screenshot}` } },
              { type: 'text', text: `User said: "${userCommand}". Action taken: ${actionDone}. Describe what you see on screen and confirm what happened.` }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })
    const data = await response.json()
    if (data.error) { console.log('Vision error:', data.error.message); return null }
    return data.choices[0].message.content
  } catch (e) { console.log('Vision failed:', e.message); return null }
}

// ── COMMAND HANDLER ──
app.post('/command', async (req, res) => {
  const { command } = req.body
  const cmd = command.toLowerCase()

  // ── DIRECT AI ANSWER (no browser needed) ──
  const browserTriggers = [
    'open', 'go to', 'navigate', 'visit', 'search', 'find on',
    'play', 'watch', 'listen', 'scroll', 'click', 'tap', 'type',
    'pause', 'mute', 'unmute', 'volume', 'skip', 'rewind',
    'fullscreen', 'back', 'refresh', 'reload', 'read page',
    'read the page', 'describe the page', 'where am i'
  ]
  const directTriggers = [
    'what is', 'what are', 'who is', 'who are', 'how much', 'how many',
    'how do', 'how does', 'when is', 'when was', 'where is', 'why is',
    'why does', 'calculate', 'explain', 'define', 'meaning',
    'difference between', 'tell me about', 'can you explain',
    'what does', 'what should', 'give me', 'help me understand'
  ]

  const isBrowserCmd = browserTriggers.some(t => cmd.includes(t))
  const isDirectQ = directTriggers.some(t => cmd.includes(t))

  if (isDirectQ && !isBrowserCmd) {
    const answer = await askGroqDirect(command)
    return res.json({ result: answer || 'I could not answer that. Please try again.' })
  }

  const p = await getPage()
  if (!p) return res.json({ result: 'Browser is not ready. Please wait a moment.' })

  try {
    const currentUrl = p.url()
    let result = ''

    // ── UNMUTE ──
    if (cmd.includes('unmute')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.muted = false }).catch(() => {})
      result = 'Video unmuted'
    }

    // ── MUTE ──
    else if (cmd.includes('mute')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.muted = true }).catch(() => {})
      result = 'Video muted'
    }

    // ── VOLUME UP ──
    else if (cmd.includes('volume up') || cmd.includes('louder') || cmd.includes('increase volume')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) { v.muted = false; v.volume = Math.min(1, v.volume + 0.2) } }).catch(() => {})
      result = 'Volume increased'
    }

    // ── VOLUME DOWN ──
    else if (cmd.includes('volume down') || cmd.includes('quieter') || cmd.includes('decrease volume')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.volume = Math.max(0, v.volume - 0.2) }).catch(() => {})
      result = 'Volume decreased'
    }

    // ── SKIP FORWARD ──
    else if (cmd.includes('skip') || cmd.includes('fast forward')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.currentTime += 10 }).catch(() => {})
      result = 'Skipped forward 10 seconds'
    }

    // ── REWIND ──
    else if (cmd.includes('rewind')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.currentTime -= 10 }).catch(() => {})
      result = 'Rewound 10 seconds'
    }

    // ── FULLSCREEN ──
    else if (cmd.includes('fullscreen') || cmd.includes('full screen')) {
      await p.keyboard.press('f')
      result = 'Toggled fullscreen'
    }

    // ── PAUSE ──
    else if (cmd.includes('pause') || cmd.includes('stop video')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.pause() }).catch(() => {})
      result = 'Video paused'
    }

    // ── RESUME ──
    else if (cmd.includes('resume') || cmd.includes('unpause')) {
      await p.evaluate(() => { const v = document.querySelector('video'); if (v) v.play() }).catch(() => {})
      result = 'Video resumed'
    }

    // ── PLAY FIRST VIDEO ──
    else if ((cmd.includes('play') || cmd.includes('open')) &&
             (cmd.includes('first') || cmd.includes('this') || cmd.includes('that') || cmd.includes('top')) &&
             currentUrl.includes('youtube.com')) {
      await p.waitForSelector('ytd-video-renderer, ytd-rich-item-renderer', { timeout: 5000 }).catch(() => {})
      const clicked = await p.evaluate(() => {
        const selectors = ['ytd-video-renderer a#video-title', 'ytd-rich-item-renderer a#video-title', 'a#video-title', 'ytd-thumbnail a']
        for (const sel of selectors) {
          const el = document.querySelector(sel)
          if (el) { const title = el.getAttribute('title') || el.getAttribute('aria-label') || 'video'; el.click(); return title }
        }
        return null
      }).catch(() => null)
      result = clicked ? `Playing: ${clicked}` : 'Could not find a video to play.'
    }

    // ── NAVIGATE / OPEN ──
    else if (cmd.includes('go to') || cmd.includes('open') || cmd.includes('navigate') || cmd.includes('visit')) {
      const sites = {
        'youtube': 'https://youtube.com', 'google': 'https://google.com',
        'wikipedia': 'https://wikipedia.org', 'news': 'https://news.google.com',
        'maps': 'https://maps.google.com', 'gmail': 'https://gmail.com',
        'twitter': 'https://twitter.com', 'facebook': 'https://facebook.com',
        'instagram': 'https://instagram.com', 'amazon': 'https://amazon.in',
        'flipkart': 'https://flipkart.com', 'github': 'https://github.com',
        'stackoverflow': 'https://stackoverflow.com', 'linkedin': 'https://linkedin.com',
        'reddit': 'https://reddit.com',
      }
      let url = null
      for (const [name, link] of Object.entries(sites)) {
        if (cmd.includes(name)) { url = link; break }
      }
      if (!url) {
        const domainMatch = cmd.match(/([a-z0-9-]+)\.(com|org|in|net|io|co)/i)
        if (domainMatch) url = `https://${domainMatch[0]}`
      }
      if (url) {
        await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        result = `Opened ${await safeTitle(p)}`
      } else {
        result = 'Could not find that website.'
      }
    }

    // ── SEARCH / PLAY / WATCH / LISTEN ──
    else if (cmd.includes('search') || cmd.includes('find') || cmd.includes('play') || cmd.includes('watch') || cmd.includes('listen')) {
      const query = cmd.replace(/search for|search on youtube|search|find on youtube|find|play on youtube|play|watch|listen to|listen/g, '').trim()
      if (query) {
        const youtubeWords = ['youtube', 'video', 'music', 'song', 'watch', 'play', 'listen', 'trailer', 'short', 'channel']
        const wantsYoutube = youtubeWords.some(w => cmd.includes(w)) || currentUrl.includes('youtube.com')
        if (wantsYoutube) {
          await p.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
          result = `Searched YouTube for ${query}`
        } else {
          await p.goto(`https://google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
          result = `Searched Google for ${query}`
        }
      } else {
        result = 'What would you like to search for?'
      }
    }

    // ── READ PAGE ──
    else if (cmd.includes('read') || cmd.includes('describe') || cmd.includes('summary')) {
      const content = await p.evaluate(() => {
        const title = document.title
        const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText?.trim()).filter(Boolean).slice(0, 2).join('. ')
        const paras = Array.from(document.querySelectorAll('p')).map(p => p.innerText?.trim()).filter(t => t && t.length > 40).slice(0, 3).join(' ')
        return `Page: ${title}. ${h1s ? 'Headings: ' + h1s + '.' : ''} ${paras}`
      }).catch(() => 'Could not read the page.')
      result = content.slice(0, 800)
    }

    // ── CLICK ──
    else if (cmd.includes('click') || cmd.includes('tap') || cmd.includes('press')) {
      const target = cmd.replace(/click|tap|press/g, '').trim()
      const clicked = await p.evaluate((t) => {
        const els = Array.from(document.querySelectorAll('a, button, [role=button], input[type=submit], input[type=button], [jsname], [data-val]'))
        let el = els.find(e => e.innerText?.toLowerCase().trim() === t || e.getAttribute('aria-label')?.toLowerCase().includes(t) || e.getAttribute('data-val')?.toLowerCase() === t)
        if (!el) el = els.find(e => e.innerText?.toLowerCase().includes(t) || e.getAttribute('aria-label')?.toLowerCase().includes(t))
        if (el) { el.click(); return el.innerText || el.getAttribute('aria-label') || el.getAttribute('data-val') || 'element' }
        return null
      }, target).catch(() => null)
      result = clicked ? `Clicked on ${clicked}` : `Could not find ${target}`
    }

    // ── SCROLL ──
    else if (cmd.includes('scroll down') || cmd.includes('scroll up')) {
      const dir = cmd.includes('down') ? 500 : -500
      await p.evaluate((d) => window.scrollBy(0, d), dir).catch(() => {})
      result = cmd.includes('down') ? 'Scrolled down' : 'Scrolled up'
    }

    // ── TYPE ──
    else if (cmd.includes('type') || cmd.includes('write')) {
      const text = cmd.replace(/type|write/g, '').trim()
      if (text) { await p.keyboard.type(text); result = `Typed: ${text}` }
    }

    // ── SUBMIT ──
    else if (cmd.includes('submit') || cmd.includes('press enter')) {
      await p.keyboard.press('Enter'); result = 'Pressed Enter'
    }

    // ── GO BACK ──
    else if (cmd.includes('go back') || cmd.includes('back')) {
      await p.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {})
      result = `Went back to ${await safeTitle(p)}`
    }

    // ── WHERE AM I ──
    else if (cmd.includes('where') || cmd.includes('current page')) {
      result = `You are on ${await safeTitle(p)} at ${p.url()}`
    }

    // ── REFRESH ──
    else if (cmd.includes('refresh') || cmd.includes('reload')) {
      await p.reload({ waitUntil: 'domcontentloaded' }).catch(() => {})
      result = 'Page refreshed'
    }

    // ── FALLBACK — try direct AI answer ──
    else {
      const answer = await askGroqDirect(command)
      return res.json({ result: answer || `I am on ${await safeTitle(p)}. I can open websites, search, play videos, control volume, pause, mute, skip, read pages, click, and scroll.` })
    }

    // ── VISION: Screenshot + Groq sees the page ──
    await new Promise(r => setTimeout(r, 800))
    const screenshot = await getScreenshot(p)
    if (screenshot) {
      const visionResult = await askGroqVision(screenshot, command, result)
      if (visionResult) result = visionResult
    }

    res.json({ result })
  } catch (e) {
    res.json({ result: 'Something went wrong: ' + e.message })
  }
})

// ── STATUS ──
app.get('/status', async (req, res) => {
  try {
    if (!browser || !browser.isConnected()) return res.json({ ready: false })
    const p = await getPage()
    if (!p) return res.json({ ready: false })
    res.json({ ready: true, url: p.url(), title: await safeTitle(p) })
  } catch { res.json({ ready: false }) }
})

// ── START ──
initBrowser().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`🚀 Dhvani backend on port ${process.env.PORT || 3001}`)
  })
})