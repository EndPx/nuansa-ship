'use client'

// hooks/useAutoSign.ts
// Request an Initia session key (auto-signing grant) for the battle loop.
// Once enabled, every in-battle `submit_move` / `claim_reward` TX signs
// silently without a wallet popup, which is the whole point of session keys.

import { useInterwovenKit } from '@initia/interwovenkit-react'
import { NUANSA_CHAIN_ID } from '@/components/WalletProvider'

export function useAutoSign() {
  const { autoSign, isConnected } = useInterwovenKit()

  const startBattleSession = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }
    if (autoSign.isEnabledByChain[NUANSA_CHAIN_ID]) {
      // Already granted — skip
      return
    }
    await autoSign.enable(NUANSA_CHAIN_ID)
  }

  const endBattleSession = async () => {
    if (autoSign.isEnabledByChain[NUANSA_CHAIN_ID]) {
      await autoSign.disable(NUANSA_CHAIN_ID)
    }
  }

  return {
    startBattleSession,
    endBattleSession,
    isEnabled: !!autoSign.isEnabledByChain[NUANSA_CHAIN_ID],
    expiresAt: autoSign.expiredAtByChain[NUANSA_CHAIN_ID] ?? null,
    isLoading: autoSign.isLoading,
  }
}
