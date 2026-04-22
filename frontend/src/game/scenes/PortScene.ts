import * as Phaser from 'phaser'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/config'

interface BuildingConfig {
  key: string
  name: string
  type: number
  x: number
  y: number
}

export class PortScene extends Phaser.Scene {
  private buildings: Phaser.GameObjects.Container[] = []

  constructor() {
    super({ key: 'PortScene' })
  }

  create() {
    this.drawHarborBackground()
    this.drawCompassWatermark()
    this.drawAmbientOverlay()

    const buildingConfigs: BuildingConfig[] = [
      { key: 'building-shipyard', name: 'SHIPYARD', type: 0, x: 120, y: 150 },
      { key: 'building-armory', name: 'ARMORY', type: 1, x: 320, y: 130 },
      { key: 'building-barracks', name: 'BARRACKS', type: 2, x: 520, y: 150 },
      { key: 'building-admirals-hall', name: "ADMIRAL'S HALL", type: 3, x: 220, y: 340 },
      { key: 'building-warehouse', name: 'WAREHOUSE', type: 4, x: 440, y: 340 },
    ]

    buildingConfigs.forEach((config) => this.createBuilding(config))

    // Dock signal flare
    this.drawFlare(80, CANVAS_HEIGHT - 80)
    this.drawFlare(CANVAS_WIDTH - 80, CANVAS_HEIGHT - 80)

    // Scene label
    this.add.text(CANVAS_WIDTH / 2, 28, '◊  PORT NUANSA  ◊', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: '#52E0C4',
      stroke: '#0A1628',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0.8)

    this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20, 'CLICK BUILDING TO UPGRADE', {
      fontFamily: 'VT323, monospace',
      fontSize: '12px',
      color: '#2A9D8F',
    }).setOrigin(0.5).setAlpha(0.6)
  }

  private drawHarborBackground() {
    const bg = this.add.graphics()

    // Deep void base
    bg.fillStyle(0x0a1628, 1)
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Water ripple tint (top band)
    bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x102840, 0x102840, 1, 1, 1, 1)
    bg.fillRect(0, 0, CANVAS_WIDTH, 80)

    // Dock area (wooden parchment tint base)
    bg.fillStyle(0x1a2a3e, 0.9)
    bg.fillRect(24, 80, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 160)

    // Richer dock texture via a tiled pixellab plank pattern.
    // add.tileSprite repeats the texture across a rect without seam fuss.
    if (this.textures.exists('dock-plank')) {
      const dockW = CANVAS_WIDTH - 48
      const dockH = CANVAS_HEIGHT - 160
      const dock = this.add.tileSprite(
        24 + dockW / 2,
        80 + dockH / 2,
        dockW,
        dockH,
        'dock-plank',
      )
      dock.setTileScale(0.7, 0.7)
      dock.setAlpha(0.55)
      dock.setBlendMode(Phaser.BlendModes.MULTIPLY)
    }

    // Subtle plank joint lines on top of the texture
    bg.lineStyle(1, 0x8b6914, 0.22)
    for (let y = 88; y < CANVAS_HEIGHT - 80; y += 20) {
      bg.lineBetween(24, y, CANVAS_WIDTH - 24, y)
    }
    for (let x = 48; x < CANVAS_WIDTH - 24; x += 120) {
      bg.lineBetween(x, 80, x, CANVAS_HEIGHT - 80)
    }

    // Dock border (art-deco corners)
    bg.lineStyle(2, 0x2a9d8f, 0.5)
    bg.strokeRect(24, 80, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 160)

    // Corner brackets
    const drawBracket = (x: number, y: number, dx: number, dy: number) => {
      bg.lineStyle(3, 0xc8a255, 0.8)
      bg.lineBetween(x, y, x + dx * 16, y)
      bg.lineBetween(x, y, x, y + dy * 16)
    }
    drawBracket(24, 80, 1, 1)
    drawBracket(CANVAS_WIDTH - 24, 80, -1, 1)
    drawBracket(24, CANVAS_HEIGHT - 80, 1, -1)
    drawBracket(CANVAS_WIDTH - 24, CANVAS_HEIGHT - 80, -1, -1)

    // Ocean water ripples (bottom band)
    bg.fillStyle(0x0d1e38, 1)
    bg.fillRect(0, CANVAS_HEIGHT - 80, CANVAS_WIDTH, 80)
    bg.lineStyle(1, 0x2a9d8f, 0.4)
    for (let y = CANVAS_HEIGHT - 70; y < CANVAS_HEIGHT; y += 10) {
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        bg.lineBetween(x, y, x + 20, y)
      }
    }

    // Deliberately NOT tiling harbor-tiles anymore — that atlas has
    // water-to-wood transition frames that scatter into a mess when
    // placed randomly. Clean graphics-only dock above reads much better.

    // Scatter a few small dock details on the wooden platform so it's
    // not flat. Rope coils, barrel dots, and rivet clusters.
    let seed = 0xc0ffee
    const rand = () => {
      seed = (seed + 0x9e3779b9) >>> 0
      let t = seed
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    // Rivet/nail dots along plank joints
    const rivets = this.add.graphics()
    rivets.fillStyle(0x3a2a10, 0.65)
    for (let y = 88; y < CANVAS_HEIGHT - 80; y += 20) {
      for (let x = 60; x < CANVAS_WIDTH - 40; x += 120) {
        rivets.fillCircle(x, y, 1.5)
      }
    }

    // Small lantern glows along the edges
    const lanternY = CANVAS_HEIGHT - 100
    ;[80, CANVAS_WIDTH / 2, CANVAS_WIDTH - 80].forEach((lx, i) => {
      const glow = this.add.graphics()
      glow.fillStyle(0xf4a261, 0.15)
      glow.fillCircle(lx, lanternY, 26)
      const core = this.add.graphics()
      core.fillStyle(0xffd59a, 0.85)
      core.fillCircle(lx, lanternY, 3)
      this.tweens.add({
        targets: glow,
        alpha: 0.05,
        duration: 1600 + i * 300,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })

    // Faint foam ripple streaks in the bottom water band
    for (let i = 0; i < 5; i++) {
      const streak = this.add.graphics()
      const y = CANVAS_HEIGHT - 60 + rand() * 40
      const x = rand() * CANVAS_WIDTH
      const w = 40 + rand() * 80
      streak.fillStyle(0x52e0c4, 0.18)
      streak.fillRect(x, y, w, 1)
      this.tweens.add({
        targets: streak,
        x: `+=${CANVAS_WIDTH / 3}`,
        duration: 6000 + rand() * 4000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.inOut',
      })
    }
  }

  private drawCompassWatermark() {
    const g = this.add.graphics()
    const cx = CANVAS_WIDTH / 2
    const cy = CANVAS_HEIGHT / 2

    g.lineStyle(1, 0xc8a255, 0.1)
    g.strokeCircle(cx, cy, 140)
    g.strokeCircle(cx, cy, 100)
    g.strokeCircle(cx, cy, 60)

    // Cross lines
    g.lineStyle(1, 0x2a9d8f, 0.12)
    g.lineBetween(cx - 150, cy, cx + 150, cy)
    g.lineBetween(cx, cy - 150, cx, cy + 150)

    // N marker
    this.add.text(cx, cy - 150, 'N', {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      color: '#c8a255',
    }).setOrigin(0.5).setAlpha(0.3)
  }

  private drawAmbientOverlay() {
    // Scanline simulation via horizontal lines
    const scan = this.add.graphics()
    scan.lineStyle(1, 0x52e0c4, 0.04)
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      scan.lineBetween(0, y, CANVAS_WIDTH, y)
    }
  }

  private drawFlare(x: number, y: number) {
    const flare = this.add.graphics()
    flare.fillStyle(0xc8a255, 0.8)
    flare.fillCircle(x, y, 3)
    this.tweens.add({
      targets: flare,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private createBuilding(config: BuildingConfig) {
    const container = this.add.container(config.x, config.y)

    // Building frame (console panel)
    const bg = this.add.graphics()
    const drawFrame = (highlighted: boolean) => {
      bg.clear()
      // Outer glow
      if (highlighted) {
        bg.fillStyle(0x2a9d8f, 0.15)
        bg.fillRect(-46, -46, 92, 92)
      }
      // Panel
      bg.fillStyle(0x0a1628, 0.9)
      bg.fillRect(-42, -42, 84, 84)
      // Border
      bg.lineStyle(highlighted ? 2 : 1, highlighted ? 0x52e0c4 : 0x2a9d8f, highlighted ? 1 : 0.6)
      bg.strokeRect(-42, -42, 84, 84)
      // Corner brackets
      const col = highlighted ? 0xc8a255 : 0x2a9d8f
      bg.lineStyle(2, col, 0.9)
      bg.lineBetween(-42, -42, -34, -42)
      bg.lineBetween(-42, -42, -42, -34)
      bg.lineBetween(42, -42, 34, -42)
      bg.lineBetween(42, -42, 42, -34)
      bg.lineBetween(-42, 42, -34, 42)
      bg.lineBetween(-42, 42, -42, 34)
      bg.lineBetween(42, 42, 34, 42)
      bg.lineBetween(42, 42, 42, 34)
    }
    drawFrame(false)
    container.add(bg)

    // Building sprite
    if (this.textures.exists(config.key)) {
      const sprite = this.add.image(0, -6, config.key)
      sprite.setDisplaySize(58, 58)
      container.add(sprite)
    } else {
      const placeholder = this.add.text(0, -8, '⛵', { fontSize: '32px' }).setOrigin(0.5)
      container.add(placeholder)
    }

    // Label
    const nameText = this.add.text(0, 52, config.name, {
      fontFamily: 'VT323, monospace',
      fontSize: '13px',
      color: '#52E0C4',
      stroke: '#0A1628',
      strokeThickness: 2,
    }).setOrigin(0.5)
    container.add(nameText)

    // Level indicator
    const levelText = this.add.text(0, 66, 'LV · 0', {
      fontFamily: 'VT323, monospace',
      fontSize: '11px',
      color: '#c8a255',
    }).setOrigin(0.5)
    container.add(levelText)

    // Pulse dot (active building)
    const dot = this.add.graphics()
    dot.fillStyle(0x52e0c4, 1)
    dot.fillCircle(-36, -36, 2)
    container.add(dot)
    this.tweens.add({
      targets: dot,
      alpha: 0.2,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    })

    // Hit area
    const hitArea = this.add.rectangle(0, 0, 84, 84)
    hitArea.setInteractive({ useHandCursor: true })
    container.add(hitArea)

    hitArea.on('pointerover', () => {
      drawFrame(true)
      nameText.setColor('#F4A261')
      this.tweens.add({
        targets: container,
        scale: 1.04,
        duration: 150,
        ease: 'Power2',
      })
    })

    hitArea.on('pointerout', () => {
      drawFrame(false)
      nameText.setColor('#52E0C4')
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: 'Power2',
      })
    })

    hitArea.on('pointerdown', () => {
      // Flash
      this.tweens.add({
        targets: container,
        alpha: 0.5,
        duration: 80,
        yoyo: true,
      })
      window.dispatchEvent(
        new CustomEvent('port:building-click', {
          detail: {
            buildingType: config.type,
            buildingName: config.name,
            currentLevel: 0,
          },
        })
      )
    })

    this.buildings.push(container)
  }
}
