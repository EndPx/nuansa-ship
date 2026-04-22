import * as Phaser from 'phaser'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '@/game/config'
import {
  HexCoord,
  HEX_SIZE,
  HEX_COLS,
  HEX_ROWS,
  offsetToPixel,
  pixelToOffset,
  hexDistance,
  hexNeighbors,
  hexesInRange,
  hexVertices,
  hexCoordEq,
  HEX_PLAYER_SPAWN,
  HEX_ENEMY_SPAWNS_EARLY,
  HEX_ENEMY_SPAWNS_MID,
  HEX_BOSS_SPAWN,
} from '@/game/hex'

interface EnemyUnit {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle
  shadow?: Phaser.GameObjects.Ellipse
  col: number
  row: number
  hp: number
  maxHp: number
  alive: boolean
  hpBar?: Phaser.GameObjects.Graphics
}

type ActionMode = 'move' | 'attack' | 'skill' | null

// Shadow consts so legacy square-grid code paths still compile while we
// migrate the scene to hex. Pixel helpers below thread through
// offsetToPixel() for anything geometry-sensitive.
const TILE_SIZE = HEX_SIZE * 2
const GRID_COLS = HEX_COLS
const GRID_ROWS = HEX_ROWS
const PLAYER_SPAWN = HEX_PLAYER_SPAWN
const ENEMY_SPAWNS_EARLY = HEX_ENEMY_SPAWNS_EARLY
const ENEMY_SPAWNS_MID = HEX_ENEMY_SPAWNS_MID
const BOSS_SPAWN = HEX_BOSS_SPAWN

/** Mulberry32 — cheap deterministic PRNG for procedural tile choice. */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class BattleScene extends Phaser.Scene {
  private gridOverlay!: Phaser.GameObjects.Graphics
  private playerSprite!: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle
  private playerShadow!: Phaser.GameObjects.Ellipse
  private playerIdleTween?: Phaser.Tweens.Tween
  private playerCol: number = PLAYER_SPAWN.col
  private playerRow: number = PLAYER_SPAWN.row
  private playerHp: number = 500
  private playerMaxHp: number = 500
  private enemies: EnemyUnit[] = []
  private wave: number = 1
  private isPlayerTurn: boolean = true
  private actionMode: ActionMode = null
  private highlightedTiles: Phaser.GameObjects.GameObject[] = []
  private moveRange: number = 4 // engine stat
  private attackRange: number = 2 // weapon range
  // Skill cooldowns (in turns). 0 = ready, >0 = unusable this many
  // player turns. Decremented in endPlayerTurn.
  private skillCd: number = 0
  private skillCdBase: number = 2

  constructor() {
    super({ key: 'BattleScene' })
  }

  create() {
    this.playerCol = PLAYER_SPAWN.col
    this.playerRow = PLAYER_SPAWN.row
    this.playerHp = 500
    this.playerMaxHp = 500
    this.wave = 1
    this.isPlayerTurn = true
    this.actionMode = null
    this.enemies = []
    this.highlightedTiles = []
    this.skillCd = 0

    // Draw ocean background
    this.drawOceanBackground()

    // Draw grid overlay
    this.gridOverlay = this.add.graphics()
    this.drawGrid()

    // Slow parallax shine drifting across the water
    this.spawnParallaxShine()

    // Spawn player ship
    this.spawnPlayer()

    // Spawn enemies for wave
    this.spawnEnemies()

    // Handle hex click — pixelToOffset picks the nearest hex by centroid
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPlayerTurn) return
      const hex = pixelToOffset(pointer.x, pointer.y)
      if (!hex) return
      this.handleTileClick(hex.col, hex.row)
    })

    // Listen for action mode changes from UIScene
    this.game.events.on('battle:setAction', (mode: ActionMode) => {
      this.setActionMode(mode)
    })

    this.game.events.on('battle:endTurn', () => {
      this.endPlayerTurn()
    })

    // Bridge: React → Scene via window events
    const onAction = (e: Event) => {
      if (!this.isPlayerTurn) return
      const mode = (e as CustomEvent).detail?.mode as ActionMode
      this.setActionMode(mode)
    }
    const onEndTurn = () => {
      if (!this.isPlayerTurn) return
      this.endPlayerTurn()
    }
    window.addEventListener('ui:setAction', onAction)
    window.addEventListener('ui:endTurn', onEndTurn)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('ui:setAction', onAction)
      window.removeEventListener('ui:endTurn', onEndTurn)
    })

    // Emit initial state to UIScene
    this.emitStateUpdate()
    this.emitBattleLog('system', `Wave ${this.wave} begins! ${this.enemies.length} enemy ship(s) detected.`)
  }

  private drawOceanBackground() {
    const bg = this.add.graphics()

    // Deep abyss base
    bg.fillStyle(0x07111f, 1)
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Checkerboard ocean
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const shade = (col + row) % 2 === 0 ? 0x0d1e38 : 0x0a1628
        bg.fillStyle(shade, 1)
        bg.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }

    // Subtle radial glow at player side
    const glow = this.add.graphics()
    glow.fillStyle(0x2a9d8f, 0.08)
    glow.fillCircle(TILE_SIZE * 1.5, CANVAS_HEIGHT / 2, 140)
    // Enemy side glow
    const redGlow = this.add.graphics()
    redGlow.fillStyle(0xe63946, 0.06)
    redGlow.fillCircle(TILE_SIZE * 8.5, CANVAS_HEIGHT / 2, 140)

    // Pure-graphics ocean: radial gradient dabs + animated wave lines.
    // Avoid tileset fill for now — the generated atlas contains cliff/edge
    // frames that turn into a jagged maze when used as open water.
    const rand = seededRandom(0xbea7ed + this.wave)

    // Soft gradient dabs to break the flat fill
    for (let i = 0; i < 18; i++) {
      const dab = this.add.graphics()
      dab.fillStyle(0x1c4566, 0.22)
      dab.fillCircle(
        rand() * CANVAS_WIDTH,
        rand() * CANVAS_HEIGHT,
        40 + rand() * 60,
      )
    }

    // Moving foam streaks (parallax wave illusion)
    for (let i = 0; i < 10; i++) {
      const streak = this.add.graphics()
      const y = rand() * CANVAS_HEIGHT
      const w = 60 + rand() * 160
      streak.fillStyle(0x52e0c4, 0.06 + rand() * 0.06)
      streak.fillRect(rand() * CANVAS_WIDTH, y, w, 2)
      this.tweens.add({
        targets: streak,
        x: `+=${CANVAS_WIDTH / 2}`,
        duration: 8000 + rand() * 6000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.inOut',
      })
    }

    // Scattered reef accents — rare, not fill. Only ~6 per map.
    for (let i = 0; i < 6; i++) {
      const col = Math.floor(rand() * GRID_COLS)
      const row = Math.floor(rand() * GRID_ROWS)
      // keep player/enemy lanes clear
      if (row === PLAYER_SPAWN.row || (col >= 7 && row >= 3 && row <= 5)) continue
      const reef = this.add.graphics()
      reef.fillStyle(0x0a1628, 0.55)
      reef.fillCircle(
        col * TILE_SIZE + TILE_SIZE / 2 + (rand() - 0.5) * 16,
        row * TILE_SIZE + TILE_SIZE / 2 + (rand() - 0.5) * 16,
        8 + rand() * 10,
      )
      // foam halo
      const foam = this.add.graphics()
      foam.lineStyle(1, 0x52e0c4, 0.35)
      foam.strokeCircle(
        col * TILE_SIZE + TILE_SIZE / 2,
        row * TILE_SIZE + TILE_SIZE / 2,
        14 + rand() * 6,
      )
    }

    // Animated water shimmer lines
    for (let i = 0; i < 6; i++) {
      const shimmer = this.add.graphics()
      const y = Phaser.Math.Between(20, CANVAS_HEIGHT - 20)
      shimmer.lineStyle(1, 0x52e0c4, 0.25)
      shimmer.lineBetween(0, y, CANVAS_WIDTH, y)
      shimmer.setAlpha(0)
      this.tweens.add({
        targets: shimmer,
        alpha: { from: 0, to: 0.6 },
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 2000),
        yoyo: true,
        repeat: -1,
      })
    }

    // Corner brackets (tactical frame)
    const brackets = this.add.graphics()
    brackets.lineStyle(2, 0xc8a255, 0.7)
    const bSize = 14
    // TL
    brackets.lineBetween(0, 0, bSize, 0)
    brackets.lineBetween(0, 0, 0, bSize)
    // TR
    brackets.lineBetween(CANVAS_WIDTH, 0, CANVAS_WIDTH - bSize, 0)
    brackets.lineBetween(CANVAS_WIDTH, 0, CANVAS_WIDTH, bSize)
    // BL
    brackets.lineBetween(0, CANVAS_HEIGHT, bSize, CANVAS_HEIGHT)
    brackets.lineBetween(0, CANVAS_HEIGHT, 0, CANVAS_HEIGHT - bSize)
    // BR
    brackets.lineBetween(CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH - bSize, CANVAS_HEIGHT)
    brackets.lineBetween(CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - bSize)
  }

  private drawGrid() {
    this.gridOverlay.clear()

    // 1) Place a hex-water sprite (or graphics fallback) on every hex.
    // 2) Scatter a few hex-reef sprites at deterministic positions for
    //    visual interest, skipping player + enemy spawn hexes.
    const rand = seededRandom(0xf1ee7 + this.wave)
    const reefCount = 4
    const reefHexes = new Set<string>()
    const isSpawn = (c: number, r: number) =>
      (c === PLAYER_SPAWN.col && r === PLAYER_SPAWN.row) ||
      [...ENEMY_SPAWNS_EARLY, ...ENEMY_SPAWNS_MID, BOSS_SPAWN].some(
        (s) => s.col === c && s.row === r,
      )
    while (reefHexes.size < reefCount) {
      const c = Math.floor(rand() * HEX_COLS)
      const r = Math.floor(rand() * HEX_ROWS)
      if (isSpawn(c, r)) continue
      reefHexes.add(`${c},${r}`)
    }

    const hasHexWater = this.textures.exists('hex-water')
    const hasHexReef = this.textures.exists('hex-reef')
    const tileDisplay = HEX_SIZE * 2.1 // slightly overlap neighbours to kill seams

    for (let col = 0; col < HEX_COLS; col++) {
      for (let row = 0; row < HEX_ROWS; row++) {
        const { x, y } = offsetToPixel(col, row)
        const isReef = reefHexes.has(`${col},${row}`) && hasHexReef
        const key = isReef ? 'hex-reef' : 'hex-water'
        if (isReef || hasHexWater) {
          const tile = this.add.image(x, y, key)
          tile.setDisplaySize(tileDisplay, tileDisplay)
          tile.setDepth(-2)
          tile.setAlpha(isReef ? 0.95 : 0.9)
        } else {
          // Graphics fallback when sprites failed to load
          const verts = hexVertices(x, y, HEX_SIZE - 2)
          const fill = this.add.graphics()
          fill.fillStyle((col + row) & 1 ? 0x0e2239 : 0x0a1a2e, 0.55)
          fill.beginPath()
          fill.moveTo(verts[0][0], verts[0][1])
          for (let i = 1; i < verts.length; i++) fill.lineTo(verts[i][0], verts[i][1])
          fill.closePath()
          fill.fillPath()
          fill.setDepth(-2)
        }
      }
    }

    // Hex outline overlay for readability
    this.gridOverlay.lineStyle(1, 0x2a9d8f, 0.35)
    for (let col = 0; col < HEX_COLS; col++) {
      for (let row = 0; row < HEX_ROWS; row++) {
        const { x, y } = offsetToPixel(col, row)
        const verts = hexVertices(x, y, HEX_SIZE - 1)
        this.gridOverlay.beginPath()
        this.gridOverlay.moveTo(verts[0][0], verts[0][1])
        for (let i = 1; i < verts.length; i++) {
          this.gridOverlay.lineTo(verts[i][0], verts[i][1])
        }
        this.gridOverlay.closePath()
        this.gridOverlay.strokePath()
      }
    }
    this.gridOverlay.setDepth(0)
  }

  private spawnPlayer() {
    const { x, y } = offsetToPixel(this.playerCol, this.playerRow)
    const sz = HEX_SIZE * 1.4

    // Shadow first, so the sprite sits on top of it
    // Shadow sits directly beneath the ship (no horizontal offset) so
    // it reads as the hull's cast shadow during the idle bob.
    this.playerShadow = this.add.ellipse(x, y + 4, sz * 0.75, sz * 0.28, 0x000000, 0.4)
    this.playerShadow.setDepth(3)

    if (this.textures.exists('ship-player-top')) {
      this.playerSprite = this.add.image(x, y, 'ship-player-top')
      this.playerSprite.setDisplaySize(sz, sz)
    } else if (this.textures.exists('ship-player')) {
      const frames = this.textures.get('ship-player').getFrameNames()
      const frameKey = frames.length > 0 ? frames[0] : undefined
      this.playerSprite = this.add.sprite(x, y, 'ship-player', frameKey)
      this.playerSprite.setDisplaySize(sz, sz)
    } else {
      this.playerSprite = this.add.rectangle(x, y, sz, sz, 0x2a9d8f)
      ;(this.playerSprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x66c3b7)
    }
    this.playerSprite.setDepth(5)

    // Gentle idle bob — ship rises ~2px and settles, shadow stays put
    this.playerIdleTween = this.tweens.add({
      targets: this.playerSprite,
      y: y - 2,
      duration: 1400,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    // (Rotation sway removed — decouples from shadow and caused the
    // boss ship to cycle. Vertical bob + foam wake is enough life.)
  }

  private spawnEnemies() {
    this.enemies.forEach((e) => {
      e.sprite.destroy()
      e.hpBar?.destroy()
    })
    this.enemies = []

    let spawns: { col: number; row: number }[]
    let hp: number
    let isBoss = false

    if (this.wave <= 3) {
      spawns = ENEMY_SPAWNS_EARLY
      hp = 300
    } else if (this.wave <= 6) {
      spawns = ENEMY_SPAWNS_MID
      hp = 500
    } else {
      spawns = [BOSS_SPAWN]
      hp = 2000
      isBoss = true
    }

    spawns.forEach((spawn) => {
      const { x, y } = offsetToPixel(spawn.col, spawn.row)
      const sz = isBoss ? HEX_SIZE * 1.7 : HEX_SIZE * 1.4

      // Drop shadow
      const shadow = this.add.ellipse(x, y + 4, sz * 0.75, sz * 0.28, 0x000000, isBoss ? 0.5 : 0.4)
      shadow.setDepth(3)

      let sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle
      const topKey = isBoss ? 'ship-boss-top' : 'ship-enemy-top'
      const atlasKey = isBoss ? 'ship-boss' : 'ship-enemy'

      if (this.textures.exists(topKey)) {
        sprite = this.add.image(x, y, topKey)
        sprite.setDisplaySize(sz, sz)
      } else if (this.textures.exists(atlasKey)) {
        const frames = this.textures.get(atlasKey).getFrameNames()
        const frameKey = frames.length > 0 ? frames[0] : undefined
        sprite = this.add.sprite(x, y, atlasKey, frameKey)
        sprite.setDisplaySize(sz, sz)
      } else {
        sprite = this.add.rectangle(x, y, sz, sz, isBoss ? 0x8b0000 : 0xcc3333)
        ;(sprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xff6666)
      }
      sprite.setDepth(5)

      // Subtle idle bob — offset from player so they don't sync
      this.tweens.add({
        targets: sprite,
        y: y - (isBoss ? 3 : 2),
        duration: 1600 + spawn.col * 120,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
      })
      // (No rotation sway — the sprite art already bakes bow direction;
      // the tween previously caused the boss to spin because Phaser read
      // a starting rotation of 0 instead of the PI we set.)

      const hpBar = this.add.graphics()
      hpBar.setDepth(6)
      this.drawEnemyHpBar(hpBar, x, y - HEX_SIZE + 4, hp, hp)

      this.enemies.push({
        sprite,
        shadow,
        col: spawn.col,
        row: spawn.row,
        hp,
        maxHp: hp,
        alive: true,
        hpBar,
      })
    })
  }

  private drawEnemyHpBar(g: Phaser.GameObjects.Graphics, x: number, y: number, hp: number, maxHp: number) {
    g.clear()
    const barWidth = 40
    const barHeight = 4
    const ratio = hp / maxHp

    // Background
    g.fillStyle(0x333333, 0.8)
    g.fillRect(x - barWidth / 2, y, barWidth, barHeight)

    // HP fill
    const color = ratio > 0.5 ? 0x44cc44 : ratio > 0.25 ? 0xcccc44 : 0xcc4444
    g.fillStyle(color, 1)
    g.fillRect(x - barWidth / 2, y, barWidth * ratio, barHeight)
  }

  private setActionMode(mode: ActionMode) {
    this.actionMode = mode
    this.clearHighlights()
    if (mode === 'move') this.showMoveRange()
    else if (mode === 'attack') this.showAttackRange()
    else if (mode === 'skill') this.showAttackRange()
  }

  private handleTileClick(col: number, row: number) {
    if (this.actionMode === 'move') {
      this.tryMove(col, row)
    } else if (this.actionMode === 'attack') {
      this.tryAttack(col, row)
    } else if (this.actionMode === 'skill') {
      this.trySkill(col, row)
    }
  }

  private tryMove(col: number, row: number) {
    const dist = hexDistance({ col, row }, { col: this.playerCol, row: this.playerRow })
    if (dist > this.moveRange || dist === 0) return

    // Check not occupied by enemy
    const blocked = this.enemies.some((e) => e.alive && e.col === col && e.row === row)
    if (blocked) return

    // Move player to hex center
    const fromX = (this.playerSprite as any).x as number
    const fromY = (this.playerSprite as any).y as number
    this.playerCol = col
    this.playerRow = row
    const { x, y } = offsetToPixel(col, row)

    // Stop idle bob so the move tween runs cleanly; restart after arrival
    this.playerIdleTween?.stop()

    this.tweens.add({
      targets: this.playerSprite,
      x,
      y,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Resume idle bob at the new base y
        this.playerIdleTween = this.tweens.add({
          targets: this.playerSprite,
          y: y - 2,
          duration: 1400,
          ease: 'Sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      },
    })
    // Shadow follows with the ship but stays offset
    this.tweens.add({
      targets: this.playerShadow,
      x,
      y: y + 4,
      duration: 300,
      ease: 'Power2',
    })
    // Foam wake particles along the path
    this.spawnFoamWake(fromX, fromY, x, y)

    this.clearHighlights()
    this.actionMode = null

    // Emit event to React
    window.dispatchEvent(new CustomEvent('game:move', { detail: { x: col, y: row } }))
    this.emitBattleLog('move', `Ship moved to (${col}, ${row})`)
    this.emitStateUpdate()
  }

  private tryAttack(col: number, row: number) {
    const targetEnemy = this.enemies.find(
      (e) => e.alive && e.col === col && e.row === row
    )
    if (!targetEnemy) return

    const dist = hexDistance({ col, row }, { col: this.playerCol, row: this.playerRow })
    if (dist > this.attackRange) return

    // Combat FX — muzzle flash at midpoint toward the target + recoil
    const playerPos = offsetToPixel(this.playerCol, this.playerRow)
    const targetPos = offsetToPixel(col, row)
    const midX = playerPos.x + (targetPos.x - playerPos.x) * 0.35
    const midY = playerPos.y + (targetPos.y - playerPos.y) * 0.35
    this.spawnMuzzleFlash(midX, midY)
    this.recoil(this.playerSprite, playerPos.x, playerPos.y, targetPos.x, targetPos.y)

    // Deal damage
    const damage = 60 // base weapon damage
    targetEnemy.hp = Math.max(0, targetEnemy.hp - damage)

    // Flash effect
    this.tweens.add({
      targets: targetEnemy.sprite,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 2,
    })

    // Update HP bar
    const { x: ex, y: ey } = offsetToPixel(targetEnemy.col, targetEnemy.row)
    this.drawEnemyHpBar(targetEnemy.hpBar!, ex, ey - HEX_SIZE + 4, targetEnemy.hp, targetEnemy.maxHp)

    this.emitBattleLog('attack', `Cannons fired at (${col}, ${row})! ${damage} damage dealt.`)

    // Check if enemy destroyed
    if (targetEnemy.hp <= 0) {
      targetEnemy.alive = false
      targetEnemy.hpBar?.destroy()

      // Explosion effect
      if (this.textures.exists('explosion')) {
        const explosion = this.add.sprite(ex, ey, 'explosion')
        explosion.setDisplaySize(HEX_SIZE * 1.8, HEX_SIZE * 1.8)
        this.time.delayedCall(500, () => explosion.destroy())
      }

      if (targetEnemy.shadow) {
        this.tweens.add({
          targets: targetEnemy.shadow,
          alpha: 0,
          scaleX: 1.6,
          scaleY: 1.6,
          duration: 500,
          onComplete: () => targetEnemy.shadow?.destroy(),
        })
      }
      this.tweens.add({
        targets: targetEnemy.sprite,
        alpha: 0,
        duration: 400,
        onComplete: () => targetEnemy.sprite.destroy(),
      })

      this.emitBattleLog('system', 'Enemy ship destroyed!')
      this.checkWaveComplete()
    }

    this.clearHighlights()
    this.actionMode = null

    // Emit event to React
    window.dispatchEvent(new CustomEvent('game:attack', { detail: { x: col, y: row } }))
    this.emitStateUpdate()
  }

  private trySkill(col: number, row: number) {
    // Cooldown gate — can't fire skill while it's still recharging
    if (this.skillCd > 0) {
      this.emitBattleLog('system', `Broadside recharging. Ready in ${this.skillCd} turn(s).`)
      return
    }

    // Crew skill: Gunner multi-shot targets 2 enemies, but for now just higher damage single target
    const targetEnemy = this.enemies.find(
      (e) => e.alive && e.col === col && e.row === row
    )
    if (!targetEnemy) return

    const dist = hexDistance({ col, row }, { col: this.playerCol, row: this.playerRow })
    if (dist > this.attackRange) return

    // Combat FX — bigger muzzle flash for skills + recoil, plus a second
    // flash closer to the target for "BROADSIDE" feel
    const playerPos = offsetToPixel(this.playerCol, this.playerRow)
    const targetPos = offsetToPixel(col, row)
    this.spawnMuzzleFlash(
      playerPos.x + (targetPos.x - playerPos.x) * 0.3,
      playerPos.y + (targetPos.y - playerPos.y) * 0.3,
    )
    this.time.delayedCall(80, () => {
      this.spawnMuzzleFlash(
        playerPos.x + (targetPos.x - playerPos.x) * 0.6,
        playerPos.y + (targetPos.y - playerPos.y) * 0.6,
      )
    })
    this.recoil(this.playerSprite, playerPos.x, playerPos.y, targetPos.x, targetPos.y)

    const damage = 90 // skill damage (higher than normal)
    targetEnemy.hp = Math.max(0, targetEnemy.hp - damage)

    this.tweens.add({
      targets: targetEnemy.sprite,
      alpha: 0.2,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      repeat: 1,
    })

    const { x: ex, y: ey } = offsetToPixel(targetEnemy.col, targetEnemy.row)
    this.drawEnemyHpBar(targetEnemy.hpBar!, ex, ey - HEX_SIZE + 4, targetEnemy.hp, targetEnemy.maxHp)

    this.emitBattleLog('skill', `Crew skill activated! ${damage} damage dealt.`)

    if (targetEnemy.hp <= 0) {
      targetEnemy.alive = false
      targetEnemy.hpBar?.destroy()
      if (targetEnemy.shadow) {
        this.tweens.add({
          targets: targetEnemy.shadow,
          alpha: 0,
          scaleX: 1.6,
          scaleY: 1.6,
          duration: 500,
          onComplete: () => targetEnemy.shadow?.destroy(),
        })
      }
      this.tweens.add({
        targets: targetEnemy.sprite,
        alpha: 0,
        duration: 400,
        onComplete: () => targetEnemy.sprite.destroy(),
      })
      this.emitBattleLog('system', 'Enemy ship destroyed!')
      this.checkWaveComplete()
    }

    // Trigger cooldown + broadcast it to React
    this.skillCd = this.skillCdBase
    window.dispatchEvent(new CustomEvent('battle:skillCd', { detail: { cd: this.skillCd } }))

    this.clearHighlights()
    this.actionMode = null
    window.dispatchEvent(new CustomEvent('game:skill', { detail: { slot: 0 } }))
    this.emitStateUpdate()
  }

  private showMoveRange() {
    this.clearHighlights()
    const reach = hexesInRange({ col: this.playerCol, row: this.playerRow }, this.moveRange)
    for (const hex of reach) {
      const blocked = this.enemies.some((e) => e.alive && e.col === hex.col && e.row === hex.row)
      if (!blocked) this.drawHexHighlight(hex.col, hex.row, 0x2a9d8f, 0.18, 0.5)
    }
  }

  private showAttackRange() {
    this.clearHighlights()
    const reach = hexesInRange({ col: this.playerCol, row: this.playerRow }, this.attackRange)
    for (const hex of reach) {
      const hasEnemy = this.enemies.some((e) => e.alive && e.col === hex.col && e.row === hex.row)
      this.drawHexHighlight(hex.col, hex.row, 0xcc3333, hasEnemy ? 0.32 : 0.1, 0.6)
    }
  }

  private clearHighlights() {
    this.highlightedTiles.forEach((h) => (h as Phaser.GameObjects.GameObject).destroy())
    this.highlightedTiles = []
  }

  /** Spawn a brief muzzle flash at (x, y) with quick scale + fade. */
  private spawnMuzzleFlash(x: number, y: number) {
    if (!this.textures.exists('muzzle-flash')) {
      // Fallback: bright yellow circle
      const g = this.add.circle(x, y, 14, 0xffdd66, 0.95)
      g.setDepth(6)
      this.tweens.add({
        targets: g,
        scale: 2.4,
        alpha: 0,
        duration: 220,
        onComplete: () => g.destroy(),
      })
      return
    }
    const flash = this.add.image(x, y, 'muzzle-flash')
    flash.setDisplaySize(HEX_SIZE * 1.2, HEX_SIZE * 1.2)
    flash.setDepth(6)
    flash.setBlendMode(Phaser.BlendModes.ADD)
    flash.setAlpha(1)
    flash.setScale((flash.scaleX || 1) * 0.6)
    this.tweens.add({
      targets: flash,
      scaleX: (flash.scaleX || 1) * 1.8,
      scaleY: (flash.scaleY || 1) * 1.8,
      alpha: 0,
      duration: 260,
      onComplete: () => flash.destroy(),
    })
  }

  /** Brief shove of the attacker away from the target (recoil). */
  private recoil(
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    fromX: number,
    fromY: number,
    towardX: number,
    towardY: number,
  ) {
    const dx = fromX - towardX
    const dy = fromY - towardY
    const len = Math.hypot(dx, dy) || 1
    const recoilPx = 6
    const rx = (dx / len) * recoilPx
    const ry = (dy / len) * recoilPx
    this.tweens.add({
      targets: sprite,
      x: fromX + rx,
      y: fromY + ry,
      duration: 90,
      ease: 'Quad.out',
      yoyo: true,
    })
  }

  /** Emit a trail of fading teal foam dots between two pixel coords. */
  private spawnFoamWake(fromX: number, fromY: number, toX: number, toY: number) {
    const steps = 8
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const px = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 6
      const py = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 6
      const dot = this.add.circle(px, py, 3 + Math.random() * 2, 0x52e0c4, 0.7)
      dot.setDepth(4)
      this.tweens.add({
        targets: dot,
        alpha: 0,
        scale: 2.2,
        duration: 700 + i * 60,
        ease: 'Cubic.out',
        onComplete: () => dot.destroy(),
      })
    }
  }

  /** Slow-drifting radial highlight that fakes sun reflection on water. */
  private spawnParallaxShine() {
    const shine = this.add.graphics()
    shine.fillStyle(0x52e0c4, 0.05)
    shine.fillCircle(0, 0, 220)
    shine.setBlendMode(Phaser.BlendModes.ADD)
    shine.setDepth(1)
    shine.setPosition(-200, CANVAS_HEIGHT / 2)
    this.tweens.add({
      targets: shine,
      x: CANVAS_WIDTH + 200,
      duration: 14000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }

  /** Draw a filled hex polygon outline at the given offset coords. */
  private drawHexHighlight(col: number, row: number, color: number, fillAlpha: number, lineAlpha = 0.6) {
    const { x, y } = offsetToPixel(col, row)
    const verts = hexVertices(x, y, HEX_SIZE - 3)
    const g = this.add.graphics()
    g.fillStyle(color, fillAlpha)
    g.lineStyle(2, color, lineAlpha)
    g.beginPath()
    g.moveTo(verts[0][0], verts[0][1])
    for (let i = 1; i < verts.length; i++) g.lineTo(verts[i][0], verts[i][1])
    g.closePath()
    g.fillPath()
    g.strokePath()
    g.setDepth(2)
    this.highlightedTiles.push(g)
  }

  private endPlayerTurn() {
    this.isPlayerTurn = false
    this.actionMode = null
    this.clearHighlights()
    // Decrement skill cooldown at the end of the player turn
    if (this.skillCd > 0) {
      this.skillCd -= 1
      window.dispatchEvent(new CustomEvent('battle:skillCd', { detail: { cd: this.skillCd } }))
    }
    this.emitStateUpdate()
    this.emitBattleLog('system', 'Enemy turn...')

    // Enemy turn after short delay
    this.time.delayedCall(800, () => {
      this.resolveEnemyTurn()
    })
  }

  private resolveEnemyTurn() {
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return

      const dist = hexDistance({ col: enemy.col, row: enemy.row }, { col: this.playerCol, row: this.playerRow })
      const enemyRange = this.wave <= 3 ? 2 : this.wave <= 6 ? 3 : 4
      const enemyDamage = this.wave <= 3 ? 40 : this.wave <= 6 ? 70 : 150

      if (dist <= enemyRange) {
        // Enemy combat FX — flash + recoil the enemy that's firing +
        // shake and flash the player
        const enemyPos = offsetToPixel(enemy.col, enemy.row)
        const playerPos = offsetToPixel(this.playerCol, this.playerRow)
        this.spawnMuzzleFlash(
          enemyPos.x + (playerPos.x - enemyPos.x) * 0.3,
          enemyPos.y + (playerPos.y - enemyPos.y) * 0.3,
        )
        this.recoil(enemy.sprite, enemyPos.x, enemyPos.y, playerPos.x, playerPos.y)
        // dispatch screen shake to the React battle page
        window.dispatchEvent(new CustomEvent('battle:shake', { detail: { intensity: 2 } }))

        // Attack player
        this.playerHp = Math.max(0, this.playerHp - enemyDamage)

        // Flash player
        this.tweens.add({
          targets: this.playerSprite,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 2,
        })

        this.emitBattleLog('enemy', `Enemy fires! ${enemyDamage} damage taken.`)

        if (this.playerHp <= 0) {
          this.emitBattleLog('system', 'Your ship has been sunk! Battle lost.')
          this.game.events.emit('battle:stateUpdate', {
            playerHp: 0,
            playerMaxHp: this.playerMaxHp,
            wave: this.wave,
            isPlayerTurn: false,
            status: 'lost',
          })
          return
        }
      } else {
        // Move toward player — pick the hex neighbor that minimizes
        // hex distance to the player, skipping hexes blocked by an ally.
        const here: HexCoord = { col: enemy.col, row: enemy.row }
        const target: HexCoord = { col: this.playerCol, row: this.playerRow }
        const candidates = hexNeighbors(here).filter(
          (n) =>
            !hexCoordEq(n, target) &&
            !this.enemies.some((e) => e.alive && e !== enemy && e.col === n.col && e.row === n.row),
        )
        if (candidates.length > 0) {
          candidates.sort((a, b) => hexDistance(a, target) - hexDistance(b, target))
          const best = candidates[0]
          // only move if this actually gets us closer to the player
          if (hexDistance(best, target) < hexDistance(here, target)) {
            const fromX = (enemy.sprite as any).x as number
            const fromY = (enemy.sprite as any).y as number
            enemy.col = best.col
            enemy.row = best.row
            const { x, y } = offsetToPixel(best.col, best.row)

            this.tweens.add({
              targets: enemy.sprite,
              x,
              y,
              duration: 300,
              ease: 'Power2',
            })
            if (enemy.shadow) {
              this.tweens.add({
                targets: enemy.shadow,
                x: x + 3,
                y: y + 6,
                duration: 300,
                ease: 'Power2',
              })
            }
            this.spawnFoamWake(fromX, fromY, x, y)

            if (enemy.hpBar) {
              this.drawEnemyHpBar(enemy.hpBar, x, y - HEX_SIZE + 4, enemy.hp, enemy.maxHp)
            }

            this.emitBattleLog('enemy', `Enemy advances to hex (${best.col}, ${best.row})`)
          }
        }
      }
    })

    // End enemy turn
    this.time.delayedCall(600, () => {
      this.isPlayerTurn = true
      this.emitStateUpdate()
      this.emitBattleLog('system', 'Your turn!')
    })
  }

  private checkWaveComplete() {
    const allDead = this.enemies.every((e) => !e.alive)
    if (!allDead) return

    this.emitBattleLog('system', `Wave ${this.wave} cleared!`)

    // Auto claim reward
    window.dispatchEvent(new CustomEvent('game:claim'))

    this.time.delayedCall(1500, () => {
      this.wave++
      if (this.wave > 7) {
        this.emitBattleLog('system', 'All waves cleared! Victory!')
        this.game.events.emit('battle:stateUpdate', {
          playerHp: this.playerHp,
          playerMaxHp: this.playerMaxHp,
          wave: this.wave - 1,
          isPlayerTurn: false,
          status: 'won',
        })
        return
      }

      this.emitBattleLog('system', `Wave ${this.wave} incoming!`)
      this.spawnEnemies()
      this.emitStateUpdate()
    })
  }

  private emitStateUpdate() {
    this.game.events.emit('battle:stateUpdate', {
      playerHp: this.playerHp,
      playerMaxHp: this.playerMaxHp,
      wave: this.wave,
      isPlayerTurn: this.isPlayerTurn,
      status: 'active',
    })

    // Bridge to React HUD via window CustomEvents
    window.dispatchEvent(
      new CustomEvent('battle:turn', {
        detail: { turn: this.isPlayerTurn ? 'player' : 'enemy' },
      })
    )
    window.dispatchEvent(
      new CustomEvent('battle:hp', {
        detail: { current: this.playerHp, max: this.playerMaxHp },
      })
    )
    window.dispatchEvent(
      new CustomEvent('battle:wave', {
        detail: { wave: this.wave },
      })
    )
  }

  private emitBattleLog(type: string, message: string) {
    window.dispatchEvent(
      new CustomEvent('battle:log', {
        detail: { type, message },
      })
    )
  }
}
