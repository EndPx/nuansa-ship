import * as Phaser from 'phaser'
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '@/game/config'

interface BuildingConfig {
  key: string
  name: string
  type: number
  x: number
  y: number
}

export class PortScene extends Phaser.Scene {
  private buildings: Phaser.GameObjects.Container[] = []
  private selectedBuilding: number = -1

  constructor() {
    super({ key: 'PortScene' })
  }

  create() {
    // Draw harbor background
    this.drawHarborBackground()

    // Building configurations
    const buildingConfigs: BuildingConfig[] = [
      { key: 'building-shipyard', name: 'Shipyard', type: 0, x: 96, y: 128 },
      { key: 'building-armory', name: 'Armory', type: 1, x: 288, y: 128 },
      { key: 'building-barracks', name: 'Barracks', type: 2, x: 480, y: 128 },
      { key: 'building-admirals-hall', name: "Admiral's Hall", type: 3, x: 192, y: 320 },
      { key: 'building-warehouse', name: 'Warehouse', type: 4, x: 416, y: 320 },
    ]

    // Place buildings
    buildingConfigs.forEach((config) => {
      this.createBuilding(config)
    })

    // "Set Sail" button
    this.createSetSailButton()

    // Title
    this.add.text(CANVAS_WIDTH / 2, 24, 'PORT', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#2A9D8F',
    }).setOrigin(0.5)
  }

  private drawHarborBackground() {
    // Ocean base
    const bg = this.add.graphics()
    bg.fillStyle(0x0a1628, 1)
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Harbor dock area (lighter area)
    bg.fillStyle(0x1a2a3e, 1)
    bg.fillRect(32, 64, CANVAS_WIDTH - 64, CANVAS_HEIGHT - 128)

    // Dock border
    bg.lineStyle(2, 0x2a9d8f, 0.4)
    bg.strokeRect(32, 64, CANVAS_WIDTH - 64, CANVAS_HEIGHT - 128)

    // Draw wooden planks pattern
    bg.lineStyle(1, 0x8b6914, 0.15)
    for (let y = 64; y < CANVAS_HEIGHT - 64; y += 16) {
      bg.lineBetween(32, y, CANVAS_WIDTH - 32, y)
    }

    // Harbor tile background if available
    if (this.textures.exists('harbor-tiles')) {
      const harborTile = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'harbor-tiles')
      harborTile.setAlpha(0.3)
      harborTile.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT)
    }
  }

  private createBuilding(config: BuildingConfig) {
    const container = this.add.container(config.x, config.y)

    // Building background
    const bg = this.add.graphics()
    bg.fillStyle(0x1a2a3e, 0.8)
    bg.fillRoundedRect(-40, -40, 80, 80, 4)
    bg.lineStyle(1, 0x2a9d8f, 0.5)
    bg.strokeRoundedRect(-40, -40, 80, 80, 4)
    container.add(bg)

    // Building sprite
    if (this.textures.exists(config.key)) {
      const sprite = this.add.image(0, -4, config.key)
      sprite.setDisplaySize(56, 56)
      container.add(sprite)
    } else {
      // Placeholder icon
      const placeholder = this.add.text(0, -8, '🏗', {
        fontSize: '32px',
      }).setOrigin(0.5)
      container.add(placeholder)
    }

    // Building name
    const nameText = this.add.text(0, 48, config.name, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5)
    container.add(nameText)

    // Level indicator
    const levelText = this.add.text(0, 62, 'Lv.0', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#2A9D8F',
    }).setOrigin(0.5)
    container.add(levelText)

    // Make interactive
    const hitArea = this.add.rectangle(0, 0, 80, 80)
    hitArea.setInteractive({ useHandCursor: true })
    container.add(hitArea)

    hitArea.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x2a9d8f, 0.2)
      bg.fillRoundedRect(-40, -40, 80, 80, 4)
      bg.lineStyle(2, 0x2a9d8f, 0.8)
      bg.strokeRoundedRect(-40, -40, 80, 80, 4)
    })

    hitArea.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x1a2a3e, 0.8)
      bg.fillRoundedRect(-40, -40, 80, 80, 4)
      bg.lineStyle(1, 0x2a9d8f, 0.5)
      bg.strokeRoundedRect(-40, -40, 80, 80, 4)
    })

    hitArea.on('pointerdown', () => {
      this.selectedBuilding = config.type
      window.dispatchEvent(
        new CustomEvent('port:building-click', {
          detail: {
            buildingType: config.type,
            buildingName: config.name,
            currentLevel: 0, // TODO: read from chain
          },
        })
      )
    })

    this.buildings.push(container)
  }

  private createSetSailButton() {
    const btnX = CANVAS_WIDTH / 2
    const btnY = CANVAS_HEIGHT - 40

    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x2a9d8f, 1)
    btnBg.fillRoundedRect(btnX - 70, btnY - 16, 140, 32, 6)

    const btnText = this.add.text(btnX, btnY, 'Set Sail', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5)

    const btnHit = this.add.rectangle(btnX, btnY, 140, 32)
    btnHit.setInteractive({ useHandCursor: true })

    btnHit.on('pointerover', () => {
      btnBg.clear()
      btnBg.fillStyle(0x227e72, 1)
      btnBg.fillRoundedRect(btnX - 70, btnY - 16, 140, 32, 6)
    })

    btnHit.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x2a9d8f, 1)
      btnBg.fillRoundedRect(btnX - 70, btnY - 16, 140, 32, 6)
    })

    btnHit.on('pointerdown', () => {
      this.scene.start('BattleScene')
      this.scene.launch('UIScene')
    })
  }
}
