#!/bin/bash
# One-time setup: call mint_starter::initialize_collections to create the
# 3 NFT collections (NSC, NSV, NSCR). Must be called exactly once by the
# module deployer before any player can mint.
set -e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

CHAIN_ID="nuansa-ship-1"
NODE="http://localhost:26657"
KEY="gas-station"
BECH=$(minitiad keys show "$KEY" -a --keyring-backend test)
HEX="0x4224dcc266eee2869c03d7757b324ecf678ac2ed"

echo "Deployer: $BECH"
echo "Calling mint_starter::initialize_collections..."

minitiad tx move execute \
  "$HEX" mint_starter initialize_collections \
  --from "$KEY" --keyring-backend test \
  --chain-id "$CHAIN_ID" --node "$NODE" \
  --fees 300000umin --gas 5000000 \
  --broadcast-mode sync -y 2>&1 | tail -20

echo ""
echo "Wait 6s..."
sleep 6

echo ""
echo "=== COLLECTION CHECK ==="
minitiad q tx --type=hash $(minitiad q txs --events "message.sender='$BECH'" --node "$NODE" -o json --limit 1 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["txs"][0]["txhash"])' 2>/dev/null || echo "")  --node "$NODE" -o json 2>/dev/null | head -c 400 || echo "(tx lookup may be delayed)"
