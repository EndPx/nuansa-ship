'use client'

// hooks/useAutoSign.ts
// Request an Initia session key (auto-signing grant) for the battle loop.
// Once enabled, every in-battle `submit_move` / `claim_reward` TX signs
// silently without a wallet popup, which is the whole point of session keys.

import { useCallback } from 'react'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { NUANSA_CHAIN_ID } from '@/components/WalletProvider'

export function useAutoSign() {
  const { autoSign, isConnected } = useInterwovenKit()

  // CRITICAL: wrap in useCallback with minimal, *primitive* deps. Returning
  // a fresh arrow function on every render would make consumers' useEffects
  // that depend on this callback re-fire indefinitely — which on /battle
  // translates to "start_battle TX re-broadcast on every render → modal
  // re-opens the instant it's dismissed".
  const sessionEnabled = !!autoSign.isEnabledByChain[NUANSA_CHAIN_ID]

  const startBattleSession = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }
    if (sessionEnabled) return
    // Current InterwovenKit API: enable(chainId) only. Per-message
    // permissions come from the Provider-level enableAutoSign prop,
    // and the fee policy (denoms, gas multiplier) from autoSignFeePolicy.
    await autoSign.enable(NUANSA_CHAIN_ID)
  }, [isConnected, sessionEnabled, autoSign])

  const endBattleSession = useCallback(async () => {
    if (sessionEnabled) {
      await autoSign.disable(NUANSA_CHAIN_ID)
    }
  }, [sessionEnabled, autoSign])

  return {
    startBattleSession,
    endBattleSession,
    isEnabled: sessionEnabled,
    expiresAt: autoSign.expiredAtByChain[NUANSA_CHAIN_ID] ?? null,
    isLoading: autoSign.isLoading,
  }
}
