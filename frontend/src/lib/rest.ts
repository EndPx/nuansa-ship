// lib/rest.ts
// Tiny helper for the rollup REST. Queries a Move resource at the given
// owner address and returns its parsed `data` field, or null if the
// resource doesn't exist.
//
// Module address is the HEX form of the deployer (see lib/contracts.ts);
// struct tags follow the form `<MODULE_HEX>::<module>::<Struct>`.

const REST = 'http://localhost:1317'
export const MODULE_HEX = '0x4224dcc266eee2869c03d7757b324ecf678ac2ed'

export async function fetchMoveResource<T = any>(
  bech32Address: string,
  module: string,
  struct: string,
): Promise<T | null> {
  const tag = `${MODULE_HEX}::${module}::${struct}`
  const url = `${REST}/initia/move/v1/accounts/${bech32Address}/resources/by_struct_tag?struct_tag=${encodeURIComponent(
    tag,
  )}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const j = await res.json()
    const moveRaw = j?.resource?.move_resource ?? j?.move_resource ?? null
    if (!moveRaw) return null
    const parsed = typeof moveRaw === 'string' ? JSON.parse(moveRaw) : moveRaw
    return (parsed?.data ?? parsed ?? null) as T
  } catch {
    return null
  }
}
