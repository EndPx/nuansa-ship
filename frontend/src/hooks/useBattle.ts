'use client'

// hooks/useBattle.ts
// Battle state management + TX submission via InterwovenKit.

import { useState, useCallback } from 'react'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import {
  buildSubmitMoveTx,
  buildClaimRewardTx,
  buildStartBattleTx,
  CONTRACT_ADDRESS,
} from '@/lib/contracts'

interface BattleState {
  id: number | null
  wave: number
  playerHp: number
  status: 'idle' | 'active' | 'won' | 'lost'
  isPlayerTurn: boolean
}

interface UseBattleResult {
  battle: BattleState
  startBattle: (wave: number) => Promise<void>
  submitMove: (moveType: number, x: number, y: number) => Promise<void>
  claimReward: () => Promise<void>
  isSubmitting: boolean
}

export function useBattle(): UseBattleResult {
  const { address, isConnected, requestTxSync } = useInterwovenKit()
  const [battle, setBattle] = useState<BattleState>({
    id: null,
    wave: 1,
    playerHp: 500,
    status: 'idle',
    isPlayerTurn: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const broadcast = useCallback(
    async (messages: any[], tag: string) => {
      if (!CONTRACT_ADDRESS || !isConnected || !address) {
        console.log(`[${tag}] would broadcast`, messages)
        return
      }
      const hash = await requestTxSync({ messages })
      console.log(`[${tag}] TX hash:`, hash)
    },
    [address, isConnected, requestTxSync],
  )

  const startBattle = useCallback(
    async (wave: number) => {
      if (!address) return
      setIsSubmitting(true)
      try {
        await broadcast(buildStartBattleTx(address, wave), 'start_battle')
        setBattle({
          id: Date.now(),
          wave,
          playerHp: 500,
          status: 'active',
          isPlayerTurn: true,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [address, broadcast],
  )

  const submitMove = useCallback(
    async (moveType: number, x: number, y: number) => {
      if (!address) return
      setIsSubmitting(true)
      try {
        await broadcast(buildSubmitMoveTx(address, moveType, x, y), 'submit_move')
      } finally {
        setIsSubmitting(false)
      }
    },
    [address, broadcast],
  )

  const claimReward = useCallback(async () => {
    if (!address) return
    setIsSubmitting(true)
    try {
      await broadcast(buildClaimRewardTx(address), 'claim_reward')
    } finally {
      setIsSubmitting(false)
    }
  }, [address, broadcast])

  return { battle, startBattle, submitMove, claimReward, isSubmitting }
}
