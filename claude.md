# Nuansa Ship — Claude Code Context

> Tactical naval RPG pixel art game on Initia blockchain.
> Inspired by Front Mission 4. Part of the Nuansa Universe.
> **Deadline: April 15, 2026 — 11:00 PM UTC. No extensions.**

---

## Hackathon Info

| | |
|---|---|
| **Hackathon** | INITIATE: The Initia Hackathon (Season 1) |
| **Platform** | DoraHacks |
| **Deadline** | April 15, 2026 — 11:00 PM UTC |
| **Prize pool** | $25,000 USD |
| **Track** | Gaming / Consumer (Move VM) |
| **Docs** | https://docs.initia.xyz/hackathon |
| **Submission** | https://dorahacks.io/hackathon/initiate |

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Smart contract | Move VM (Aptos-style) | NOT Sui Move — see critical notes below |
| Frontend | Next.js 14 + React | App router |
| Game engine | Phaser 3 | Mounted inside React div |
| Wallet + TX | `@initia/interwovenkit-react` | Official Initia wallet kit |
| Native feature | Auto-signing (session key) | **Required for hackathon** |
| Pixel art | Pixellab AI MCP | `@https://api.pixellab.ai/mcp/docs` |
| Appchain tools | `weave` CLI, `initiad`, `minitiad` | Setup via `weave init` |
| Initia AI skill | `initia-labs/agent-skills` | MCP skill for appchain dev |
| Styling | Tailwind CSS | |

### Frontend package.json dependencies

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "phaser": "^3.88.0",
    "@initia/interwovenkit-react": "latest",
    "@initia/initia.js": "latest",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0"
  }
}
```

---

## Move VM — Critical Notes

This project uses **Aptos-style Move**, NOT Sui Move. Never generate Sui patterns.

```move
// CORRECT — Aptos Move (use this)
struct Ship has key, store { hull: u64 }
move_to(&signer, Ship { hull: 1000 });
borrow_global<Ship>(addr);
borrow_global_mut<Ship>(addr);

// WRONG — Sui Move (never use)
struct Ship has key { id: UID }        // UID does not exist
transfer::transfer(ship, recipient);   // does not exist
sui::object::new(ctx)                  // does not exist
```

**Rules:**
- Use `signer` for account param in all entry functions
- Store game data with `move_to(&signer, resource)`
- Read with `borrow_global<T>(addr)` / `borrow_global_mut<T>(addr)`
- No `UID`, no `object::new`, no `transfer::transfer`, no `TxContext`
- Validate with `assert!(condition, ERROR_CODE)`
- Collections with `vector<T>`

### Error codes (define at top of each module)

```move
const E_ALREADY_MINTED: u64        = 1;
const E_CREW_FULL: u64             = 2;
const E_NOT_OWNER: u64             = 3;
const E_INVALID_CLASS: u64         = 4;
const E_SHIP_NOT_EQUIPPED: u64     = 5;
const E_BATTLE_NOT_ACTIVE: u64     = 6;
const E_NOT_PLAYER_TURN: u64       = 7;
const E_INSUFFICIENT_MATERIALS: u64 = 8;
const E_BUILDING_MAX_LEVEL: u64    = 9;
const E_CREW_INJURED: u64          = 10;
```

---

## Initia Agent Skills Setup

Before doing anything with the appchain, install the Initia skill so Claude Code can manage the appchain, deploy contracts, and verify setup automatically.

```bash
npx skills add initia-labs/agent-skills
```

This gives Claude Code access to tools for:
- Setting up the Move VM environment (`initiad`, `weave`, `minitiad`)
- Verifying tool installation and PATH
- Launching and managing the appchain
- Deploying Move contracts to testnet

**Usage in prompts:**
```
Using the `initia-appchain-dev` skill, please set up my environment for the Move track.

Using the `initia-appchain-dev` skill, verify that initiad, weave, and minitiad are properly installed.

Using the `initia-appchain-dev` skill, verify my appchain is healthy and my Gas Station account has balance.
```

Always run this skill setup first before any `weave init` or contract deployment steps.

---

## Move.toml

```toml
[package]
name = "nuansa_ship"
version = "0.1.0"

[dependencies]
MoveStdlib = { git = "https://github.com/initia-labs/movevm.git", subdir = "precompile/modules/move_stdlib", rev = "main" }
InitiaStdlib = { git = "https://github.com/initia-labs/movevm.git", subdir = "precompile/modules/initia_stdlib", rev = "main" }

[addresses]
nuansa_ship = "_"
std = "0x1"
initia_std = "0x1"
```

---

## Folder Structure

```
nuansa-ship/
├── CLAUDE.md
├── .initia/
│   └── submission.json
├── README.md
├── contracts/
│   ├── Move.toml
│   └── sources/
│       ├── captain.move          # CaptainStats resource + XP system
│       ├── ship.move             # ShipStats resource + equipment slots
│       ├── crew.move             # CrewStats resource + roles + fatigue
│       ├── port.move             # Port struct + building upgrades
│       ├── loot.move             # Drop table + reward distribution
│       ├── battle.move           # PvE battle state + turn resolver
│       └── mint_starter.move     # NFT collections init + starter pack
├── frontend/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── public/                       # Next.js serves /public as root URL /
│   │   └── assets/
│   │       ├── ships/                # ship_player.png+.json, ship_enemy.png+.json, ship_boss.png+.json
│   │       ├── tilesets/             # ocean.png, harbor.png
│   │       ├── buildings/            # shipyard.png, armory.png, barracks.png, admirals_hall.png, warehouse.png
│   │       ├── portraits/            # captain.png, gunner.png, navigator.png, engineer.png
│   │       └── effects/              # explosion.png + explosion.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Landing + wallet connect + mint gate
│       │   ├── port/
│       │   │   └── page.tsx          # Port management page
│       │   └── battle/
│       │       └── page.tsx          # Battle game page
│       ├── game/
│       │   ├── config.ts             # Phaser config: 640×512, pixelArt: true
│       │   └── scenes/
│       │       ├── PreloadScene.ts   # Load all assets
│       │       ├── PortScene.ts      # Harbor top-down view
│       │       ├── BattleScene.ts    # Grid combat 10×8
│       │       └── UIScene.ts        # HUD overlay (runs parallel with BattleScene)
│       ├── components/
│       │   ├── GameCanvas.tsx        # Phaser mount + event bridge
│       │   ├── WalletProvider.tsx    # InterwovenKit provider wrapper
│       │   ├── MintScreen.tsx        # First login: enter captain name + mint
│       │   ├── UnitPanel.tsx         # Captain + ship + crew display
│       │   ├── UpgradePanel.tsx      # Building upgrade modal
│       │   └── BattleLog.tsx         # Action log sidebar
│       ├── hooks/
│       │   ├── useAutoSign.ts        # Session key setup
│       │   ├── useProfile.ts         # Check PlayerProfile on-chain
│       │   ├── usePort.ts            # Fetch + mutate port state
│       │   ├── useFleet.ts           # Fetch captain + ship + crew NFT data
│       │   └── useBattle.ts          # Battle state + submit move
│       └── lib/
│           ├── contracts.ts          # CONTRACT_ADDRESS + TX builder fns
│           └── types.ts              # Shared TypeScript types
└── scripts/
    └── deploy.sh
```

---

## NFT Standard — Captain, Ship, Crew

Initia Move NFTs use `0x1::simple_nft` (verified from Initia official docs). Each entity is an NFT inside a named collection. Game stats are stored as a **companion resource at the NFT object address** so stats travel with the token when traded.

### Verified API (from Initia docs)

```move
use std::string::{Self, String};
use std::option;
use initia_std::simple_nft;
use initia_std::object;
use initia_std::signer;

// Create collection — call ONCE during contract deploy
public entry fun initialize_collections(account: &signer) {
    simple_nft::create_collection(
        account,
        string::utf8(b"Captains of Nuansa Ship"),  // description
        option::none<u64>(),                        // max_supply: unlimited
        string::utf8(b"NSC"),                       // collection name (unique key)
        string::utf8(b"https://nuansaship.xyz/captain"),
        true,   // mutable_description
        false,  // mutable_royalty
        true,   // mutable_uri
        true,   // mutable_nft_description
        true,   // mutable_nft_properties
        true,   // mutable_nft_uri
    );
    // repeat for "NSV" (Ships) and "NSCR" (Crew)
}

// Mint NFT + attach game stats resource
public fun mint_captain_internal(account: &signer, token_id: String): address {
    let creator = signer::address_of(account);

    simple_nft::mint(
        account,
        string::utf8(b"NSC"),   // collection name
        string::utf8(b""),      // description
        token_id,               // unique token id
        string::utf8(b""),      // uri
        vector[],               // property_keys
        vector[],               // property_types
        vector[],               // property_values
        option::some(creator),  // recipient (mint to self)
    );

    // derive object address to attach stats
    let token_addr = object::create_object_address(&creator, *string::bytes(&token_id));
    let obj_signer = object::generate_signer_for_extending(&token_addr);
    move_to(&obj_signer, CaptainStats {
        leadership: 50,
        tactics: 50,
        special_skill_id: 0,
        xp: 0,
        level: 1,
    });

    token_addr
}
```

Same pattern for Ship and Crew: `simple_nft::mint` → derive object address → `move_to` stats resource.

---

## First Login — Mint Flow

Every new player must mint a starter pack before accessing Port or Battle.

### On-chain gate

```move
// mint_starter.move
struct PlayerProfile has key {
    captain_token_id: String,
    ship_token_id: String,
    crew_token_ids: vector<String>,
}

public fun has_profile(player: address): bool {
    exists<PlayerProfile>(player)
}

// Single TX: mint Captain NFT + Corvette NFT + Gunner NFT + Port
public entry fun mint_starter_pack(account: &signer, captain_name: String) {
    let player = signer::address_of(account);
    assert!(!exists<PlayerProfile>(player), E_ALREADY_MINTED);

    mint_captain_internal(account, captain_name);

    let ship_id = build_unique_id(b"ship_", player);
    mint_ship_internal(account, ship_id, 0); // 0 = Corvette

    let crew_id = build_unique_id(b"crew_", player);
    mint_crew_internal(account, crew_id, 0); // 0 = Gunner

    // Initialize Port (all buildings at level 0)
    move_to(account, Port {
        owner: player,
        shipyard_level: 0,
        armory_level: 0,
        barracks_level: 0,
        admirals_hall_level: 0,
        warehouse_level: 0,
    });

    move_to(account, PlayerProfile {
        captain_token_id: captain_name,
        ship_token_id: ship_id,
        crew_token_ids: vector[crew_id],
    });
}
```

### App routing (page.tsx)

```tsx
// app/page.tsx
'use client'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { useProfile } from '@/hooks/useProfile'
import { useRouter } from 'next/navigation'
import { MintScreen } from '@/components/MintScreen'

export default function LandingPage() {
  const { address, openWallet } = useInterwovenKit()
  const { hasProfile, isLoading } = useProfile(address)
  const router = useRouter()

  if (!address)    return <button onClick={openWallet}>Connect Wallet</button>
  if (isLoading)   return <p>Loading...</p>
  if (!hasProfile) return <MintScreen />

  router.push('/port')
  return null
}
```

### MintScreen component

```tsx
// components/MintScreen.tsx
'use client'
import { useState } from 'react'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { buildMintStarterPackTx } from '@/lib/contracts'

export function MintScreen() {
  const [captainName, setCaptainName] = useState('')
  const { signAndBroadcast } = useInterwovenKit()

  const handleMint = async () => {
    if (!captainName.trim()) return
    await signAndBroadcast(buildMintStarterPackTx(captainName))
    window.location.href = '/port'
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Name Your Captain</h1>
      <input
        className="border p-2 rounded"
        placeholder="e.g. albary.init"
        value={captainName}
        onChange={e => setCaptainName(e.target.value)}
      />
      <p className="text-sm text-gray-500">
        You receive: 1 Captain NFT + 1 Corvette NFT + 1 Gunner NFT
      </p>
      <button
        className="bg-teal-600 text-white px-6 py-2 rounded disabled:opacity-50"
        onClick={handleMint}
        disabled={!captainName.trim()}
      >
        Mint Starter Pack
      </button>
    </div>
  )
}
```

---

## Game Concept — 3-Part Battle Unit

Every battle unit = **Captain + Ship + Crew (max 3)**. All are NFTs owned by the player.

### Captain (`captain.move`)

NFT collection "NSC". Stats as `CaptainStats` resource at NFT object address.

```move
struct CaptainStats has key {
    leadership: u8,          // 0–100. boosts crew morale passively
    tactics: u8,             // 0–100. unlocks special maneuvers
    special_skill_id: u8,    // 0=none 1=Broadside 2=Evasive Drift
    xp: u64,
    level: u8,               // 1–50. level = xp / 1000
}
```

Level-up: every 1000 XP → level+1, leadership+5, tactics+5 (capped at 100).

### Ship (`ship.move`)

NFT collection "NSV". Stats as `ShipStats` resource at NFT object address.

```move
struct ShipStats has key {
    ship_class: u8,
    hull: u64,
    max_hull: u64,
    engine: u8,
    weapon_damage: u64,
    weapon_range: u8,
    armor: u8,
    captain_token_id: String,       // empty string = none
    crew_token_ids: vector<String>, // max 3
}
```

Ship classes:

| Class | max_hull | engine | weapon_damage | weapon_range | armor | Unlock |
|---|---|---|---|---|---|---|
| Corvette (0) | 500 | 4 | 60 | 2 | 5 | Default |
| Frigate (1) | 800 | 3 | 90 | 3 | 15 | Shipyard lv2 |
| Destroyer (2) | 1200 | 2 | 130 | 4 | 25 | Shipyard lv3 |
| Battleship (3) | 2000 | 1 | 180 | 5 | 40 | Shipyard lv5 |

### Crew (`crew.move`)

NFT collection "NSCR". Stats as `CrewStats` resource at NFT object address.

```move
struct CrewStats has key {
    role: u8,     // 0=Gunner 1=Navigator 2=Engineer
    skill_id: u8,
    morale: u8,   // 0–100. set at battle start = captain.leadership
    hp: u8,       // 0–100. depletes during battle
    status: u8,   // 0=Ready 1=Injured 2=KO
}
```

Role effects:
- Gunner (0): weapon_damage +15%, skill = multi-shot (2 targets)
- Navigator (1): engine +1 tile, skill = evasive maneuver (dodge next attack)
- Engineer (2): repair hull +50 HP once/battle, skill = emergency repair (+100 HP)

Fatigue after each battle:
- hp > 50 → Ready
- hp 1–50 → Injured (must `rest_crew` before next battle, else stats halved)
- hp = 0 → KO (requires Provisions item)

---

## Port System (`port.move`)

One Port per player. Created inside `mint_starter_pack`. 5 buildings, max level 5 each.

```move
struct Port has key {
    owner: address,
    shipyard_level: u8,
    armory_level: u8,
    barracks_level: u8,
    admirals_hall_level: u8,
    warehouse_level: u8,
}

struct Inventory has key {
    items: vector<Item>,
}

struct Item has store, drop {
    item_type: u8,  // 0=IronPlanks 1=SteelParts 2=Provisions 3=CommanderTome 4=Timber
    amount: u64,
}
```

Building effects:

| Building | Effects |
|---|---|
| Shipyard (0) | lv1=Corvette, lv2=Frigate, lv3=Destroyer, lv5=Battleship |
| Armory (1) | weapon_damage +10%/lv, weapon_range +1 at lv3 and lv5 |
| Barracks (2) | crew slots: lv0=1, lv2=2, lv4=3. Recovery speed +50% at lv3+ |
| Admiral's Hall (3) | XP ×1.0/1.25/1.5/1.75/2.0 per level |
| Warehouse (4) | inventory max = 10 + (level × 5) |

Upgrade costs:

| Building | Material | Per level |
|---|---|---|
| Shipyard | Iron Planks | level × 3 |
| Armory | Steel Parts | level × 2 |
| Barracks | Provisions | level × 3 |
| Admiral's Hall | Commander Tome | level × 1 |
| Warehouse | Timber | level × 4 |

Entry functions:

```move
// building_type: 0=Shipyard 1=Armory 2=Barracks 3=AdmiralsHall 4=Warehouse
public entry fun upgrade_building(account: &signer, building_type: u8)

// clear Injured → Ready status (barracks_level >= 1 required)
public entry fun rest_crew(account: &signer, crew_token_id: String)
```

---

## PvE Battle System (`battle.move`)

```move
struct Battle has key {
    id: u64,
    player: address,
    wave: u8,
    player_hp: u64,
    player_x: u8,
    player_y: u8,
    enemies: vector<Enemy>,
    turn: u8,    // 0=player 1=enemy
    status: u8,  // 0=active 1=won 2=lost
}

struct Enemy has store, drop {
    hp: u64,
    damage: u64,
    range: u8,
    x: u8,
    y: u8,
    alive: bool,
}
```

Wave config:

```
Wave 1–3:  1 enemy,  hp=300,  damage=40,  range=2
Wave 4–6:  2 enemies, hp=500, damage=70,  range=3, +20% damage bonus
Wave 7+:   1 boss,   hp=2000, damage=150, range=4, AoE on (seed%3==0)
```

Enemy AI (deterministic, seeded from block height):

```move
fun resolve_enemy_turn(battle: &mut Battle) {
    let seed = block::get_current_block_height();
    // each alive enemy: move toward player → attack if in range → boss AoE
}
```

Entry functions:

```move
public entry fun start_battle(account: &signer, wave: u8)

// move_type: 0=move 1=attack 2=crew_skill
public entry fun submit_move(account: &signer, move_type: u8, x: u8, y: u8)

// callable only when battle.status == 1 (won)
public entry fun claim_reward(account: &signer)
```

---

## Loot System (`loot.move`)

```move
fun roll_loot(wave: u8, seed: u64): Item {
    let roll = (seed % 100) as u8;
    if (wave <= 3) {
        if (roll < 50) Item { item_type: 0, amount: 2 }  // IronPlanks
        else           Item { item_type: 2, amount: 2 }  // Provisions
    } else if (wave <= 6) {
        if      (roll < 30) Item { item_type: 0, amount: 3 }
        else if (roll < 60) Item { item_type: 2, amount: 3 }
        else if (roll < 90) Item { item_type: 1, amount: 2 }  // SteelParts
        else                Item { item_type: 4, amount: 2 }  // Timber
    } else {
        if      (roll < 25) Item { item_type: 1, amount: 3 }
        else if (roll < 50) Item { item_type: 4, amount: 3 }
        else if (roll < 75) Item { item_type: 3, amount: 1 }  // CommanderTome
        else                Item { item_type: 1, amount: 5 }  // rare: bulk SteelParts
    }
}
```

---

## Auto-Signing (Session Key) — Native Initia Feature

Session key requested once on "Enter Battle". All in-battle TX sign silently.

```ts
// hooks/useAutoSign.ts
import { useInterwovenKit } from '@initia/interwovenkit-react'

export function useAutoSign() {
  const { requestSessionKey } = useInterwovenKit()

  const startBattleSession = async () => {
    await requestSessionKey({
      allowedMessages: [
        { typeUrl: '/initia.move.v1.MsgExecute', value: { function: 'submit_move' } },
        { typeUrl: '/initia.move.v1.MsgExecute', value: { function: 'claim_reward' } },
      ],
      expiresIn: 3600,
    })
  }

  return { startBattleSession }
}
```

---

## Phaser 3 Architecture

### Canvas config (`game/config.ts`)

```ts
// Grid: 10 cols × 8 rows × 64px = 640 × 512
export const TILE_SIZE    = 64
export const GRID_COLS    = 10
export const GRID_ROWS    = 8
export const CANVAS_WIDTH  = 640   // TILE_SIZE * GRID_COLS
export const CANVAS_HEIGHT = 512   // TILE_SIZE * GRID_ROWS

// Spawn positions (tile coordinates)
// Player: col=1, row=4
// Enemies wave 1–3: col=8, row=4
// Enemies wave 4–6: col=7 and col=9, row=3 and row=5
// Boss: col=8, row=4

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: CANVAS_WIDTH,    // 640
  height: CANVAS_HEIGHT,  // 512
  pixelArt: true,         // ALWAYS true — never disable
  backgroundColor: '#0a1628',
  scene: [PreloadScene, PortScene, BattleScene, UIScene],
}
```

### GameCanvas.tsx

```tsx
'use client'
import { useEffect } from 'react'
import Phaser from 'phaser'
import { phaserConfig } from '@/game/config'

export default function GameCanvas() {
  useEffect(() => {
    const game = new Phaser.Game(phaserConfig)
    return () => game.destroy(true)
  }, [])

  return <div id="game-container" style={{ width: 640, height: 512 }} />
}
```

### Event bridge (Phaser ↔ React)

```ts
// Phaser emits (inside BattleScene.ts):
window.dispatchEvent(new CustomEvent('game:move',   { detail: { x, y } }))
window.dispatchEvent(new CustomEvent('game:attack', { detail: { x, y } }))
window.dispatchEvent(new CustomEvent('game:skill',  { detail: { slot: 0 } }))

// React listens + auto-signs TX (inside GameCanvas.tsx):
useEffect(() => {
  const onMove = async (e: CustomEvent) => {
    const { x, y } = e.detail
    await signAndBroadcast(buildSubmitMoveTx(0, x, y))
    window.dispatchEvent(new CustomEvent('chain:confirmed', { detail: { type: 'move', x, y } }))
  }
  const onAttack = async (e: CustomEvent) => {
    const { x, y } = e.detail
    await signAndBroadcast(buildSubmitMoveTx(1, x, y))
  }
  window.addEventListener('game:move',   onMove   as EventListener)
  window.addEventListener('game:attack', onAttack as EventListener)
  return () => {
    window.removeEventListener('game:move',   onMove   as EventListener)
    window.removeEventListener('game:attack', onAttack as EventListener)
  }
}, [battleId])
```

### Scene flow

```
PreloadScene → PortScene ↔ BattleScene
                              + UIScene (always parallel)
```

### UIScene HUD layout

```
Top-left:     Player HP bar  [████████░░ 82%]
Top-center:   YOUR TURN / ENEMY TURN
Top-right:    Wave 3 / 7
Bottom-left:  Crew  G[✓] N[!] E[✓]   (✓=Ready !=Injured ✗=KO)
Bottom-right: [Move] [Attack] [Skill] [End Turn]
```

### PreloadScene asset loading

```ts
preload() {
  this.load.image('ocean-tiles',           '/assets/tilesets/ocean.png')
  this.load.image('harbor-tiles',          '/assets/tilesets/harbor.png')
  this.load.atlas('ship-player', '/assets/ships/ship_player.png', '/assets/ships/ship_player.json')
  this.load.atlas('ship-enemy',  '/assets/ships/ship_enemy.png',  '/assets/ships/ship_enemy.json')
  this.load.atlas('ship-boss',   '/assets/ships/ship_boss.png',   '/assets/ships/ship_boss.json')
  this.load.atlas('explosion',   '/assets/effects/explosion.png', '/assets/effects/explosion.json')
  this.load.image('building-shipyard',      '/assets/buildings/shipyard.png')
  this.load.image('building-armory',        '/assets/buildings/armory.png')
  this.load.image('building-barracks',      '/assets/buildings/barracks.png')
  this.load.image('building-admirals-hall', '/assets/buildings/admirals_hall.png')
  this.load.image('building-warehouse',     '/assets/buildings/warehouse.png')
  this.load.image('portrait-captain',  '/assets/portraits/captain.png')
  this.load.image('icon-gunner',       '/assets/portraits/gunner.png')
  this.load.image('icon-navigator',    '/assets/portraits/navigator.png')
  this.load.image('icon-engineer',     '/assets/portraits/engineer.png')
}
```

---

## Pixel Art — Pixellab MCP

**Generate ALL assets BEFORE writing any Phaser load code.**
Always prefix prompts with `@https://api.pixellab.ai/mcp/docs`.

```
# Step 1: Tilesets
create_topdown_tileset(lower="deep dark ocean water", upper="shallow teal ocean water")
→ frontend/public/assets/tilesets/ocean.png

create_topdown_tileset(lower="harbor wooden dock planks", upper="gray stone pier")
→ frontend/public/assets/tilesets/harbor.png

# Step 2: Player ship (32×32, 4 directions)
create_character(description="top-down warship teal white pixel art naval", n_directions=4)
animate_character(character_id="<id>", animation="idle")
animate_character(character_id="<id>", animation="walk")
→ frontend/public/assets/ships/ship_player.png + ship_player.json

# Step 3: Enemy ship (32×32)
create_character(description="top-down enemy warship dark red black menacing naval pixel art", n_directions=4)
→ frontend/public/assets/ships/ship_enemy.png + ship_enemy.json

# Step 4: Boss ship (48×48)
create_character(description="top-down massive battleship dark iron skull flag pixel art", n_directions=4)
→ frontend/public/assets/ships/ship_boss.png + ship_boss.json

# Step 5: Explosion effect
animate_character(character_id="<enemy_id>", animation="explode")
→ frontend/public/assets/effects/explosion.png + explosion.json

# Step 6: Port buildings (~64×64, static)
create_map_object(description="shipyard building top-down pixel art harbor dock")
create_map_object(description="armory building with cannons top-down pixel art harbor")
create_map_object(description="military barracks building top-down pixel art harbor")
create_map_object(description="admiral hall grand naval building top-down pixel art")
create_map_object(description="warehouse storage building top-down pixel art harbor")
→ frontend/public/assets/buildings/{name}.png

# Step 7: Portraits (32×32, static)
create_character(description="naval captain bust portrait pixel art uniform", n_directions=1)
create_character(description="ship gunner crew member pixel art portrait", n_directions=1)
create_character(description="ship navigator crew member pixel art portrait", n_directions=1)
create_character(description="ship engineer crew member pixel art portrait", n_directions=1)
→ frontend/public/assets/portraits/{name}.png
```

---

## Full Gameplay Loop

```
1. Open app
   Not connected  → ConnectWalletScreen → openWallet()
   No profile     → MintScreen → mint_starter_pack(captainName)
                    creates: Captain NFT + Corvette NFT + Gunner NFT + Port (all lv0)
   Has profile    → redirect /port

2. Port (/port → PortScene)
   View 5 buildings + levels + inventory materials
   upgrade_building() to unlock higher ship classes / better stats
   FleetAssembler: assign captain + ship + crew from owned NFTs
   Click "Set Sail" → navigate /battle

3. Battle (/battle → BattleScene + UIScene)
   startBattleSession() → session key granted (auto-signing active)
   start_battle(wave) TX → enemies spawn on grid
   Player turn: click tile → game:move or game:attack event
   React catches → signAndBroadcast(submit_move) [NO wallet popup]
   Enemy turn auto-resolved on-chain
   Wave clear: claim_reward() → loot + captain XP + crew fatigue resolved
   Navigate back /port

4. Port (repeat)
   Spend materials → upgrade buildings
   rest_crew for injured members
   Assemble stronger unit → battle next wave
```

---

## InterwovenKit Setup

```tsx
// components/WalletProvider.tsx
import { InterwovenKitProvider } from '@initia/interwovenkit-react'

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <InterwovenKitProvider
      chainId="nuansa-ship-1"
      restUrl="https://<rollup-rest-url>"
      rpcUrl="https://<rollup-rpc-url>"
    >
      {children}
    </InterwovenKitProvider>
  )
}
```

```ts
// lib/contracts.ts
export const CONTRACT_ADDRESS = '<module address after deploy>'

export function buildMintStarterPackTx(captainName: string) {
  return { /* MsgExecute: mint_starter::mint_starter_pack */ }
}
export function buildSubmitMoveTx(moveType: number, x: number, y: number) {
  return { /* MsgExecute: battle::submit_move */ }
}
export function buildUpgradeBuildingTx(buildingType: number) {
  return { /* MsgExecute: port::upgrade_building */ }
}
export function buildClaimRewardTx() {
  return { /* MsgExecute: battle::claim_reward */ }
}
```

---

## Submission Files

### .initia/submission.json

```json
{
  "project_name": "Nuansa Ship",
  "repo_url": "https://github.com/<org>/nuansa-ship",
  "commit_sha": "",
  "rollup_chain_id": "nuansa-ship-1",
  "deployed_address": "",
  "vm": "move",
  "native_feature": "auto-signing",
  "core_logic_path": "contracts/sources/battle.move",
  "native_feature_frontend_path": "frontend/src/hooks/useAutoSign.ts",
  "demo_video_url": ""
}
```

### Submission checklist

- [ ] Own Initia appchain deployed — rollup chain ID in submission.json
- [ ] InterwovenKit integrated — wallet connect + TX working
- [ ] Auto-signing session key active during battle — visible in demo video
- [ ] `.initia/submission.json` fully filled
- [ ] `README.md` with Initia Hackathon submission section
- [ ] Demo video 1–3 min, public YouTube or Loom
- [ ] Public GitHub repo

---

## Priority Build Order

```
0.  Install skills      → npx skills add initia-labs/agent-skills
1.  weave init           → using initia-appchain-dev skill, setup Move VM env, get rollup chain ID (use "nuansa-ship-1"), fund gas station
2.  Pixellab MCP         → generate ALL assets first → frontend/public/assets/
3.  captain.move         → CaptainStats + simple_nft mint + add_xp entry fn
4.  ship.move            → ShipStats + simple_nft mint + equip_captain + equip_crew
5.  crew.move            → CrewStats + simple_nft mint + resolve_fatigue + rest_crew
6.  port.move            → Port + Inventory + upgrade_building + rest_crew
7.  loot.move            → roll_loot per wave config
8.  battle.move          → Battle + start_battle + submit_move + resolve_enemy + claim_reward
9.  mint_starter.move    → initialize_collections + mint_starter_pack + has_profile
10. Deploy contracts     → Initia testnet, save module address → lib/contracts.ts
11. Frontend scaffold    → Next.js + Tailwind + WalletProvider
12. Landing + MintScreen → wallet connect → has_profile check → mint flow
13. PreloadScene         → load all assets from step 2
14. PortScene            → harbor tilemap, 5 clickable buildings, UpgradePanel modal
15. BattleScene          → ocean grid 10×8, ship sprites, tile click → game:* events
16. UIScene              → HP bar, turn label, wave, crew status, action buttons
17. Event bridge         → game:* events → signAndBroadcast in GameCanvas.tsx
18. useAutoSign          → startBattleSession on "Enter Battle"
19. End-to-end test      → connect → mint → upgrade → battle wave 1 → loot → port
20. Submission           → fill submission.json, write README, record demo video
```

---

## Key Constraints

- **Deadline: April 15, 2026 — 11 PM UTC.** Hard stop.
- **PvE only.** No PvP logic. UI stub: "Commander Duel — Coming Soon".
- **Auto-signing must work** and be clearly visible in demo video.
- **Aptos Move only.** Never generate Solidity or Sui Move.
- **NFT API:** Use `simple_nft::create_collection` and `simple_nft::mint` — NOT `initia_std::nft`. This is the verified Initia API.
- **Error codes:** Define all `const E_*` at top of EVERY module before using in asserts.
- **Canvas:** CANVAS_WIDTH=640, CANVAS_HEIGHT=512 (10×8 tiles × 64px). Never use 960×640.
- **pixelArt: true** in Phaser config. Never disable.
- **public/ location:** `frontend/public/assets/`. Phaser loads as `/assets/...` URL path.
- **Mint gate:** Check `has_profile()` on every page. No profile = blocked from /port and /battle.
- **Crew max 3:** `assert!(vector::length(&ship.crew_token_ids) <= 3, E_CREW_FULL)`.
- **Port init inside mint_starter_pack:** Never call separately.
- **Simple beats complete.** One polished wave beats five broken ones.

---

## Nuansa Universe

| Game | Chain | Status |
|---|---|---|
| Nuansa Land | Base | Active — Base Batches 003 |
| **Nuansa Ship** | **Initia** | **This project** |
| Nuansa FC | 0G | Brainstorm phase |