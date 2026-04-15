// lib/contracts.ts
// Builders for the MsgExecute messages consumed by InterwovenKit's
// `requestTxBlock`. Each function returns a cosmjs `EncodeObject[]`
// ready to sign and broadcast.
//
// IMPORTANT: `CONTRACT_ADDRESS` must be set to the deployed Move
// module address on `nuansa-ship-1` before these TXes can succeed.

import { bcs } from '@initia/initia.js'

export const CONTRACT_ADDRESS = '' // filled after `minitiad tx move publish`

const TYPE_URL = '/initia.move.v1.MsgExecute'

const MODULE = {
  mintStarter: 'mint_starter',
  battle: 'battle',
  port: 'port',
} as const

function bcsString(v: string): Uint8Array {
  return bcs.string().serialize(v).toBytes()
}
function bcsU8(v: number): Uint8Array {
  return bcs.u8().serialize(v).toBytes()
}

function msg(
  sender: string,
  moduleName: string,
  functionName: string,
  args: Uint8Array[],
  typeArgs: string[] = [],
) {
  return {
    typeUrl: TYPE_URL,
    value: {
      sender,
      moduleAddress: CONTRACT_ADDRESS,
      moduleName,
      functionName,
      typeArgs,
      args,
    },
  }
}

/** mint_starter::mint_starter_pack(captain_name: String) */
export function buildMintStarterPackTx(sender: string, captainName: string) {
  return [msg(sender, MODULE.mintStarter, 'mint_starter_pack', [bcsString(captainName)])]
}

/** battle::start_battle(wave: u8) */
export function buildStartBattleTx(sender: string, wave: number) {
  return [msg(sender, MODULE.battle, 'start_battle', [bcsU8(wave)])]
}

/** battle::submit_move(move_type: u8, x: u8, y: u8) */
export function buildSubmitMoveTx(sender: string, moveType: number, x: number, y: number) {
  return [msg(sender, MODULE.battle, 'submit_move', [bcsU8(moveType), bcsU8(x), bcsU8(y)])]
}

/** battle::claim_reward() */
export function buildClaimRewardTx(sender: string) {
  return [msg(sender, MODULE.battle, 'claim_reward', [])]
}

/** port::upgrade_building(building_type: u8) */
export function buildUpgradeBuildingTx(sender: string, buildingType: number) {
  return [msg(sender, MODULE.port, 'upgrade_building', [bcsU8(buildingType)])]
}

/** port::rest_crew(crew_token_id: String) */
export function buildRestCrewTx(sender: string, crewTokenId: string) {
  return [msg(sender, MODULE.port, 'rest_crew', [bcsString(crewTokenId)])]
}
