# Claudeborne

A FromSoftware-themed pixel art visualizer for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) events. Watch your coding session come to life as a Bloodborne Hunter or Dark Souls Knight reacts to Claude's actions in real time.

![Claudeborne](https://img.shields.io/npm/v/claudeborne)

## Quick Start

```bash
npx claudeborne
```

This starts the server, installs Claude Code hooks, and opens the visualizer in your browser. Use Claude Code normally and watch the character respond to events.

Press `Ctrl+C` to stop (hooks are automatically cleaned up).

## What It Does

Claudeborne hooks into Claude Code's event system and translates coding events into character animations:

| Claude Event | Animation | Description |
|---|---|---|
| Thinking | Meditate | Character sits and contemplates |
| File edit | Inscribe | Writing/spellcasting animation |
| File read | Read | Reading/searching animation |
| Bash command | Forge | Thrusting/smithing animation |
| Error | Stagger | Character takes a hit |
| Task complete | Victory | Triumphant celebration |
| Session start | Enter | Character walks into the scene |
| Idle | Idle | Standing idle |

## Scenes

Click the scene title at the bottom-left to cycle between scenes:

- **Bonfire** (Dark Souls) — Animated bonfire with a knight character
- **Hunter's Dream** (Bloodborne) — Gothic workshop with a hunter character and soul particles
- **Site of Grace** (Elden Ring) — Golden grace with arcing particles and a knight character

## Options

```bash
npx claudeborne              # Normal mode — hooks into Claude Code
npx claudeborne --demo       # Demo mode — plays simulated events
npx claudeborne --no-open    # Don't auto-open browser
```

## Development

### Prerequisites

- Node.js 18+
- npm 7+ (workspace support)

### Setup

```bash
git clone https://github.com/knewman23/claudeborne.git
cd claudeborne
npm install
```

### Project Structure

```
claudeborne/
  packages/
    shared/        # Shared types, event mapping, constants
    web/           # React + Vite + Canvas visualizer
    cli/           # Express + WebSocket server, Claude Code hooks
  scripts/
    build-publish.sh   # Bundles everything for npm publish
  hunter_assets/   # Source sprite assets (Bloodborne hunter)
  knight_assets/   # Source sprite assets (Dark Souls knight)
```

### Build

```bash
# Build everything (web + CLI)
npm run build

# Build for npm publish (bundles CLI + web into dist/)
npm run build:publish
```

### Run (Development)

```bash
# Run the CLI server (serves built web app on port 19281)
npm run dev

# Run Vite dev server + CLI server in parallel (with HMR)
npm run dev:all
```

The app runs on `http://localhost:19281`. In `dev:all` mode, Vite runs on port 19282 with hot module replacement.

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Zustand, HTML5 Canvas
- **Backend**: Express 5, WebSocket (ws), Node.js
- **Sprites**: LPC-style spritesheets (32x32 and 64x64)
- **Build**: esbuild (CLI bundling), Vite (web)
- **Monorepo**: npm workspaces

### How It Works

1. `npx claudeborne` starts an Express server on port 19281
2. The server installs hooks into `~/.claude/settings.json` that relay Claude Code events via curl
3. A WebSocket connection streams events to the browser
4. The Canvas-based visualizer renders the scene, character, particles, and lighting
5. On shutdown (`Ctrl+C`), hooks are automatically removed

### Publishing

```bash
npm login
npm publish
```

The `prepublishOnly` script automatically runs `build:publish`, which bundles the CLI with esbuild and copies the web assets into `dist/`.

## License

MIT
