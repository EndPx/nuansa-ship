// Shared TypeScript types for Nuansa Ship

export interface CaptainStats {
  leadership: number    // 0-100
  tactics: number       // 0-100
  specialSkillId: number // 0=none 1=Broadside 2=Evasive Drift
  xp: number
  level: number         // 1-50
}

export interface ShipStats {
  shipClass: number     // 0=Corvette 1=Frigate 2=Destroyer 3=Battleship
  hull: number
  maxHull: number
  engine: number        // tiles per turn
  weaponDamage: number
  weaponRange: number   // tiles
  armor: number
  captainTokenId: string
  crewTokenIds: string[]
}

export interface CrewStats {
  role: number          // 0=Gunner 1=Navigator 2=Engineer
  skillId: number
  morale: number        // 0-100
  hp: number            // 0-100
  status: number        // 0=Ready 1=Injured 2=KO
}

export interface Port {
  owner: string
  shipyardLevel: number
  armoryLevel: number
  barracksLevel: number
  admiralsHallLevel: number
  warehouseLevel: number
}

export interface Item {
  itemType: number      // 0=IronPlanks 1=SteelParts 2=Provisions 3=CommanderTome 4=Timber
  amount: number
}

export interface Inventory {
  items: Item[]
}

export interface Enemy {
  hp: number
  damage: number
  range: number
  x: number
  y: number
  alive: boolean
}

export interface Battle {
  id: number
  player: string
  wave: number
  playerHp: number
  playerX: number
  playerY: number
  enemies: Enemy[]
  turn: number          // 0=player 1=enemy
  status: number        // 0=active 1=won 2=lost
}

export interface PlayerProfile {
  captainTokenId: string
  shipTokenId: string
  crewTokenIds: string[]
}

// Item type names for display
export const ITEM_NAMES: Record<number, string> = {
  0: 'Iron Planks',
  1: 'Steel Parts',
  2: 'Provisions',
  3: 'Commander Tome',
  4: 'Timber',
}

// Ship class names for display
export const SHIP_CLASS_NAMES: Record<number, string> = {
  0: 'Corvette',
  1: 'Frigate',
  2: 'Destroyer',
  3: 'Battleship',
}

// Crew role names for display
export const CREW_ROLE_NAMES: Record<number, string> = {
  0: 'Gunner',
  1: 'Navigator',
  2: 'Engineer',
}

// Building names for display
export const BUILDING_NAMES: Record<number, string> = {
  0: 'Shipyard',
  1: 'Armory',
  2: 'Barracks',
  3: "Admiral's Hall",
  4: 'Warehouse',
}
