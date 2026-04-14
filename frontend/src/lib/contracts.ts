export const CONTRACT_ADDRESS = '' // filled after deploy

export function buildMintStarterPackTx(captainName: string) {
  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: '',
      module_address: CONTRACT_ADDRESS,
      module_name: 'mint_starter',
      function_name: 'mint_starter_pack',
      type_args: [],
      args: [captainName],
    },
  }
}

export function buildSubmitMoveTx(moveType: number, x: number, y: number) {
  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: '',
      module_address: CONTRACT_ADDRESS,
      module_name: 'battle',
      function_name: 'submit_move',
      type_args: [],
      args: [moveType.toString(), x.toString(), y.toString()],
    },
  }
}

export function buildUpgradeBuildingTx(buildingType: number) {
  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: '',
      module_address: CONTRACT_ADDRESS,
      module_name: 'port',
      function_name: 'upgrade_building',
      type_args: [],
      args: [buildingType.toString()],
    },
  }
}

export function buildClaimRewardTx() {
  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: '',
      module_address: CONTRACT_ADDRESS,
      module_name: 'battle',
      function_name: 'claim_reward',
      type_args: [],
      args: [],
    },
  }
}

export function buildStartBattleTx(wave: number) {
  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: '',
      module_address: CONTRACT_ADDRESS,
      module_name: 'battle',
      function_name: 'start_battle',
      type_args: [],
      args: [wave.toString()],
    },
  }
}

export function buildRestCrewTx(crewTokenId: string) {
  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: '',
      module_address: CONTRACT_ADDRESS,
      module_name: 'port',
      function_name: 'rest_crew',
      type_args: [],
      args: [crewTokenId],
    },
  }
}
