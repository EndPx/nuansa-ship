'use client'

import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { phaserConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/config'
import { PreloadScene } from '@/game/scenes/PreloadScene'
import { PortScene } from '@/game/scenes/PortScene'
import { BattleScene } from '@/game/scenes/BattleScene'
import { UIScene } from '@/game/scenes/UIScene'

interface GameCanvasProps {
  initialScene?: string
}

export default function GameCanvas({ initialScene = 'PreloadScene' }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      ...phaserConfig,
      scene: [PreloadScene, PortScene, BattleScene, UIScene],
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    // If a specific scene is requested, store it for PreloadScene to read
    game.registry.set('initialScene', initialScene)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [initialScene])

  return (
    <div
      id="game-container"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        border: '2px solid #2A9D8F',
        borderRadius: '4px',
      }}
    />
  )
}
