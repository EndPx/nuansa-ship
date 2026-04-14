# Nuansa Ship — Pixel Art Style Guide

## Core Style Rules

| Parameter | Value | Notes |
|---|---|---|
| **View** | High top-down | All game assets use bird's-eye view |
| **Outline** | Single color black outline | Ships & portraits; buildings use single color outline |
| **Shading** | Medium shading | Consistent across all assets |
| **Detail** | Medium detail | Boss ship uses high detail |
| **Canvas** | pixelArt: true | No anti-aliasing, crisp pixels |

## Color Palette

### Primary Colors
- **Teal (#2A9D8F)** — Player ship hull, UI accents, friendly elements
- **Dark Navy (#0A1628)** — Background, deep ocean
- **Warm Wood (#8B6914)** — Dock planks, buildings, port elements
- **Stone Gray (#6B7280)** — Pier, armory, warehouse

### Faction Colors
- **Player** — Teal + White hull
- **Enemy** — Dark Red (#991B1B) + Black hull
- **Boss** — Dark Iron (#374151) + Skull flag accent

### UI Colors
- **HP Green** — #22C55E
- **HP Red** — #EF4444
- **XP Gold** — #EAB308
- **Turn Blue** — #3B82F6
- **Injured Orange** — #F97316

## Asset Sizes

| Asset | Size | Format |
|---|---|---|
| Tilesets | 16×16 per tile | PNG (tileset sheet) |
| Player Ship | 32×32 | PNG + JSON (atlas, 4 directions) |
| Enemy Ship | 32×32 | PNG + JSON (atlas, 4 directions) |
| Boss Ship | 48×48 | PNG + JSON (atlas, 4 directions) |
| Buildings | 64×64 | PNG (static, transparent bg) |
| Portraits | 32×32 | PNG (side view, 4 directions) |
| Explosion FX | 32×32 | PNG + JSON (atlas, animated) |

## Pixellab Generation Settings

### Tilesets
```
Tool: create_topdown_tileset
tile_size: 16×16
detail: medium detail
shading: medium shading
outline: selective outline
view: high top-down
```

### Ships (Characters)
```
Tool: create_character
view: high top-down
n_directions: 4
outline: single color black outline
shading: medium shading
detail: medium detail (high detail for boss)
Animations: breathing-idle, walk (movement)
```

### Buildings (Map Objects)
```
Tool: create_map_object
size: 64×64
view: high top-down
outline: single color outline
shading: medium shading
detail: medium detail
```

### Portraits (Characters)
```
Tool: create_character
view: side
n_directions: 4 (only south face used in-game)
size: 32
outline: single color black outline
shading: medium shading
detail: medium detail
```

## Phaser Integration

### Loading Convention
```ts
// Tilesets — single images
this.load.image('ocean-tiles', '/assets/tilesets/ocean.png')

// Ships — sprite atlas (spritesheet + json)
this.load.atlas('ship-player', '/assets/ships/ship_player.png', '/assets/ships/ship_player.json')

// Buildings — single images
this.load.image('building-shipyard', '/assets/buildings/shipyard.png')

// Portraits — single images
this.load.image('portrait-captain', '/assets/portraits/captain.png')
```

### Grid Alignment
- Game grid: 10 cols × 8 rows × 64px = 640×512
- Ships (32px) centered in 64px tiles: offset +16px x/y
- Boss (48px) centered in 64px tiles: offset +8px x/y
- Buildings (64px) fill entire tile

## Asset Checklist

### Tilesets
- [ ] ocean.png — deep ocean ↔ shallow teal water
- [ ] harbor.png — wooden dock ↔ stone pier

### Ships
- [ ] ship_player.png + .json — teal/white warship, 4 dir + idle anim
- [ ] ship_enemy.png + .json — dark red/black warship, 4 dir + idle anim
- [ ] ship_boss.png + .json — massive iron battleship, 4 dir + idle anim

### Buildings
- [ ] shipyard.png — dock with crane
- [ ] armory.png — cannons and weapons
- [ ] barracks.png — military beds and flag
- [ ] admirals_hall.png — grand naval building
- [ ] warehouse.png — crates and barrels

### Portraits
- [ ] captain.png — naval captain with uniform
- [ ] gunner.png — crew with bandana
- [ ] navigator.png — crew with spyglass
- [ ] engineer.png — crew with goggles/wrench

### Effects
- [ ] explosion.png + .json — explosion animation
