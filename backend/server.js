const express = require('express')
const cors = require('cors')
const puppeteer = require('puppeteer')

const app = express()
app.use(cors())
app.use(express.json())

let browser = null
let page = null

// ── INIT BROWSER ──
async function initBrowser() {
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    })

    const pages = await browser.pages()
    page = pages[0] || await browser.newPage()
    await page.goto('https://google.com')

    browser.on('targetdestroyed', async (target) => {
      if (target.type() === 'page') {
        try {
          const remaining = await browser.pages()
          if (remaining.length === 0) {
            page = await browser.newPage()
            await page.goto('https://google.com')
            console.log('Tab closed — reopened automatically')
          } else {
            page = remaining[remaining.length - 1]
          }
        } catch (e) {
          console.log('Error recovering tab:', e.message)
        }
      }
    })

    browser.on('disconnected', async () => {
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
      await page.goto('https://google.com')
      return page
    }
    page = pages[pages.length - 1]
    // Verify page is actually alive with a test evaluate
    await page.evaluate(() => document.title)
    return page
  } catch {
    // Page is dead — open a completely fresh one
    try {
      page = await browser.newPage()
      await page.goto('https://google.com')
      return page
    } catch {
      return null
    }
  }
}

// ── SAFE TITLE ──
async function safeTitle(p) {
  try {
    return await p.evaluate(() => document.title)
  } catch {
    return 'Unknown page'
  }
}

// ── COMMAND HANDLER ──
app.post('/command', async (req, res) => {
  const { command } = req.body
  const p = await getPage()

  if (!p) {
    return res.json({ result: 'Browser is not ready. Please wait a moment.' })
  }

  try {
    const cmd = command.toLowerCase()
    let result = ''

    // ── NAVIGATE / OPEN ──
    if (cmd.includes('go to') || cmd.includes('open') || cmd.includes('navigate') || cmd.includes('visit')) {
      const sites = {
        'youtube':       'https://youtube.com',
        'google':        'https://google.com',
        'wikipedia':     'https://wikipedia.org',
        'news':          'https://news.google.com',
        'maps':          'https://maps.google.com',
        'gmail':         'https://gmail.com',
        'twitter':       'https://twitter.com',
        'facebook':      'https://facebook.com',
        'instagram':     'https://instagram.com',
        'amazon':        'https://amazon.in',
        'flipkart':      'https://flipkart.com',
        'github':        'https://github.com',
        'stackoverflow': 'https://stackoverflow.com',
        'linkedin':      'https://linkedin.com',
        'reddit':        'https://reddit.com',
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
        const title = await safeTitle(p)
        result = `Opened ${title}`
      } else {
        result = 'Could not find that website. Try saying the full name like go to youtube or go to google.'
      }
    }

    // ── SEARCH ──
    else if (cmd.includes('search for') || cmd.includes('search') || cmd.includes('find')) {
      const query = cmd.replace(/search for|search|find/g, '').trim()
      if (query) {
        await p.goto(`https://google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' })
        result = `Searched Google for ${query}`
      } else {
        result = 'What would you like to search for?'
      }
    }

    // ── READ PAGE ──
    else if (cmd.includes('read') || cmd.includes('what') || cmd.includes('describe') || cmd.includes('summary')) {
      const content = await p.evaluate(() => {
        const title = document.title
        const h1s = Array.from(document.querySelectorAll('h1'))
          .map(h => h.innerText?.trim()).filter(Boolean).slice(0, 2).join('. ')
        const paras = Array.from(document.querySelectorAll('p'))
          .map(p => p.innerText?.trim()).filter(t => t && t.length > 40).slice(0, 2).join(' ')
        const url = window.location.hostname
        return `You are on ${url}. Title: ${title}. ${h1s ? 'Heading: ' + h1s + '.' : ''} ${paras}`
      }).catch(() => 'Could not read the page content.')
      result = content.slice(0, 600)
    }

    // ── CLICK ──
    else if (cmd.includes('click') || cmd.includes('tap') || cmd.includes('press')) {
      const target = cmd.replace(/click|tap|press/g, '').trim()
      const clicked = await p.evaluate((t) => {
        const els = Array.from(document.querySelectorAll('a, button, [role=button], input[type=submit]'))
        const el = els.find(e => e.innerText?.toLowerCase().includes(t) || e.value?.toLowerCase().includes(t))
        if (el) { el.click(); return el.innerText || el.value || 'element' }
        return null
      }, target).catch(() => null)
      result = clicked ? `Clicked on ${clicked}` : `Could not find a button or link called ${target}`
    }

    // ── SCROLL ──
    else if (cmd.includes('scroll down') || cmd.includes('scroll up')) {
      const dir = cmd.includes('down') ? 500 : -500
      await p.evaluate((d) => window.scrollBy(0, d), dir).catch(() => {})
      result = cmd.includes('down') ? 'Scrolled down the page' : 'Scrolled up the page'
    }

    // ── TYPE ──
    else if (cmd.includes('type') || cmd.includes('write')) {
      const text = cmd.replace(/type|write/g, '').trim()
      if (text) {
        await p.keyboard.type(text)
        result = `Typed: ${text}`
      }
    }

    // ── SUBMIT ──
    else if (cmd.includes('submit') || cmd.includes('press enter')) {
      await p.keyboard.press('Enter')
      result = 'Pressed Enter'
    }

    // ── GO BACK ──
    else if (cmd.includes('go back') || cmd.includes('back')) {
      await p.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {})
      const title = await safeTitle(p)
      result = `Went back to ${title}`
    }

    // ── WHERE AM I ──
    else if (cmd.includes('where') || cmd.includes('current page') || cmd.includes('what page')) {
      const url = p.url()
      const title = await safeTitle(p)
      result = `You are currently on ${title} at ${url}`
    }

    // ── REFRESH ──
    else if (cmd.includes('refresh') || cmd.includes('reload')) {
      await p.reload({ waitUntil: 'domcontentloaded' }).catch(() => {})
      result = 'Page refreshed'
    }

    // ── FALLBACK ──
    else {
      const title = await safeTitle(p)
      const url = p.url()
      result = `I am on ${title}. I can open websites, search, read pages, click buttons, scroll, and type. What would you like me to do?`
    }

    res.json({ result })
  } catch (e) {
    res.json({ result: 'Something went wrong: ' + e.message })
  }
})

// ── STATUS ──
app.get('/status', async (req, res) => {
  try {
    if (!browser || !browser.isConnected()) {
      return res.json({ ready: false })
    }
    const p = await getPage()
    if (!p) return res.json({ ready: false })
    const title = await safeTitle(p)
    const url = p.url()
    res.json({ ready: true, url, title })
  } catch {
    res.json({ ready: false })
  }
})

// ── START ──
initBrowser().then(() => {
  app.listen(3001, () => {
    console.log('🚀 Dhvani backend on http://localhost:3001')
  })
})