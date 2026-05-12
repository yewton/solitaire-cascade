# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech stack

- **Vite** — dev server + bundler (`npm run dev` → `http://localhost:5173`)
- **TypeScript** — strict mode, `moduleResolution: bundler`
- No UI framework (pure Canvas app)

## Commands

```bash
npm run dev       # dev server with HMR
npm run build     # tsc --noEmit + vite build → dist/
npm run preview   # serve dist/ locally
npm run typecheck # tsc --noEmit only
npm audit         # vulnerability check (expect 0 vulnerabilities)
```

## CI / Supply chain

- **`.github/workflows/ci.yml`** — runs `npm ci → npm audit --audit-level=high → typecheck → build` on every push and PR
- **`.github/dependabot.yml`** — weekly automated updates for both npm packages and GitHub Actions
- **Actions pinned to commit SHAs** — prevents tag-mutation attacks; Dependabot keeps the SHAs up to date
- **`npm ci`** — enforces `package-lock.json` strictly, preventing unintended version resolution
- **Exact versions in `package.json`** (no `^`) — `.npmrc` sets `save-exact=true`
- **`npm audit --audit-level=high`** — CI fails on high+ severity only; moderate esbuild advisory is dev-server-only and accepted

## Architecture

### Module graph (roughly top-down)

```
main.ts
├── style.css
├── textures.ts   — pre-renders all 52 card faces + back to offscreen canvases at startup
├── game.ts       — canvas setup, game loop, object pools, spawnCard/spawnParticle, resize, input handlers
│   ├── types.ts       — SUITS/VALUES constants; Suit/CardValue/EffectState/AutoDeck types
│   ├── config.ts      — mutable runtime dimensions { width, height, CARD_W, CARD_H, scale, FOCAL_LENGTH }
│   ├── effectState.ts — mutable UI state (effectState, currentParticleType, getDynamicLimits)
│   ├── card.ts        — Card class: physics + draw
│   └── particle.ts    — Particle class: physics + draw
└── ui.ts         — builds chip buttons, wires FABs and settings panel to game.ts exports
```

### Rendering: 3-canvas layer stack

| Canvas | z-index | Cleared each frame? | Purpose |
|---|---|---|---|
| `#gameCanvas`     | 1 | No (only on reset) | Persistent card trail |
| `#blurCanvas`     | 2 | Faded with `destination-out` | Motion blur during Reflex Mode |
| `#particleCanvas` | 3 | Yes (clearRect) | Current-frame cards + particles |

### Key design decisions

- **`config.ts`** is a plain mutable object updated by `resize()`. Card and Particle read from it at draw/update time rather than receiving per-call params, avoiding verbose signatures.
- **`effectState.ts`** holds live UI toggles. Cards snapshot `effectState` at spawn via `{ ...options }`, so spawned cards reflect settings at creation time. Particles read `effectState.neon` live at draw time.
- **Object pooling** — `cardPool` / `particlePool` in `game.ts` hold deactivated instances to avoid GC pressure. Always pop from the pool before constructing a new object.
- **Reflex Mode** — `reflexFadeVal` (0–1) interpolates smoothly. `timeScale = 1.0 − 0.85 × reflexFadeVal` is passed to every `update()` call; frame rate is unchanged.
- **Auto-play** — `autoDecks` (4 virtual decks, one per suit) in `game.ts`. The loop drains them one card at a time, cycling suits, and resets via `clearScreen()` when exhausted.
- **`getDynamicLimits()`** in `effectState.ts` reduces max cards/particles when neon or depth effects are active to maintain frame rate.
