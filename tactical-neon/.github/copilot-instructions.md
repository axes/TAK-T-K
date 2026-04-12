# Copilot instructions for Tactical Neon

## Build, test, and lint

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`
- Tests: no test runner/scripts are currently configured in `package.json` (so there is no single-test command yet).
- Lint: no lint scripts/tools are currently configured in `package.json`.

## High-level architecture

- **Runtime and entrypoint**: `src/main.js` creates a Phaser game with scenes in this order: `BootScene` -> `MainScene` -> `SetupScene` -> `BattleScene` -> `HowToPlayScene` -> `StoryScene` -> `CreditsScene` -> `SettingsScene`.
- **Main gameplay flow**: the primary playable path is `MainScene` -> `SetupScene` -> `BattleScene`.
- **Single shared game state**: `createGameState()` (`src/gameState.js`) builds one mutable state object (phase, turn, selected unit/action, units, logs). `SetupScene` creates it, then passes it to `BattleScene` via `scene.start(...)`.
- **Domain split**:
  - `src/entities/Unit.js`: unit model and turn/AP mutation methods.
  - `src/systems/TurnSystem.js`: turn ownership, selection tracking, and victory checks.
  - `src/systems/MovementSystem.js`: reachable-cell/path-cost logic and movement execution.
  - `src/systems/CombatSystem.js`: target acquisition and attack resolution (including class-specific effects).
  - `src/systems/AISystem.js`: greedy AI orchestration that reuses `MovementSystem` and `CombatSystem` to execute J2 turns in `pve`.
- **Presentation split**:
  - `src/scenes/*`: input handling + board rendering + orchestration of systems.
  - `src/ui/HUD.js` and `src/ui/unitGlyph.js`: right-side HUD (including `FINALIZAR TURNO` + confirmation), and setup unit glyph visuals (`createUnitGlyph` in `SetupScene`).
- **Configuration-driven gameplay**: `src/config.js` is the authoritative place for board dimensions, colors, unit templates, setup rows, and unit order.

## Key conventions in this codebase

- **Phaser import style**: Phaser is imported from a CDN URL (`https://cdn.jsdelivr.net/.../phaser.esm.js`) inside source files, not from an npm package import.
- **Text and logs are uppercase Spanish**: UI labels and combat/setup log entries are intentionally uppercase Spanish strings; keep new strings consistent with that tone.
- **Action state model**: `gameState.selectedAction` uses `'preview' | 'move' | 'basic' | 'special'`; selecting a unit defaults to `'move'` only when movement is available, and actions return to `'preview'` after resolving.
- **Selection is centralized in `TurnSystem`**: scenes should read/change selected unit through `TurnSystem` (`selectUnit`, `clearSelection`, `getSelectedUnit`) instead of ad-hoc state writes.
- **End-turn behavior is HUD-driven**: `HUD` emits `onEndTurn`; `BattleScene.tryEndTurnFromButton()` opens confirmation when the active player still has actions and ends immediately otherwise.
- **Mode and input flags live in `gameState`**: `gameState.mode` uses `'pvp' | 'pve'`; `gameState.inputLocked` blocks board/HUD interaction during AI execution.
- **Unit identity and lifecycle**: units are pre-created from `UNIT_ORDER`/`UNIT_TEMPLATES`, then placed during setup; defeated units remain in `gameState.units` and are filtered via `unit.isAlive()`.
- **Grid math conventions**:
  - Positions are `{ x, y }` in grid coordinates.
  - Orthogonal movement costs `1 AP`, diagonal movement costs `2 AP`.
  - Occupancy checks use `"x,y"` keys (`cellKey(...)`) in movement/combat helpers.
