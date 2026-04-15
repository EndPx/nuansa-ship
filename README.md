# ⚓ Nuansa Ship

> **A tactical naval RPG on the Initia blockchain, inspired by Front Mission 4.**
> Command a Captain, a Ship, and a Crew of three — all on‑chain NFTs — through grid‑based PvE battles where every move, attack, and skill is signed by your wallet.

Part of the [Nuansa Universe](#-the-nuansa-universe) · Built for INITIATE Hackathon S1 · Next.js 15 · React 19 · Phaser 3 · Move VM

---

## 🏆 INITIATE Hackathon Submission

| | |
|---|---|
| **Hackathon** | INITIATE: The Initia Hackathon · Season 1 |
| **Track** | Gaming / Consumer (Move VM) |
| **Rollup Chain ID** | `nuansa-ship-1` |
| **Smart‑Contract VM** | Move (Aptos‑style, not Sui) |
| **Native Initia feature** | **Auto‑signing via session keys** — once granted, every in‑battle TX signs silently, so a turn‑based RPG actually feels like one. |
| **Demo video** | _to be linked in `.initia/submission.json` before submission_ |
| **Deployed module** | _to be written back into `lib/contracts.ts` after `minitiad tx move publish`_ |

> **Why this matters for Initia:** turn‑based tactics traditionally collapse under the weight of wallet popups. Session keys collapse the UX back into a console game.

---

## 🎮 Gameplay at a glance

1. **Commission your Captain.** Connect your wallet; a single TX mints a Captain + Corvette + Gunner + initializes your Port.
2. **Manage your Port.** Upgrade 5 buildings (Shipyard, Armory, Barracks, Admiral's Hall, Warehouse) to unlock stronger ship classes and raise stats.
3. **Set Sail into battle.** A 10×8 ocean grid. Player on the left, enemies on the right. Click‑to‑move, click‑to‑attack, click‑to‑cast skills. Auto‑signing means no popups mid‑turn.
4. **Clear the wave.** Loot rolls deterministically based on wave and block seed; Captain gains XP; injured crew must `rest_crew` before redeployment.
5. **Scale up.** Wave 1–3 = skirmish, Wave 4–6 = multi‑enemy formations, Wave 7+ = boss with AoE.

---

## 🧭 The 3‑Part Battle Unit

Every engagement = **Captain + Ship + Crew (max 3)** — all NFTs, all owned by the player, all composable.

| Entity | Collection | Core stats |
|---|---|---|
| **Captain** | `NSC` | leadership 0–100, tactics 0–100, xp, level 1–50, special skill id |
| **Ship** | `NSV` | class (Corvette→Battleship), hull/max_hull, engine, weapon_damage, weapon_range, armor |
| **Crew** | `NSCR` | role (Gunner/Navigator/Engineer), skill id, morale, hp, status (Ready/Injured/KO) |

Stats are stored at the player address via Aptos‑style `move_to<T>(&signer, …)`, so they travel with the account and are queryable in one `borrow_global<T>` lookup per module.

### Ship classes (unlocked via Shipyard level)

| Class | HP | engine | dmg | range | armor | Unlock |
|---|---|---|---|---|---|---|
| Corvette | 500 | 4 | 60 | 2 | 5 | default |
| Frigate | 800 | 3 | 90 | 3 | 15 | Shipyard Lv 2 |
| Destroyer | 1200 | 2 | 130 | 4 | 25 | Shipyard Lv 3 |
| Battleship | 2000 | 1 | 180 | 5 | 40 | Shipyard Lv 5 |

### Crew roles

- **Gunner** — +15% weapon damage, skill: multi‑shot (2 targets)
- **Navigator** — +1 engine tile, skill: evasive maneuver (dodge next attack)
- **Engineer** — +50 HP repair once / battle, skill: emergency repair (+100 HP)

---

## ⚡ Native feature — auto‑signing

`useAutoSign` requests a session key scoped to just `submit_move` and `claim_reward` when the player clicks **Set Sail**. The session expires after 1 hour or on explicit revoke.

```ts
// frontend/src/hooks/useAutoSign.ts
await requestSessionKey({
  allowedMessages: [
    { typeUrl: '/initia.move.v1.MsgExecute', value: { function: 'submit_move' } },
    { typeUrl: '/initia.move.v1.MsgExecute', value: { function: 'claim_reward' } },
  ],
  expiresIn: 3600,
})
```

Inside the battle loop, Phaser emits a `game:move` or `game:attack` CustomEvent on the window. React catches it and `signAndBroadcast`s silently — no modal, no confirmation blur, no rhythm break.

---

## 🗺️ Architecture

```
┌───────────────────┐         ┌────────────────────┐
│  Phaser 3 scene   │ events  │  React / Next 15   │
│  BattleScene      │ ──────► │  battle/page.tsx   │
│  PortScene        │         │  (HUD + telemetry) │
└───────────────────┘ ◄────── └────────────────────┘
                    window events
                    ui:setAction | ui:endTurn

┌────────────────────────────────────────┐
│  InterwovenKit — wallet + session key  │
└────────────────────────────────────────┘
                    │ signAndBroadcast
                    ▼
┌────────────────────────────────────────┐
│  Move modules on nuansa-ship-1         │
│  captain · ship · crew · port ·        │
│  loot · battle · mint_starter          │
└────────────────────────────────────────┘
```

### Event bridge

| Direction | Event | Payload |
|---|---|---|
| Phaser → React HUD | `battle:turn` | `{ turn: 'player' \| 'enemy' }` |
| Phaser → React HUD | `battle:hp` | `{ current, max }` |
| Phaser → React HUD | `battle:wave` | `{ wave }` |
| Phaser → React HUD | `battle:log` | `{ type, message }` |
| React → Phaser | `ui:setAction` | `{ mode: 'move' \| 'attack' \| 'skill' }` |
| React → Phaser | `ui:endTurn` | — |
| React → chain | `game:move` / `game:attack` / `game:skill` | signed via session key |

---

## 🎨 Design — Maritime Command Console

The UI isn't a dashboard; it's a CRT mounted inside a warship. Every page reinforces the aesthetic.

- **Palette** — abyss `#0A1628`, teal glow `#52E0C4`, parchment `#E7D4A8`, gold `#C8A255`, blood `#E63946`
- **Fonts** — Cinzel (display, naval), VT323 (HUD/pixel telemetry), JetBrains Mono (body), IM Fell English (parchment writ)
- **Details** — CRT scanlines, grain noise, radar pulse, compass rose, wax seals on the mint commission, art‑deco corner brackets around every console panel

---

## 📁 Project structure

```
nuansa-ship/
├── contracts/                Move smart contracts
│   ├── Move.toml
│   └── sources/
│       ├── captain.move            CaptainStats + XP / leveling
│       ├── ship.move               ShipStats + equipment slots
│       ├── crew.move               CrewStats + role effects + fatigue
│       ├── port.move               Port + Inventory + building upgrades
│       ├── loot.move               Deterministic drop table
│       ├── battle.move             Battle state + turn resolver
│       └── mint_starter.move       Collection init + starter pack
├── frontend/
│   ├── public/assets/              Pixellab‑generated pixel art
│   │   ├── ships/ tilesets/ buildings/ portraits/ effects/
│   └── src/
│       ├── app/                    Next.js app‑router pages
│       │   ├── page.tsx            Landing cinematic
│       │   ├── port/page.tsx       Port management console
│       │   └── battle/page.tsx     Combat console
│       ├── components/             React components
│       │   ├── GameCanvas.tsx      Phaser mount + event bridge
│       │   ├── MintScreen.tsx      Parchment commission writ
│       │   ├── BattleLog.tsx       Terminal telemetry
│       │   └── WalletProvider.tsx  InterwovenKit provider
│       ├── game/
│       │   ├── config.ts           640×512, pixelArt: true, 10×8 grid
│       │   └── scenes/             PreloadScene, PortScene, BattleScene, UIScene
│       ├── hooks/                  useProfile, useFleet, usePort, useBattle, useAutoSign
│       └── lib/                    contracts.ts, types.ts
├── scripts/deploy.sh
└── .initia/submission.json
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- pnpm / npm
- WSL2 + Ubuntu (for `initiad` / `weave` / `minitiad`)
- Docker Desktop running

### 1 · Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# → http://localhost:3000
```

> `--legacy-peer-deps` is required because `@initia/interwovenkit-react` peer‑depends on React 19.2+; the project is already on 19.2, but npm's strict resolver still complains.

### 2 · Contracts (WSL / Linux)

```bash
# One‑time environment setup via the initia-appchain-dev skill
npx skills add initia-labs/agent-skills

# Inside Claude Code:
#   "Using the initia-appchain-dev skill, verify initiad / weave / minitiad."
#   "Using the initia-appchain-dev skill, fund the Gas Station on nuansa-ship-1."

cd contracts
minitiad move build --named-addresses nuansa_ship=<your_address>
minitiad tx move publish \
  --named-addresses nuansa_ship=<your_address> \
  --from <key_name> \
  --gas auto --gas-adjustment 1.4
```

Then copy the published module address into `frontend/src/lib/contracts.ts → CONTRACT_ADDRESS`.

### 3 · Pixel art assets

All assets under `frontend/public/assets/` were generated via the Pixellab MCP. To regenerate or extend, use prompts like:

```
create_topdown_tileset(lower="deep dark ocean water", upper="shallow teal ocean water")
create_character(description="top-down warship teal white pixel art naval", n_directions=4)
```

See `CLAUDE.md § Pixel Art — Pixellab MCP` for the full list.

---

## 🧪 On‑chain API surface

```move
// mint_starter.move
public entry fun mint_starter_pack(account: &signer, captain_name: String)
public fun has_profile(player: address): bool

// port.move
public entry fun upgrade_building(account: &signer, building_type: u8)
public entry fun rest_crew(account: &signer, crew_token_id: String)

// battle.move
public entry fun start_battle(account: &signer, wave: u8)
public entry fun submit_move(account: &signer, move_type: u8, x: u8, y: u8)
public entry fun claim_reward(account: &signer)
```

`move_type`: `0 = move`, `1 = attack`, `2 = crew_skill`.
`building_type`: `0 = Shipyard`, `1 = Armory`, `2 = Barracks`, `3 = Admiral's Hall`, `4 = Warehouse`.

---

## 📋 Submission checklist

- [x] Smart contracts authored with Aptos‑style Move (verified `simple_nft` API)
- [x] Frontend scaffolded with Next 15 + React 19 + Phaser 3
- [x] Landing / Mint / Port / Battle pages built with cinematic Maritime Command aesthetic
- [x] Phaser ↔ React event bridge wired for HUD + action rail
- [ ] Own appchain deployed — `nuansa-ship-1` rollup chain ID confirmed in submission.json
- [ ] InterwovenKit wallet integration live (currently stubbed; provider + hooks scaffolded)
- [ ] Auto‑signing session key demo visible in recorded gameplay
- [ ] `.initia/submission.json` filled with `deployed_address`, `commit_sha`, `demo_video_url`
- [ ] Demo video (1–3 min) uploaded to YouTube / Loom
- [ ] Submitted on [DoraHacks → INITIATE](https://dorahacks.io/hackathon/initiate)

---

## 🌊 The Nuansa Universe

| Game | Chain | Status |
|---|---|---|
| Nuansa Land | Base | Active — Base Batches 003 |
| **Nuansa Ship** | **Initia** | **INITIATE S1 submission** |
| Nuansa FC | 0G | Brainstorm phase |

One universe. Three chains. Shared lore.

---

## 📜 License

MIT. Pixel art generated via Pixellab under their subscription terms.
