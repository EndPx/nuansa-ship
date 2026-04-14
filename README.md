# Nuansa Ship

Tactical naval RPG pixel art game on Initia blockchain, inspired by Front Mission 4.

## Initia Hackathon Submission

| Field | Value |
|---|---|
| **Hackathon** | INITIATE: The Initia Hackathon (Season 1) |
| **Track** | Gaming / Consumer (Move VM) |
| **Chain ID** | nuansa-ship-1 |
| **VM** | Move (Aptos-style) |
| **Native Feature** | Auto-signing (session keys) |

## Game Overview

Build your fleet, upgrade your port, and battle through PvE waves in tactical grid combat.

- **3-Part Battle Unit**: Captain + Ship + Crew (max 3) — all NFTs
- **Port Management**: 5 upgradeable buildings (Shipyard, Armory, Barracks, Admiral's Hall, Warehouse)
- **PvE Combat**: Wave-based grid battles (10x8) with deterministic enemy AI
- **Loot System**: Earn materials to upgrade buildings and unlock stronger ships

## Tech Stack

- **Smart Contracts**: Move VM (Aptos-style) on Initia
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Game Engine**: Phaser 3 (pixel art, 640x512 canvas)
- **Wallet**: InterwovenKit (@initia/interwovenkit-react)
- **Native Feature**: Auto-signing via session keys for seamless battle gameplay

## Project Structure

```
nuansa-ship/
├── contracts/          # Move smart contracts
│   ├── Move.toml
│   └── sources/
│       ├── captain.move
│       ├── ship.move
│       ├── crew.move
│       ├── port.move
│       ├── loot.move
│       ├── battle.move
│       └── mint_starter.move
├── frontend/           # Next.js + Phaser 3
│   ├── src/
│   │   ├── app/        # Next.js pages
│   │   ├── game/       # Phaser scenes
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   └── lib/        # Utilities
│   └── public/assets/  # Pixel art assets
├── scripts/            # Deployment scripts
└── .initia/            # Submission metadata
```

## Getting Started

### Prerequisites
- Node.js 18+
- WSL2 with Ubuntu (for Initia tools)
- Docker Desktop

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Deploy Contracts (WSL)
```bash
cd contracts
minitiad move build --named-addresses nuansa_ship=gas-station
minitiad tx move publish ...
```

## Part of the Nuansa Universe

| Game | Chain | Status |
|---|---|---|
| Nuansa Land | Base | Active |
| **Nuansa Ship** | **Initia** | **In Development** |
| Nuansa FC | 0G | Brainstorm |

## License

MIT
