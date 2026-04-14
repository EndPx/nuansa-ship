// hooks/useBattle.ts
// Battle state management + TX submission
// TODO: Replace stubs with real on-chain interactions once contracts are deployed

import { useState, useCallback } from 'react'
import { buildSubmitMoveTx, buildClaimRewardTx } from '@/lib/contracts'

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
  const [battle, setBattle] = useState<BattleState>({
    id: null,
    wave: 1,
    playerHp: 500,
    status: 'idle',
    isPlayerTurn: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startBattle = useCallback(async (wave: number) => {
    setIsSubmitting(true)
    try {
      // TODO: await signAndBroadcast(buildStartBattleTx(wave))
      console.log('Starting battle wave', wave)
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
  }, [])

  const submitMove = useCallback(async (moveType: number, x: number, y: number) => {
    setIsSubmitting(true)
    try {
      const tx = buildSubmitMoveTx(moveType, x, y)
      console.log('Submitting move:', tx)
      // TODO: await signAndBroadcast(tx)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const claimReward = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const tx = buildClaimRewardTx()
      console.log('Claiming reward:', tx)
      // TODO: await signAndBroadcast(tx)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { battle, startBattle, submitMove, claimReward, isSubmitting }
}
