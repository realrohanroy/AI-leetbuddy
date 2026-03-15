# AI LeetBuddy 🦉

> A Chrome extension that sits with you on LeetCode — hints, roasts, jokes, and a personality that changes based on the time of day and your laptop's battery.

LeetBuddy injects **Lexi**, an owl companion, directly into every LeetCode problem page. Powered by **Gemini 1.5 Flash**, she reads your actual code from the editor, tracks your conversation history, and responds differently depending on whether you need a nudge or just want her to tear your solution apart.

---

## What Lexi does

### AI features
- **Contextual hints** — Lexi reads your live Monaco editor code and gives progressive hints (brute force first, then more detailed) without revealing the full solution
- **Hint throttling** — after 2 consecutive hints she cuts you off and tells you to try yourself
- **Code roasting** — asks Gemini to brutally critique your current solution
- **Complexity analysis** — checks time and space complexity of whatever you've written
- **Programmer jokes** — because sometimes you just need one
- **Stateful conversation** — full multi-turn chat history sent with every request, so Lexi remembers what she already told you

### Two personalities, switched per request
| Mode | Trigger | Lexi's behaviour |
|---|---|---|
| Focus | Hint / complexity / bug requests | Serious tutor, concise hints, light sarcasm at the end |
| Fun | Jokes / roast requests | Witty, merciless, pun-heavy |

### Lexi's moods — she has a life
Lexi's icon changes every minute based on real-world context:

| Mood | Trigger | Icon |
|---|---|---|
| 🏋️ Workout | 6:00 – 8:00 AM | Morning workout mode |
| ☕ Coffee | 8:00 AM – 12:00 PM | Coffee in hand |
| 💻 Standard | 12:00 – 6:00 PM | Working at her desk |
| 🎧 Headphones | 6:00 – 10:00 PM | Evening vibes |
| 😴 Sleeping | 10:00 PM – 6:00 AM | Fast asleep |
| 😩 Monday morning | Monday 8–12 AM | Mondays, ugh |
| 🔋 Battery low | Laptop battery ≤ 20% | Sad face with battery icon |
| ⚡ Charging | Plugged in | Happy charging indicator |

---

## Architecture

```
├── content.js       # Chrome extension content script — all UI and logic
│                    # Single LexiApp object: FAB, chat window, mood engine,
│                    # conversation history, Gemini API calls via proxy
├── server.js        # Express proxy server — keeps Gemini API key off the browser
├── manifest.json    # Chrome Manifest V3 — content script + host permissions
└── icon/            # All 8 Lexi mood PNGs
```

**Why a proxy server?**
Chrome extensions run in the browser — any API key in `content.js` would be visible to anyone who inspects the extension. The Express server acts as a secure proxy: the extension sends conversation history to `localhost:3000`, the server attaches the secret key and forwards to Gemini, then returns the response. The key never touches the browser.

**How code context works:**
```javascript
const userCode = document.querySelector(".view-lines.monaco-mouse-cursor-text")?.innerText
```
Lexi reads your actual typed code directly from LeetCode's Monaco editor DOM and appends it to every message sent to Gemini — so hints are always based on what you've actually written, not a generic description of the problem.

---

## Setup

### Prerequisites
- Node.js installed
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)
- Google Chrome

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-leetbuddy.git
cd ai-leetbuddy
```

### 2. Install server dependencies
```bash
npm install
```

### 3. Add your Gemini API key
Create a `.env` file in the root:
```
GEMINI_API_KEY=your_key_here
```

### 4. Start the proxy server
```bash
node server.js
```
You should see: `Lexi's secure server is running on http://localhost:3000`

### 5. Load the extension in Chrome
1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the project folder

### 6. Open any LeetCode problem
Go to any `leetcode.com/problems/...` page — Lexi appears as a draggable orange circle in the bottom right corner.

---

## Usage

- **Click Lexi** to open the chat
- **Enter your name** on first launch (saved locally, never sent anywhere)
- Use **quick reply buttons** for common actions or type your own message
- **Drag Lexi** anywhere on the screen — she remembers her position
- Lexi reads your editor code automatically — no copy-pasting needed

### Quick replies
| Button | What it does |
|---|---|
| First hint? | Progressive hint based on your current code |
| Another hint | Next level hint (max 2 before she cuts you off) |
| Check complexity | Time and space complexity of your solution |
| Any bugs? | Asks Lexi to spot issues in your code |
| Roast my code | Fun mode — merciless critique |
| Programmer joke? | Fun mode — Lexi tells a joke |

---

## Tech stack

| Layer | Technology |
|---|---|
| Extension | Vanilla JavaScript, HTML, CSS — Chrome Extensions API (Manifest V3) |
| AI | Google Gemini 1.5 Flash via REST API |
| Proxy server | Node.js, Express, node-fetch, dotenv |
| Storage | Chrome localStorage (username persistence) |

---

## Known limitations

- Requires the local proxy server to be running — the extension won't work without `node server.js` active
- Battery API availability depends on the browser/OS configuration
- Tested on LeetCode's current DOM structure — may need selector updates if LeetCode changes their editor markup

---

## What I'd add next

- Chrome storage sync to persist conversation history across sessions
- Publish to Chrome Web Store with a hosted backend (removes the local server requirement)
- Pomodoro timer integration — Lexi reminds you to take breaks
- Streak tracking — Lexi gets more excited the more days in a row you practice
