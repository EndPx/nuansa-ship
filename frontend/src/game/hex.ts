// game/hex.ts
// Flat-top hexagon grid helpers. Offset coords (col, row) for layout,
// converted to axial/cube for neighbor + distance math.

export interface HexCoord {
  col: number
  row: number
}

export const HEX_SIZE = 38 // distance from center to vertex
export const HEX_WIDTH = HEX_SIZE * 2 // 76
export const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE // ~65.8
export const HEX_H_SPACING = HEX_SIZE * 1.5 // 57
export const HEX_V_SPACING = HEX_HEIGHT // ~65.8

/** Grid dimensions sized to fit a ~640x512 canvas. */
export const HEX_COLS = 10
export const HEX_ROWS = 7

/** Convert flat-top offset (col, row) to pixel center. Odd-q "shoved down" variant. */
export function offsetToPixel(col: number, row: number, originX = HEX_SIZE + 4, originY = HEX_HEIGHT / 2 + 6) {
  const x = originX + col * HEX_H_SPACING
  const y = originY + row * HEX_V_SPACING + (col & 1 ? HEX_V_SPACING / 2 : 0)
  return { x, y }
}

/** Inverse of offsetToPixel — returns nearest hex from a pixel click. */
export function pixelToOffset(
  px: number,
  py: number,
  originX = HEX_SIZE + 4,
  originY = HEX_HEIGHT / 2 + 6,
): HexCoord | null {
  // Brute-force over all grid hexes — tiny N, cheap, correct around edges.
  let best: HexCoord | null = null
  let bestD = Infinity
  for (let c = 0; c < HEX_COLS; c++) {
    for (let r = 0; r < HEX_ROWS; r++) {
      const { x, y } = offsetToPixel(c, r, originX, originY)
      const d = (px - x) ** 2 + (py - y) ** 2
      if (d < bestD) {
        bestD = d
        best = { col: c, row: r }
      }
    }
  }
  if (best && bestD <= HEX_SIZE * HEX_SIZE * 1.1) return best
  return null
}

/** Convert offset (col, row) to cube (x, y, z) for neighbor + distance math. */
function offsetToCube(col: number, row: number) {
  const x = col
  const z = row - (col - (col & 1)) / 2
  const y = -x - z
  return { x, y, z }
}

/** Axial / cube hex distance. */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = offsetToCube(a.col, a.row)
  const bc = offsetToCube(b.col, b.row)
  return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z))
}

/** Six neighboring offset coords around a flat-top hex (odd-q variant). */
export function hexNeighbors(c: HexCoord): HexCoord[] {
  const odd = c.col & 1
  const deltas = odd
    ? [
        [+1, 0], [+1, +1], [0, +1],
        [-1, +1], [-1, 0], [0, -1],
      ]
    : [
        [+1, -1], [+1, 0], [0, +1],
        [-1, 0], [-1, -1], [0, -1],
      ]
  const out: HexCoord[] = []
  for (const [dc, dr] of deltas) {
    const nc = c.col + dc
    const nr = c.row + dr
    if (nc >= 0 && nc < HEX_COLS && nr >= 0 && nr < HEX_ROWS) {
      out.push({ col: nc, row: nr })
    }
  }
  return out
}

/** All hexes within `range` steps of center (exclusive of center). */
export function hexesInRange(center: HexCoord, range: number): HexCoord[] {
  const out: HexCoord[] = []
  for (let c = 0; c < HEX_COLS; c++) {
    for (let r = 0; r < HEX_ROWS; r++) {
      if (c === center.col && r === center.row) continue
      if (hexDistance(center, { col: c, row: r }) <= range) {
        out.push({ col: c, row: r })
      }
    }
  }
  return out
}

/** Six vertex pixel coords of a flat-top hex centered at (cx, cy). */
export function hexVertices(cx: number, cy: number, size = HEX_SIZE): Array<[number, number]> {
  const pts: Array<[number, number]> = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)])
  }
  return pts
}

export function hexCoordEq(a: HexCoord | null, b: HexCoord | null): boolean {
  if (!a || !b) return false
  return a.col === b.col && a.row === b.row
}

/** Default spawn positions for the hex variant of BattleScene. */
export const HEX_PLAYER_SPAWN: HexCoord = { col: 1, row: 3 }
export const HEX_ENEMY_SPAWNS_EARLY: HexCoord[] = [{ col: 8, row: 3 }]
export const HEX_ENEMY_SPAWNS_MID: HexCoord[] = [
  { col: 7, row: 2 },
  { col: 8, row: 4 },
]
export const HEX_BOSS_SPAWN: HexCoord = { col: 8, row: 3 }
