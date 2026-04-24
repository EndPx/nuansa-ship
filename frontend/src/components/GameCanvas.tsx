'use client'

import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { phaserConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/config'
import { PreloadScene } from '@/game/scenes/PreloadScene'
import { PortScene } from '@/game/scenes/PortScene'
import { BattleScene } from '@/game/scenes/BattleScene'
import { UIScene } from '@/game/scenes/UIScene'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import {
  buildSubmitMoveTx,
  buildClaimRewardTx,
  CONTRACT_ADDRESS,
} from '@/lib/contracts'
import { NUANSA_CHAIN_ID } from '@/components/WalletProvider'
import { useAutoSign } from '@/hooks/useAutoSign'

interface GameCanvasProps {
  initialScene?: string
}

export default function GameCanvas({ initialScene = 'PreloadScene' }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const kit = useInterwovenKit() as any
  const { isConnected, requestTxSync } = kit
  // Move VM requires bech32 sender; fall back to `address` if initiaAddress missing
  const address: string | undefined = kit.initiaAddress ?? kit.address
  const { startBattleSession, isEnabled: sessionActive } = useAutoSign()

  useEffect(() => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      ...phaserConfig,
      scene: [PreloadScene, PortScene, BattleScene, UIScene],
    }

    const game = new Phaser.Game(config)
    gameRef.current = game
    game.registry.set('initialScene', initialScene)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [initialScene])

  // Ensure the session key is enabled (with the right permissions) on
  // entering BattleScene. Skip if already active — Port's "Set Sail"
  // button typically provisions the session before navigating here,
  // so this effect only runs when the user deep-links into /battle
  // without passing through Port.
  useEffect(() => {
    if (initialScene !== 'BattleScene' || !isConnected) return
    if (sessionActive) return
    let cancelled = false
    startBattleSession().catch((err) => {
      if (!cancelled) console.warn('Auto-sign session denied or unavailable:', err)
    })
    return () => {
      cancelled = true
    }
  }, [initialScene, isConnected, sessionActive, startBattleSession])

  // Bridge Phaser battle events to signAndBroadcast
  useEffect(() => {
    if (initialScene !== 'BattleScene') return

    const broadcast = async (messages: any[], tag: string) => {
      // Guard: contracts not deployed yet → just log
      if (!CONTRACT_ADDRESS || !isConnected || !address) {
        console.log(`[${tag}] would broadcast`, messages)
        return
      }
      try {
        // Silent signing is controlled by the provider-level
        // enableAutoSign + autoSignFeePolicy config, not per-tx flags.
        // Just pass chainId so the kit picks the right rollup.
        const hash = await requestTxSync({
          chainId: NUANSA_CHAIN_ID,
          messages,
        })
        console.log(`[${tag}] TX hash:`, hash)
        window.dispatchEvent(
          new CustomEvent('chain:confirmed', { detail: { tag, hash } }),
        )
      } catch (err) {
        console.error(`[${tag}] broadcast failed:`, err)
        window.dispatchEvent(
          new CustomEvent('battle:log', {
            detail: { type: 'system', message: `Broadcast failed: ${String(err).slice(0, 60)}` },
          }),
        )
      }
    }

    const onMove = (e: Event) => {
      if (!address) return
      const { x, y } = (e as CustomEvent).detail || {}
      broadcast(buildSubmitMoveTx(address, 0, x, y), 'submit_move:move')
    }
    const onAttack = (e: Event) => {
      if (!address) return
      const { x, y } = (e as CustomEvent).detail || {}
      broadcast(buildSubmitMoveTx(address, 1, x, y), 'submit_move:attack')
    }
    const onSkill = (e: Event) => {
      if (!address) return
      const { x, y, slot } = (e as CustomEvent).detail || {}
      broadcast(buildSubmitMoveTx(address, 2, x ?? slot ?? 0, y ?? 0), 'submit_move:skill')
    }
    const onClaim = () => {
      if (!address) return
      broadcast(buildClaimRewardTx(address), 'claim_reward')
    }

    window.addEventListener('game:move', onMove)
    window.addEventListener('game:attack', onAttack)
    window.addEventListener('game:skill', onSkill)
    window.addEventListener('game:claim', onClaim)
    return () => {
      window.removeEventListener('game:move', onMove)
      window.removeEventListener('game:attack', onAttack)
      window.removeEventListener('game:skill', onSkill)
      window.removeEventListener('game:claim', onClaim)
    }
  }, [initialScene, address, isConnected, requestTxSync])

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
