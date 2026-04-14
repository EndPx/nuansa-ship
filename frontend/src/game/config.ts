import * as Phaser from 'phaser'

export const TILE_SIZE = 64
export const GRID_COLS = 10
export const GRID_ROWS = 8
export const CANVAS_WIDTH = 640   // TILE_SIZE * GRID_COLS
export const CANVAS_HEIGHT = 512  // TILE_SIZE * GRID_ROWS

// Spawn positions (tile coordinates)
export const PLAYER_SPAWN = { col: 1, row: 4 }
export const ENEMY_SPAWNS_EARLY = [{ col: 8, row: 4 }]
export const ENEMY_SPAWNS_MID = [
  { col: 7, row: 3 },
  { col: 9, row: 5 },
]
export const BOSS_SPAWN = { col: 8, row: 4 }

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  pixelArt: true,
  backgroundColor: '#0a1628',
  scene: [], // scenes added dynamically in GameCanvas
}
