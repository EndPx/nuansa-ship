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
    // If a session is already live for this chain, trust it — all our
    // grants go through this same hook which always passes permissions,
    // so a pre-existing grant is already permissioned correctly. This
    // avoids a second Approve modal when /battle mounts right after
    // the Port "Set Sail" button already provisioned the session.
    if (autoSign.isEnabledByChain[NUANSA_CHAIN_ID]) {
      return
    }
    await (autoSign.enable as any)(NUANSA_CHAIN_ID, {
      permissions: ['/initia.move.v1.MsgExecute'],
    })
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
