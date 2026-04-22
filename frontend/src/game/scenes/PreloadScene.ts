import * as Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // Progress bar
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x2a9d8f, 0.3)
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30)

    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#2A9D8F',
    }).setOrigin(0.5)

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x2a9d8f, 1)
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20)
      percentText.setText(`${Math.round(value * 100)}%`)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })

    // Tilesets are 128x128 atlases with 4x4 = 16 frames of 32x32 each.
    // Load as spritesheets so scenes can place individual tile frames.
    this.load.spritesheet('ocean-tiles', '/assets/tilesets/ocean.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('harbor-tiles', '/assets/tilesets/harbor.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    // Ships (atlas: spritesheet + JSON)
    this.load.atlas('ship-player', '/assets/ships/ship_player.png', '/assets/ships/ship_player.json')
    this.load.atlas('ship-enemy', '/assets/ships/ship_enemy.png', '/assets/ships/ship_enemy.json')
    this.load.atlas('ship-boss', '/assets/ships/ship_boss.png', '/assets/ships/ship_boss.json')

    // Effects
    this.load.atlas('explosion', '/assets/effects/explosion.png', '/assets/effects/explosion.json')

    // Hex tiles (pixellab-generated 96x96 hex shapes for battle grid)
    this.load.image('hex-water', '/assets/ui/hex_water.png')
    this.load.image('hex-reef', '/assets/ui/hex_reef.png')

    // Buildings
    this.load.image('building-shipyard', '/assets/buildings/shipyard.png')
    this.load.image('building-armory', '/assets/buildings/armory.png')
    this.load.image('building-barracks', '/assets/buildings/barracks.png')
    this.load.image('building-admirals-hall', '/assets/buildings/admirals_hall.png')
    this.load.image('building-warehouse', '/assets/buildings/warehouse.png')

    // Portraits
    this.load.image('portrait-captain', '/assets/portraits/captain.png')
    this.load.image('icon-gunner', '/assets/portraits/gunner.png')
    this.load.image('icon-navigator', '/assets/portraits/navigator.png')
    this.load.image('icon-engineer', '/assets/portraits/engineer.png')
  }

  create() {
    const initialScene = this.game.registry.get('initialScene') || 'PortScene'
    this.scene.start(initialScene)
  }
}
