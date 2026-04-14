// hooks/useAutoSign.ts
// Session key hook for auto-signing battle transactions
// TODO: Replace with real InterwovenKit session key once SDK is connected

export function useAutoSign() {
  const startBattleSession = async () => {
    console.log('Session key requested for battle auto-signing')

    // TODO: Uncomment once @initia/interwovenkit-react is installed
    // const { requestSessionKey } = useInterwovenKit()
    // await requestSessionKey({
    //   allowedMessages: [
    //     { typeUrl: '/initia.move.v1.MsgExecute', value: { function: 'submit_move' } },
    //     { typeUrl: '/initia.move.v1.MsgExecute', value: { function: 'claim_reward' } },
    //   ],
    //   expiresIn: 3600,
    // })

    return true
  }

  const endBattleSession = async () => {
    console.log('Battle session ended')
  }

  return { startBattleSession, endBattleSession }
}
