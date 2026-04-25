# Dhvani AI — MVP Gap Fixes Design Spec
**Date:** 2026-04-25  
**Author:** Saurabh Vishwakarma / Team Code Verse  
**Approach:** Minimal Surgery (Approach 1)

---

## Overview

Four targeted fixes to close MVP accessibility gaps in Dhvani AI. All changes are in `backend/server.js` and `src/pages/Demo.jsx`. No new dependencies. No new routes except the confirmation flag on the existing `/command` endpoint.

---

## Fix 1 — Page Summary on Load

### Goal
After every navigation command, Vision AI describes not just what's on screen but what the user can do — links, buttons, forms, main heading.

### Implementation — `server.js`

**New helper function `extractPageStructure(p)`:**
```js
async function extractPageStructure(p) {
  return await p.evaluate(() => {
    const mainHeading = document.querySelector('h1')?.innerText?.trim() || ''
    const linkCount = document.querySelectorAll('a[href]').length
    const buttonCount = document.querySelectorAll('button, input[type=submit], input[type=button], [role=button]').length
    const formCount = document.querySelectorAll('form').length
    const inputCount = document.querySelectorAll('input, textarea, select').length
    const topActions = Array.from(document.querySelectorAll('button, [role=button]'))
      .map(el => el.innerText?.trim() || el.getAttribute('aria-label') || '')
      .filter(Boolean).slice(0, 5)
    return { mainHeading, linkCount, buttonCount, formCount, inputCount, topActions }
  }).catch(() => null)
}
```

**Usage:** Called only inside the NAVIGATE/OPEN command block, after `p.goto()` resolves. Result appended to the Vision AI prompt as additional context:

```
Page structure: Heading: "YouTube". 42 links, 8 buttons, 1 form, 3 inputs.
Top actions: Search, Sign in, Upload.
Describe what the user sees AND list 2-3 specific actions they can take right now.
```

**Constraint:** `extractPageStructure` is only called after navigation. No overhead on video controls, scroll, mute, volume, etc.

---

## Fix 2 — Confirmation Layer for Risky Actions

### Goal
Before executing irreversible actions (submit, buy, delete, pay, etc.), Dhvani asks for confirmation. User says "yes" to proceed or "no" to cancel.

### Implementation — `server.js`

**Risky keyword list:**
```js
const riskyKeywords = ['submit', 'buy', 'purchase', 'delete', 'send', 'pay', 'confirm', 'checkout', 'order']
```

**Risky keywords added to `browserTriggers`** so they are never intercepted by the direct-answer check:
```js
'submit', 'buy', 'purchase', 'delete', 'pay', 'checkout', 'order'
```
(`'send'` and `'confirm'` already reach the browser pipeline via existing behaviour.)

**Detection block** (first handler inside the main command chain, before the existing `submit` handler):
```js
const isRisky = riskyKeywords.some(k => cmd.includes(k))
if (isRisky && !req.body.confirmed) {
  const action = riskyKeywords.find(k => cmd.includes(k))
  return res.json({
    result: `Are you sure you want to ${action}? Say yes to confirm, or no to cancel.`,
    requiresConfirmation: true
  })
}
```

**Bypass:** When `req.body.confirmed === true`, the check is skipped and the command executes normally.

### Implementation — `Demo.jsx`

**`sendBrowserCommand`** updated to return full `data` object:
```js
const sendBrowserCommand = async (command, confirmed = false) => {
  const res = await fetch(`${BACKEND}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, confirmed })
  })
  const data = await res.json()
  return data  // full object, not just data.result
}
```

**New ref in `Demo` component:**
```js
const pendingCommandRef = useRef(null)
```

**`runPipeline` logic:**
1. If `pendingCommandRef.current` is set (we're in confirmation flow):
   - If user said "yes" / "yeah" / "yep" → resend stored command with `confirmed: true`, clear ref
   - If user said "no" / "nope" / "cancel" → clear ref, speak "Cancelled.", go idle, return
2. Normal flow: call `sendBrowserCommand(text, false)`
3. If response has `requiresConfirmation: true`:
   - Store command in `pendingCommandRef.current`
   - Speak the confirmation question
   - Auto-restart mic (orb stays in listening state)
   - Return without going idle

---

## Fix 3 — "What Can I Do Here" Command

### Goal
User says "what can I do" / "what's available" / "help" and Dhvani reads out a natural summary of interactive elements on the current page.

### Implementation — `server.js`

**Trigger phrases** (added to `browserTriggers` list so they route to browser pipeline):
```
'what can i do', 'what\'s available', 'what are my options'
```
**Note:** `'help'` alone is NOT added to `browserTriggers` — it conflicts with `'help me understand'` in `directTriggers`. The handler condition uses `cmd.includes('help') && !cmd.includes('help me')` to catch standalone "help" after it reaches the main chain via fallback.

**New command block** (inserted before the `read/describe/summary` handler):
```js
else if (cmd.includes('what can i do') || cmd.includes("what's available") ||
         cmd.includes('what are my options') ||
         (cmd.includes('help') && !cmd.includes('help me'))) {
  const context = await p.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role=button]'))
      .map(el => el.innerText?.trim() || el.getAttribute('aria-label') || '')
      .filter(Boolean)
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map(el => el.innerText?.trim()).filter(t => t && t.length > 1).slice(0, 5)
    const fields = Array.from(document.querySelectorAll('input, textarea, select'))
      .map(el => el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.type || '')
      .filter(Boolean)
    const headings = Array.from(document.querySelectorAll('h1, h2'))
      .map(h => h.innerText?.trim()).filter(Boolean).slice(0, 3)
    return { buttons, links, fields, headings }
  }).catch(() => null)

  if (context) {
    const summary = `Page headings: ${context.headings.join(', ') || 'none'}.
Buttons: ${context.buttons.join(', ') || 'none'}.
Links: ${context.links.join(', ') || 'none'}.
Form fields: ${context.fields.join(', ') || 'none'}.
Summarise in 2 warm sentences what the user can do on this page right now. No markdown.`
    const answer = await askGroqDirect(summary)
    return res.json({ result: answer || 'I could not read the page structure.' })
  }
  result = 'Could not read the page.'
  // Vision AI skipped — no browser action taken
  return res.json({ result })
}
```

**Note:** Vision AI does NOT run for this command — it's a read-only extraction, no page state changed.

---

## Fix 4 — Read by Element Type

### Goal
Five specific voice commands to read individual element types from the current page.

### Triggers and extractions

| Command | Trigger phrase | Extracted elements |
|---|---|---|
| Read headings | `read headings` | All h1, h2, h3 text |
| Read links | `read links` | First 10 anchor texts |
| Read buttons | `read buttons` | All button/role=button texts |
| Read form | `read form` | All input labels, placeholders, types |
| Read paragraph | `read paragraph` | First 3 paragraphs >40 chars |

### Implementation — `server.js`

Five `else if` blocks inserted **above** the existing `read/describe/summary` block (more specific match, checked first):

```js
else if (cmd.includes('read headings')) { /* extract h1,h2,h3 */ }
else if (cmd.includes('read links')) { /* extract first 10 anchors */ }
else if (cmd.includes('read buttons')) { /* extract all buttons */ }
else if (cmd.includes('read form')) { /* extract input labels/types */ }
else if (cmd.includes('read paragraph')) { /* extract 3 paragraphs */ }
```

Each handler:
1. Extracts via `p.evaluate()`
2. Builds a plain text string
3. Passes to `askGroqDirect` for a natural spoken summary
4. Returns result directly — Vision AI does NOT run (read-only, no page change)

---

## Constraints (from CLAUDE.md)

- `safeTitle()` used everywhere — never `p.title()` directly
- `headless: false` stays for local demo
- `GROQ_KEY` from `process.env.GROQ_API_KEY`
- StrictMode stays removed from `main.jsx`
- Vision AI still runs after every navigation/action command
- All 15 existing commands untouched

---

## Files Changed

| File | Changes |
|---|---|
| `backend/server.js` | `extractPageStructure()` helper, Fix 1 in navigate block, Fix 2 risky check, Fix 3 handler, Fix 4 five handlers, `browserTriggers` updated |
| `src/pages/Demo.jsx` | `sendBrowserCommand` returns full object, `pendingCommandRef`, confirmation flow in `runPipeline` |

---

## Out of Scope

- No new npm dependencies
- No new Express routes
- No changes to Vision AI model, screenshot settings, or Groq API call structure
- No changes to orb animations, TTS voice, or speech recognition language
