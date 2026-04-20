// lib/contracts.ts
// Builders for the MsgExecute messages consumed by InterwovenKit's
// `requestTxBlock`. Each function returns a cosmjs `EncodeObject[]`
// ready to sign and broadcast.
//
// IMPORTANT: `CONTRACT_ADDRESS` must be set to the deployed Move
// module address on `nuansa-ship-1` before these TXes can succeed.

import { bcs } from '@initia/initia.js'

// Deployed to nuansa-ship-1 rollup on 2026-04-21.
// Bech32 (moduleAddress is required to be bech32 in MsgExecute on Move VMs).
// Hex equivalent: 0x4224dcc266eee2869c03d7757b324ecf678ac2ed
// Publish TX: 2155866E0F6327A938D709A2AE7044B839C15B87C4237F32FD8581F0688A4835
export const CONTRACT_ADDRESS = 'init1ggjdesnxam3gd8qr6a6hkvjweanc4shdtpd73f'

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

/**
 * mint_starter::mint_starter_pack(captain_name: String)
 *
 * Single TX that mints Captain NFT + Corvette NFT + Gunner NFT and
 * initializes the player's Port (all buildings at level 0). Fails
 * if the player already has a PlayerProfile.
 */
export function buildMintStarterPackTx(sender: string, captainName: string) {
  return [msg(sender, MODULE.mintStarter, 'mint_starter_pack', [bcsString(captainName)])]
}

/**
 * battle::start_battle(wave: u8)
 *
 * Spawns the player + enemies for the given wave onto a 10×8 grid.
 * Wave 1–3 = 1 enemy, 4–6 = 2 enemies, 7+ = boss.
 */
export function buildStartBattleTx(sender: string, wave: number) {
  return [msg(sender, MODULE.battle, 'start_battle', [bcsU8(wave)])]
}

/**
 * battle::submit_move(move_type: u8, x: u8, y: u8)
 *
 * Submits a single player action during their turn. move_type:
 *   0 = move, 1 = attack, 2 = crew skill.
 * Coordinates are tile indices (0..9 × 0..7).
 */
export function buildSubmitMoveTx(sender: string, moveType: number, x: number, y: number) {
  return [msg(sender, MODULE.battle, 'submit_move', [bcsU8(moveType), bcsU8(x), bcsU8(y)])]
}

/**
 * battle::claim_reward()
 *
 * Callable only when the active Battle has status == 1 (won). Rolls
 * loot from the wave-appropriate drop table and deposits it into the
 * player's Inventory, then grants captain XP.
 */
export function buildClaimRewardTx(sender: string) {
  return [msg(sender, MODULE.battle, 'claim_reward', [])]
}

/**
 * port::upgrade_building(building_type: u8)
 *
 * Consumes the required material from Inventory (cost = next_level × multiplier)
 * and increments the targeted building level. Max level is 5.
 * building_type: 0=Shipyard 1=Armory 2=Barracks 3=AdmiralsHall 4=Warehouse
 */
export function buildUpgradeBuildingTx(sender: string, buildingType: number) {
  return [msg(sender, MODULE.port, 'upgrade_building', [bcsU8(buildingType)])]
}

/**
 * port::rest_crew(crew_token_id: String)
 *
 * Clears an Injured crew member back to Ready. Requires barracks_level >= 1.
 */
export function buildRestCrewTx(sender: string, crewTokenId: string) {
  return [msg(sender, MODULE.port, 'rest_crew', [bcsString(crewTokenId)])]
}
