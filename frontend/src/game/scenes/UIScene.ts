import * as Phaser from 'phaser'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/config'

interface BattleState {
  playerHp: number
  playerMaxHp: number
  wave: number
  isPlayerTurn: boolean
  status: string
}

export class UIScene extends Phaser.Scene {
  private hpBarBg!: Phaser.GameObjects.Graphics
  private hpBarFill!: Phaser.GameObjects.Graphics
  private hpText!: Phaser.GameObjects.Text
  private turnText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private crewIcons: Phaser.GameObjects.Text[] = []
  private actionButtons: Phaser.GameObjects.Container[] = []
  private state: BattleState = {
    playerHp: 500,
    playerMaxHp: 500,
    wave: 1,
    isPlayerTurn: true,
    status: 'active',
  }

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    // This scene renders on top of BattleScene
    this.scene.bringToTop()

    // Top-left: HP bar
    this.createHpBar()

    // Top-center: Turn indicator
    this.turnText = this.add.text(CANVAS_WIDTH / 2, 12, 'YOUR TURN', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#2A9D8F',
    }).setOrigin(0.5)

    // Top-right: Wave counter
    this.waveText = this.add.text(CANVAS_WIDTH - 16, 12, 'Wave 1', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(1, 0)

    // Bottom-left: Crew status
    this.createCrewStatus()

    // Bottom-right: Action buttons
    this.createActionButtons()

    // Listen for state updates from BattleScene
    this.game.events.on('battle:stateUpdate', (newState: BattleState) => {
      this.state = newState
      this.updateUI()
    })
  }

  private createHpBar() {
    const x = 16
    const y = 10
    const width = 160
    const height = 14

    // Label
    this.add.text(x, y - 2, 'HP', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#2A9D8F',
    })

    // Background
    this.hpBarBg = this.add.graphics()
    this.hpBarBg.fillStyle(0x333333, 0.7)
    this.hpBarBg.fillRoundedRect(x + 20, y, width, height, 3)

    // Fill
    this.hpBarFill = this.add.graphics()
    this.drawHpFill(1.0)

    // Text
    this.hpText = this.add.text(x + 20 + width / 2, y + height / 2, '500/500', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5)
  }

  private drawHpFill(ratio: number) {
    const x = 36
    const y = 10
    const width = 160
    const height = 14

    this.hpBarFill.clear()
    const color = ratio > 0.5 ? 0x2a9d8f : ratio > 0.25 ? 0xcccc44 : 0xcc4444
    this.hpBarFill.fillStyle(color, 1)
    this.hpBarFill.fillRoundedRect(x, y, width * ratio, height, 3)
  }

  private createCrewStatus() {
    const y = CANVAS_HEIGHT - 28
    const startX = 16

    this.add.text(startX, y - 14, 'Crew', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#2A9D8F',
    })

    const crewData = [
      { label: 'G', status: 'ready' },   // Gunner
      { label: 'N', status: 'none' },     // Navigator (not recruited)
      { label: 'E', status: 'none' },     // Engineer (not recruited)
    ]

    crewData.forEach((crew, i) => {
      const x = startX + i * 48
      const statusSymbol = crew.status === 'ready' ? '\u2713' :
                           crew.status === 'injured' ? '!' :
                           crew.status === 'ko' ? '\u2717' : '-'
      const statusColor = crew.status === 'ready' ? '#44cc44' :
                          crew.status === 'injured' ? '#cccc44' :
                          crew.status === 'ko' ? '#cc4444' : '#666666'

      const text = this.add.text(x, y, `${crew.label}[${statusSymbol}]`, {
        fontFamily: 'Inter, monospace',
        fontSize: '12px',
        color: statusColor,
      })

      this.crewIcons.push(text)
    })
  }

  private createActionButtons() {
    const buttonDefs = [
      { label: 'Move', action: 'move', color: 0x2a9d8f },
      { label: 'Attack', action: 'attack', color: 0xcc3333 },
      { label: 'Skill', action: 'skill', color: 0xcccc44 },
      { label: 'End', action: 'endTurn', color: 0x666666 },
    ]

    const startX = CANVAS_WIDTH - 16
    const y = CANVAS_HEIGHT - 28
    const btnWidth = 56
    const btnHeight = 22
    const gap = 4

    buttonDefs.forEach((def, i) => {
      const x = startX - (buttonDefs.length - i) * (btnWidth + gap)
      const container = this.add.container(x, y)

      const bg = this.add.graphics()
      bg.fillStyle(def.color, 0.7)
      bg.fillRoundedRect(0, 0, btnWidth, btnHeight, 4)
      container.add(bg)

      const text = this.add.text(btnWidth / 2, btnHeight / 2, def.label, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5)
      container.add(text)

      const hitArea = this.add.rectangle(btnWidth / 2, btnHeight / 2, btnWidth, btnHeight)
      hitArea.setInteractive({ useHandCursor: true })
      container.add(hitArea)

      hitArea.on('pointerover', () => {
        bg.clear()
        bg.fillStyle(def.color, 1)
        bg.fillRoundedRect(0, 0, btnWidth, btnHeight, 4)
      })

      hitArea.on('pointerout', () => {
        bg.clear()
        bg.fillStyle(def.color, 0.7)
        bg.fillRoundedRect(0, 0, btnWidth, btnHeight, 4)
      })

      hitArea.on('pointerdown', () => {
        if (!this.state.isPlayerTurn || this.state.status !== 'active') return

        if (def.action === 'endTurn') {
          this.game.events.emit('battle:endTurn')
        } else {
          this.game.events.emit('battle:setAction', def.action)
        }
      })

      this.actionButtons.push(container)
    })
  }

  private updateUI() {
    // Update HP bar
    const ratio = this.state.playerMaxHp > 0 ? this.state.playerHp / this.state.playerMaxHp : 0
    this.drawHpFill(Math.max(0, ratio))
    this.hpText.setText(`${this.state.playerHp}/${this.state.playerMaxHp}`)

    // Update turn text
    if (this.state.status === 'won') {
      this.turnText.setText('VICTORY!')
      this.turnText.setColor('#44cc44')
    } else if (this.state.status === 'lost') {
      this.turnText.setText('DEFEATED')
      this.turnText.setColor('#cc4444')
    } else if (this.state.isPlayerTurn) {
      this.turnText.setText('YOUR TURN')
      this.turnText.setColor('#2A9D8F')
    } else {
      this.turnText.setText('ENEMY TURN')
      this.turnText.setColor('#cc4444')
    }

    // Update wave text
    this.waveText.setText(`Wave ${this.state.wave}`)
  }
}
