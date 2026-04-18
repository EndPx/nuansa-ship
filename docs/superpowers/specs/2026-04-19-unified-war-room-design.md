# Unified War Room — Codebase-Wide Design Adjustment

**Date:** 2026-04-19
**Owner:** Frontend
**Status:** Approved — ready for implementation plan

## Purpose

Make every page in the Nuansa Ship frontend speak the same Maritime Command Console visual language by extracting shared primitives, consolidating tokens, and layering a combat-intensity treatment onto `/battle`. Result: less duplicated JSX, tighter visual coherence across routes, and a `/battle` page that *feels* like combat.

## Success criteria

- All four routes (`/`, `/` → MintScreen, `/port`, `/battle`) render without visual regression
- Panel / StatBar / CornerFrame / TacticalButton / CrewRow / CompassWatermark live in `components/ui/` and are consumed by every page that needs them
- `npx tsc --noEmit` passes clean
- Dev server smoke test: no console errors on any route
- `/battle` shows a measurable intensity escalation during enemy turn (red vignette + faster scanlines + reticle on attack mode + damage floaters)

## Non-goals (out of scope this cycle)

- Pixel art regeneration (sub-project C — separate cycle)
- Move contract deployment (sub-project B — separate cycle)
- Audio cues, particle systems, boss-specific HUD variants
- `tailwind.config` token sync (tokens stay CSS-variable only for now)
- New features (PvP, shop, settings)

## Architecture

### Phase 1 — Shared UI primitives

New directory: `frontend/src/components/ui/`

| Component | Responsibility | Props |
|---|---|---|
| `Panel.tsx` | Console-styled card with title strip and corner brackets | `title: string`, `children`, optional `accent: 'teal' \| 'blood' \| 'gold'` |
| `StatBar.tsx` | Labeled progress bar, numeric or percent | `label`, `current`, `max?`, `variant: 'teal' \| 'blood' \| 'gold' \| 'auto'`, `flash?: boolean` |
| `CornerFrame.tsx` | Wraps children with 4 tactical brackets | `children`, `tone?: 'teal' \| 'blood'` |
| `TacticalButton.tsx` | Single button primitive (replaces `btn-tactical` CSS-class usage + `ActionBtn`) | `children`, `variant: 'teal' \| 'blood' \| 'gold'`, `disabled`, `onClick`, `glitch?: boolean` |
| `CrewRow.tsx` | Role icon + hp bar + status chip | `role: 0..2`, `hp: number`, `status: 0..2` |
| `CompassWatermark.tsx` | Slow-rotating rhumb SVG | `size`, `opacity`, `tone?: 'brass' \| 'teal'` |
| `WaxSeal.tsx` | Red wax seal with anchor glyph (moved from MintScreen) | `className?` |

**Boundaries:** Each primitive is purely presentational — no hooks, no routing, no data fetching. Consumers pass data in.

### Phase 2 — Token consolidation (`globals.css`)

Add semantic aliases at the top of `:root`:
```
--ok:    var(--teal-glow);
--warn:  var(--gold);
--alert: var(--blood);

--panel-bg:     linear-gradient(180deg, rgba(15,30,53,0.85) 0%, rgba(8,19,32,0.95) 100%);
--panel-border: rgba(42,157,143,0.3);
--hud-text:     var(--teal-glow);
```

Add `body.enemy-turn` global rule that:
- Increases scanline density (`2px → 1px` stripe gap)
- Adds a faint red vignette via `body.enemy-turn::after` overlay
- Boosts scanline opacity by ~50%

Add keyframes (group comment `/* War Room intensity */`):
- `shake-hit` — translateX ±4px for 400ms
- `damage-float` — `{ opacity 1 → 0, translateY 0 → -40px }` over 900ms
- `red-flash` — HP bar white flash on decrease
- `reticle-rotate` — 2 counter-rotating rings
- `crt-jitter` — brief CRT glitch on damage taken

### Phase 3 — Page refactors

- `app/page.tsx` (Landing) — keep structure; swap inline compass for `<CompassWatermark>` where applicable
- `components/MintScreen.tsx` — import `WaxSeal` + `CompassWatermark` from `ui/`; delete local duplicates
- `app/port/page.tsx` — replace inline `Panel` / `Stat` / `CrewRow` / `Resource` / `BuildingRow` helpers; the compass backdrop becomes `<CompassWatermark size={820} opacity={0.05} />`
- `app/battle/page.tsx` — replace inline `Panel` / `HpBar` / `ActionBtn` / `CrewChip`; gains the D2 intensity layer

### Phase 4 — Battle intensity layer (D2)

1. `useEffect` listening to `battle:turn`: toggles `document.body.classList` for `enemy-turn`
2. New `components/DamageFloater.tsx`:
   - Subscribes to `battle:damage` events with payload `{ amount: number, side: 'player'|'enemy', x: number, y: number, crit?: boolean }`
   - Renders a positioned stack of floating numbers that auto-expire after 900ms
   - Color: blood for player-dealt damage, gold for crits, teal for heal
3. `battle:shake` event handler adds `.shake-hit` class to canvas frame for 400ms
4. HP bar gains `flash` prop: when `current` decreases, briefly overlays white before transitioning to new width (150ms flash + 400ms ease)
5. Reticle overlay in `/battle` canvas frame when action mode === `'attack'` — CSS-only, 2 rotating rings + 4 tick corners; listens to `ui:setAction` events or local state mirrored from them

### Phase 5 — Hooks/lib consistency

- `useFleet` / `usePort` — ensure both return `{ captain, ship, crew }` and `{ port, inventory }` plus `isLoading, error` (already mostly there; audit + align)
- `lib/contracts.ts` — add JSDoc on each builder explaining the Move function signature
- `hooks/useAutoSign.ts` — already consistent, no changes

### Phase 6 — Verification

- `npx tsc --noEmit` → clean
- Manual smoke in Chrome MCP (or local browser): load each route, toggle turn on `/battle`, click Attack (reticle appears), simulate damage via console `window.dispatchEvent(new CustomEvent('battle:damage', { detail: { amount: 47, side: 'player', x: 320, y: 256 } }))` → verify floater renders
- Commit per phase, push final

## Event contract additions

| Event | Emitter | Payload | Consumer |
|---|---|---|---|
| `battle:damage` | `BattleScene` | `{ amount, side, x, y, crit? }` | `<DamageFloater>` |
| `battle:shake` | `BattleScene` | `{ intensity?: 1..3 }` | `/battle` page canvas frame |
| `battle:turn` | `BattleScene` (existing) | `{ turn: 'player'\|'enemy' }` | `/battle` page → body class toggle |

## Data flow

Phaser stays source-of-truth for battle state. React reads events, toggles classes, renders floaters and reticle. No new state store — only `useState` + event listeners, same pattern as existing HUD.

## Error handling

- Missing event detail: each handler defensively reads `e?.detail` and skips if malformed
- Unmounted component: all listeners registered in `useEffect` with cleanup
- `DamageFloater` caps at 12 concurrent floaters to prevent runaway DOM

## Testing

Presentation-only changes — no unit tests added. Verification is:
- TypeScript compile
- Manual smoke test of all 4 routes
- Console-driven damage event to exercise floater

## Rollout risk

- **Biggest risk:** Shared extraction silently drops a per-page styling detail
- **Mitigation:** Extract one primitive at a time, commit after each, eyeball the consuming page via dev server before moving on

## Phase commits

| Phase | Commit message |
|---|---|
| 1 | Extract shared UI primitives to components/ui |
| 2 | Consolidate design tokens and add war-room keyframes |
| 3 | Refactor pages to consume shared UI primitives |
| 4 | Add battle intensity layer (damage floaters, shake, red alert, reticle) |
| 5 | Align hook return shapes and add contract builder JSDoc |
| 6 | Verify + smoke test (may be empty if nothing changed) |

## Out-of-scope follow-ups

- Sub-project C: pixel art regeneration via Chrome MCP + pixellab website
- Sub-project B: deploy Move modules and wire `CONTRACT_ADDRESS`
- Sub-project A: end-to-end wallet-to-battle walk-through after B lands
