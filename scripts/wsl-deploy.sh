#!/bin/bash
# Build + publish nuansa_ship Move modules to nuansa-ship-1 rollup.
set -e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

PKG_DIR="/mnt/d/Belajar/Hackacton/NuansaShip Initiate/contracts"
KEY="gas-station"
CHAIN_ID="nuansa-ship-1"
NODE="http://localhost:26657"
FEES="200000umin"
GAS="10000000"

echo "=== BECH32 -> HEX (gas-station) ==="
BECH=$(minitiad keys show "$KEY" -a --keyring-backend test)
echo "bech32: $BECH"
# Ethsecp256k1 keys: we can use minitiad debug addr to convert
HEX=$(minitiad debug addr "$BECH" 2>/dev/null | awk -F': ' '/Address \(hex\)/ {print $2}')
if [ -z "$HEX" ]; then
  # fallback: use python bech32 decode
  HEX=$(python3 -c "
import sys
CHARSET='qpzry9x8gf2tvdw0s3jn54khce6mua7l'
def decode(addr):
    pos=addr.rfind('1')
    data=addr[pos+1:-6]
    b=[CHARSET.find(c) for c in data]
    acc=0;bits=0;ret=[]
    for v in b:
        acc=(acc<<5)|v;bits+=5
        if bits>=8:
            bits-=8
            ret.append((acc>>bits)&0xff)
    return bytes(ret).hex()
print(decode('$BECH'))
")
fi
echo "hex: 0x$HEX"
HEX_PADDED="0x$(printf '%064s' "$HEX" | tr ' ' '0')"
echo "hex_padded: $HEX_PADDED"

cd "$PKG_DIR"
echo ""
echo "=== BUILD ==="
rm -rf build
minitiad move build --named-addresses "nuansa_ship=$HEX_PADDED" --path . 2>&1 | tail -30

echo ""
echo "=== BUILT ARTIFACTS ==="
find build -name "*.mv" | head -20

echo ""
echo "=== PUBLISH ==="
BUNDLE=$(ls build/nuansa_ship/bytecode_modules/*.mv 2>/dev/null | head -1)
echo "First module: $BUNDLE"

# Publish all modules in one TX
MVS=$(ls build/nuansa_ship/bytecode_modules/*.mv 2>/dev/null)
echo "Modules to publish:"
echo "$MVS"

# minitiad tx move publish expects a directory of .mv files
# Newer initia move tooling: use `minitiad tx move deploy` or pass multiple .mv files
minitiad tx move deploy-package --package-dir build/nuansa_ship \
    --from "$KEY" --keyring-backend test \
    --chain-id "$CHAIN_ID" --node "$NODE" \
    --fees "$FEES" --gas "$GAS" \
    --broadcast-mode sync -y 2>&1 | tail -25 || \
  minitiad tx move publish "$PKG_DIR" \
    --upgrade-policy compatible \
    --from "$KEY" --keyring-backend test \
    --chain-id "$CHAIN_ID" --node "$NODE" \
    --fees "$FEES" --gas "$GAS" \
    --broadcast-mode sync -y 2>&1 | tail -25

echo ""
echo "=== DEPLOYER ADDRESSES (for frontend CONTRACT_ADDRESS) ==="
echo "BECH32: $BECH"
echo "HEX:    $HEX_PADDED"
