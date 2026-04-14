import * as Phaser from 'phaser'
import {
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SPAWN,
  ENEMY_SPAWNS_EARLY,
  ENEMY_SPAWNS_MID,
  BOSS_SPAWN,
} from '@/game/config'

interface EnemyUnit {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle
  col: number
  row: number
  hp: number
  maxHp: number
  alive: boolean
  hpBar?: Phaser.GameObjects.Graphics
}

type ActionMode = 'move' | 'attack' | 'skill' | null

export class BattleScene extends Phaser.Scene {
  private gridOverlay!: Phaser.GameObjects.Graphics
  private playerSprite!: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle
  private playerCol: number = PLAYER_SPAWN.col
  private playerRow: number = PLAYER_SPAWN.row
  private playerHp: number = 500
  private playerMaxHp: number = 500
  private enemies: EnemyUnit[] = []
  private wave: number = 1
  private isPlayerTurn: boolean = true
  private actionMode: ActionMode = null
  private highlightedTiles: Phaser.GameObjects.Rectangle[] = []
  private moveRange: number = 4 // engine stat
  private attackRange: number = 2 // weapon range

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

    // Draw ocean background
    this.drawOceanBackground()

    // Draw grid overlay
    this.gridOverlay = this.add.graphics()
    this.drawGrid()

    // Spawn player ship
    this.spawnPlayer()

    // Spawn enemies for wave
    this.spawnEnemies()

    // Handle tile click
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPlayerTurn) return
      const col = Math.floor(pointer.x / TILE_SIZE)
      const row = Math.floor(pointer.y / TILE_SIZE)
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return
      this.handleTileClick(col, row)
    })

    // Listen for action mode changes from UIScene
    this.game.events.on('battle:setAction', (mode: ActionMode) => {
      this.actionMode = mode
      this.clearHighlights()
      if (mode === 'move') this.showMoveRange()
      else if (mode === 'attack') this.showAttackRange()
      else if (mode === 'skill') this.showAttackRange() // skill uses same range for now
    })

    this.game.events.on('battle:endTurn', () => {
      this.endPlayerTurn()
    })

    // Emit initial state to UIScene
    this.emitStateUpdate()
    this.emitBattleLog('system', `Wave ${this.wave} begins! ${this.enemies.length} enemy ship(s) detected.`)
  }

  private drawOceanBackground() {
    const bg = this.add.graphics()

    // Deep ocean base
    bg.fillStyle(0x0a1628, 1)
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Ocean wave pattern
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const shade = ((col + row) % 2 === 0) ? 0x0d1e38 : 0x0a1628
        bg.fillStyle(shade, 1)
        bg.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }

    // Ocean tile overlay if available
    if (this.textures.exists('ocean-tiles')) {
      const oceanTile = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'ocean-tiles')
      oceanTile.setAlpha(0.2)
      oceanTile.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT)
    }
  }

  private drawGrid() {
    this.gridOverlay.clear()
    this.gridOverlay.lineStyle(1, 0x2a9d8f, 0.15)

    for (let col = 0; col <= GRID_COLS; col++) {
      this.gridOverlay.lineBetween(col * TILE_SIZE, 0, col * TILE_SIZE, CANVAS_HEIGHT)
    }
    for (let row = 0; row <= GRID_ROWS; row++) {
      this.gridOverlay.lineBetween(0, row * TILE_SIZE, CANVAS_WIDTH, row * TILE_SIZE)
    }
  }

  private spawnPlayer() {
    const x = this.playerCol * TILE_SIZE + TILE_SIZE / 2
    const y = this.playerRow * TILE_SIZE + TILE_SIZE / 2

    if (this.textures.exists('ship-player')) {
      const frames = this.textures.get('ship-player').getFrameNames()
      const frameKey = frames.length > 0 ? frames[0] : undefined
      this.playerSprite = this.add.sprite(x, y, 'ship-player', frameKey)
      this.playerSprite.setDisplaySize(TILE_SIZE - 8, TILE_SIZE - 8)
    } else {
      // Fallback rectangle
      this.playerSprite = this.add.rectangle(x, y, TILE_SIZE - 8, TILE_SIZE - 8, 0x2a9d8f)
      ;(this.playerSprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x66c3b7)
    }
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
      const x = spawn.col * TILE_SIZE + TILE_SIZE / 2
      const y = spawn.row * TILE_SIZE + TILE_SIZE / 2

      let sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle
      const textureKey = isBoss ? 'ship-boss' : 'ship-enemy'

      if (this.textures.exists(textureKey)) {
        const frames = this.textures.get(textureKey).getFrameNames()
        const frameKey = frames.length > 0 ? frames[0] : undefined
        sprite = this.add.sprite(x, y, textureKey, frameKey)
        sprite.setDisplaySize(TILE_SIZE - 8, TILE_SIZE - 8)
      } else {
        sprite = this.add.rectangle(x, y, TILE_SIZE - 8, TILE_SIZE - 8, isBoss ? 0x8b0000 : 0xcc3333)
        ;(sprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xff6666)
      }

      // HP bar above enemy
      const hpBar = this.add.graphics()
      this.drawEnemyHpBar(hpBar, x, y - TILE_SIZE / 2 + 4, hp, hp)

      this.enemies.push({
        sprite,
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
    const dist = Math.abs(col - this.playerCol) + Math.abs(row - this.playerRow)
    if (dist > this.moveRange || dist === 0) return

    // Check not occupied by enemy
    const blocked = this.enemies.some((e) => e.alive && e.col === col && e.row === row)
    if (blocked) return

    // Move player
    this.playerCol = col
    this.playerRow = row
    const x = col * TILE_SIZE + TILE_SIZE / 2
    const y = row * TILE_SIZE + TILE_SIZE / 2

    this.tweens.add({
      targets: this.playerSprite,
      x,
      y,
      duration: 300,
      ease: 'Power2',
    })

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

    const dist = Math.abs(col - this.playerCol) + Math.abs(row - this.playerRow)
    if (dist > this.attackRange) return

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
    const ex = targetEnemy.col * TILE_SIZE + TILE_SIZE / 2
    const ey = targetEnemy.row * TILE_SIZE + TILE_SIZE / 2
    this.drawEnemyHpBar(targetEnemy.hpBar!, ex, ey - TILE_SIZE / 2 + 4, targetEnemy.hp, targetEnemy.maxHp)

    this.emitBattleLog('attack', `Cannons fired at (${col}, ${row})! ${damage} damage dealt.`)

    // Check if enemy destroyed
    if (targetEnemy.hp <= 0) {
      targetEnemy.alive = false
      targetEnemy.hpBar?.destroy()

      // Explosion effect
      if (this.textures.exists('explosion')) {
        const explosion = this.add.sprite(ex, ey, 'explosion')
        explosion.setDisplaySize(TILE_SIZE, TILE_SIZE)
        this.time.delayedCall(500, () => explosion.destroy())
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
    // Crew skill: Gunner multi-shot targets 2 enemies, but for now just higher damage single target
    const targetEnemy = this.enemies.find(
      (e) => e.alive && e.col === col && e.row === row
    )
    if (!targetEnemy) return

    const dist = Math.abs(col - this.playerCol) + Math.abs(row - this.playerRow)
    if (dist > this.attackRange) return

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

    const ex = targetEnemy.col * TILE_SIZE + TILE_SIZE / 2
    const ey = targetEnemy.row * TILE_SIZE + TILE_SIZE / 2
    this.drawEnemyHpBar(targetEnemy.hpBar!, ex, ey - TILE_SIZE / 2 + 4, targetEnemy.hp, targetEnemy.maxHp)

    this.emitBattleLog('skill', `Crew skill activated! ${damage} damage dealt.`)

    if (targetEnemy.hp <= 0) {
      targetEnemy.alive = false
      targetEnemy.hpBar?.destroy()
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
    window.dispatchEvent(new CustomEvent('game:skill', { detail: { slot: 0 } }))
    this.emitStateUpdate()
  }

  private showMoveRange() {
    this.clearHighlights()
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const dist = Math.abs(col - this.playerCol) + Math.abs(row - this.playerRow)
        if (dist > 0 && dist <= this.moveRange) {
          const blocked = this.enemies.some((e) => e.alive && e.col === col && e.row === row)
          if (!blocked) {
            const highlight = this.add.rectangle(
              col * TILE_SIZE + TILE_SIZE / 2,
              row * TILE_SIZE + TILE_SIZE / 2,
              TILE_SIZE - 2,
              TILE_SIZE - 2,
              0x2a9d8f,
              0.2
            )
            highlight.setStrokeStyle(1, 0x2a9d8f, 0.5)
            this.highlightedTiles.push(highlight)
          }
        }
      }
    }
  }

  private showAttackRange() {
    this.clearHighlights()
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const dist = Math.abs(col - this.playerCol) + Math.abs(row - this.playerRow)
        if (dist > 0 && dist <= this.attackRange) {
          const hasEnemy = this.enemies.some((e) => e.alive && e.col === col && e.row === row)
          const color = hasEnemy ? 0xcc3333 : 0xcc3333
          const alpha = hasEnemy ? 0.3 : 0.1
          const highlight = this.add.rectangle(
            col * TILE_SIZE + TILE_SIZE / 2,
            row * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
            color,
            alpha
          )
          highlight.setStrokeStyle(1, 0xcc3333, 0.5)
          this.highlightedTiles.push(highlight)
        }
      }
    }
  }

  private clearHighlights() {
    this.highlightedTiles.forEach((h) => h.destroy())
    this.highlightedTiles = []
  }

  private endPlayerTurn() {
    this.isPlayerTurn = false
    this.actionMode = null
    this.clearHighlights()
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

      const dist = Math.abs(enemy.col - this.playerCol) + Math.abs(enemy.row - this.playerRow)
      const enemyRange = this.wave <= 3 ? 2 : this.wave <= 6 ? 3 : 4
      const enemyDamage = this.wave <= 3 ? 40 : this.wave <= 6 ? 70 : 150

      if (dist <= enemyRange) {
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
        // Move toward player
        let dx = Math.sign(this.playerCol - enemy.col)
        let dy = Math.sign(this.playerRow - enemy.row)

        const newCol = enemy.col + dx
        const newRow = enemy.row + dy

        // Check bounds and not occupied
        if (
          newCol >= 0 && newCol < GRID_COLS &&
          newRow >= 0 && newRow < GRID_ROWS &&
          !(newCol === this.playerCol && newRow === this.playerRow) &&
          !this.enemies.some((e) => e.alive && e !== enemy && e.col === newCol && e.row === newRow)
        ) {
          enemy.col = newCol
          enemy.row = newRow

          const x = newCol * TILE_SIZE + TILE_SIZE / 2
          const y = newRow * TILE_SIZE + TILE_SIZE / 2

          this.tweens.add({
            targets: enemy.sprite,
            x,
            y,
            duration: 300,
            ease: 'Power2',
          })

          // Move HP bar
          if (enemy.hpBar) {
            this.drawEnemyHpBar(enemy.hpBar, x, y - TILE_SIZE / 2 + 4, enemy.hp, enemy.maxHp)
          }

          this.emitBattleLog('enemy', `Enemy moves to (${newCol}, ${newRow})`)
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
  }

  private emitBattleLog(type: string, message: string) {
    window.dispatchEvent(
      new CustomEvent('battle:log', {
        detail: { type, message },
      })
    )
  }
}
