# Hologram Tutor

A personal AI tutor that talks with you, and will grow into an animated 3D character
shown on a Looking Glass holographic display.

**Current stage: Phase 1 complete, Phase 3 started.** You can type a question, watch the
answer stream in, hear it read aloud, scroll back through the conversation, stop an answer
part-way, and start a new conversation. The tutor, Vector, appears as a real-time 3D,
full-body armored figure in red, champagne gold and gunmetal, standing on a holographic projector
ring. He greets you with a raised, glowing palm, puts a hand to his chin while thinking, gestures
while he talks, blinks, glances toward your mouse pointer and moves his jaw as words are spoken.

Vector is an original design in the armored-hero style. He isn't Marvel's Iron Man and uses
none of Marvel's assets or branding.

## Quick start (Mac mini)

1. **Install Node.js 22 or newer** (one time). If you use Homebrew: `brew install node`
   (check with `node --version`).
2. **Install dependencies.** In Terminal, from this folder: `npm install`
3. **Add your API key.** Run `cp .env.example .env`, then open `.env` in a text editor and
   paste your key after `ANTHROPIC_API_KEY=` (see [Get an Anthropic API key](#get-an-anthropic-api-key)).
4. **Run it:** `npm start`, then open <http://localhost:3000> in Chrome or Safari.

Or double-click **`start-mac.command`** in Finder. It does steps 2–4 for you and opens the
browser. The first time, macOS may ask you to allow it: right-click → Open.

**No key yet?** Set `AI_PROVIDER=mock` in `.env` to try the whole interface with an offline
stand-in tutor.

## Get an Anthropic API key

1. Sign in at <https://platform.claude.com/> and add a payment method or credits
   (the API is billed per use, separately from a Claude.ai subscription).
2. Go to **API Keys → Create Key** and copy it.
3. Paste it into `.env` on your Mac as `ANTHROPIC_API_KEY=sk-ant-...`, then restart `npm start`.

The key stays on your computer: `.env` is git-ignored, only the local server reads it, and the
browser page never sees it. Don't paste it into chats, code or commits.

**Cost:** a typical question-and-answer turn costs a few cents on the default model, rising as a conversation gets longer.
To keep spending predictable, set a monthly spend limit in the console under **Limits**.

## Using it

| Action | How |
| --- | --- |
| Ask a question | Type, then press **Enter** (Shift+Enter for a new line) |
| Stop an answer or the voice | **Stop** button or **Esc** |
| Turn speech on or off | **Voice** checkbox (top right) |
| Pick a voice | Drop-down next to it. On macOS, nicer voices can be downloaded in System Settings → Accessibility → Spoken Content → System Voice → Manage Voices (look for "Premium" or "Enhanced") |
| Hear an answer again | **🔊 Replay** on any answer |
| Start fresh | **New conversation** |
| Switch between full body and head-and-shoulders | **Close-up / Full body** button under the character |
| Use the lightweight 2D character | Open <http://localhost:3000/?character=2d> (used automatically if 3D graphics are unavailable) |

In Phase 1, history is kept in the server's memory and survives a page reload, but not a server
restart. Persistent memory arrives in Phase 5.

## Settings (`.env`)

| Variable | Default | Meaning |
| --- | --- | --- |
| `AI_PROVIDER` | `anthropic` | `anthropic` for Claude, or `mock` for the offline stand-in |
| `ANTHROPIC_API_KEY` | (none) | Your API key |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Claude model ID |
| `ANTHROPIC_EFFORT` | `medium` | `low` gives faster, cheaper answers; `high`/`xhigh`/`max` gives more careful reasoning |
| `PORT` | `3000` | Local port. The server only listens on this computer (127.0.0.1) |

## Tests

```bash
npm test
```

The tests cover configuration, the Claude request and error handling (using a fake client, so no
network or key is needed), conversation logic (including Stop and failures), the HTTP API, and the
speech text helpers.

## How it's built

```
server/                 Node.js + Express. Holds the API key and talks to the AI provider.
  index.js              Starts the server
  app.js                HTTP API (+ serves the web page)
  config.js             Reads .env / environment variables
  conversations.js      Conversation state and one question→answer turn
  characters.js         Character personalities (swap characters here)
  ai/anthropic.js       Claude provider (official Anthropic SDK, streaming)
  ai/mock.js            Offline provider for tests and demos
public/                 The browser app: plain HTML/CSS/JS, no build step
  js/app.js             UI wiring
  js/api.js             Talks to the local server (answers stream as NDJSON)
  js/speech.js          Text-to-speech (browser voices), sentence by sentence
  js/spoken-text.js     Markdown/LaTeX → speakable text; sentence chunking
  js/character.js       Picks the character renderer (3D, or the 2D fallback)
  js/character-3d.js    3D armored figure (Three.js): joint hierarchy, poses, gestures, glow
  js/character-2d.js    Lightweight 2D fallback with the same interface
  js/render.js          Safe Markdown rendering
test/                   node:test unit + API tests
```

Design notes:

- **The browser never talks to the AI directly.** It talks to the local server, which keeps the
  key. Answers stream to the page as they're generated, and speech starts after the first
  sentence instead of waiting for the full answer.
- **Swappable parts.** The AI provider, the speech engine and the character each sit behind a
  small interface (documented at the top of each file), so Claude could be swapped for another
  provider, browser voices for a cloud voice, or the 2D placeholder for a 3D model, each without
  touching the other parts.
- **Stop works end to end.** Pressing Stop silences the voice, cancels the request to the AI
  (so you stop paying for tokens), and records the partial answer, so the tutor knows it was cut off.
- **The 3D character is built from simple shapes in code**, so there are no model files to download
  or license. It renders to a standard Three.js scene, which is what the Looking Glass web
  integration works with.
- **Claude features used:** streaming, adaptive thinking with a configurable effort level,
  server-side refusal fallback, and verbatim replay of earlier turns, which keeps the prompt
  cache effective.

## Roadmap

1. ✅ **Phase 1:** typed conversation, streamed answers, spoken replies, history, stop, new conversation
2. **Phase 2:** microphone input (push-to-talk first), interrupting the tutor by speaking, mic status
3. 🚧 **Phase 3:** 3D character (Three.js). Done: an original full-body armored figure with a joint
   hierarchy, a greeting gesture, thinking/speaking/error poses, head motion, blinking, pointer
   glances, a word-driven jaw, and full-body/close-up framing. Still to do: lip sync driven
   by real audio (needs a cloud voice), gestures, emotional expressions, and optionally a professional
   or licensed model in place of the shapes-in-code version
4. **Phase 4:** teaching mode with quizzes, adaptive explanations and rendered equations
5. **Phase 5:** persistent memory in local SQLite, with a screen to view and delete memories
6. **Phase 6:** Looking Glass HLD output (after checking the current official docs)
