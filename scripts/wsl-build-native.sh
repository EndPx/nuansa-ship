#!/bin/bash
# Build Move package on WSL native filesystem (avoids /mnt/d filesystem slowness).
set -e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

SRC="/mnt/d/Belajar/Hackacton/NuansaShip Initiate/contracts"
DST="$HOME/nuansa-ship-contracts"

echo "=== COPY TO NATIVE FS ==="
rm -rf "$DST"
mkdir -p "$DST"
cp -r "$SRC"/* "$DST/"
ls -la "$DST"

echo ""
echo "=== KEY -> HEX ==="
KEY="gas-station"
BECH=$(minitiad keys show "$KEY" -a --keyring-backend test)
echo "bech32: $BECH"
HEX=$(python3 -c "
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
HEX_PADDED="0x$(printf '%064s' "$HEX" | tr ' ' '0')"
echo "hex: $HEX_PADDED"

cd "$DST"
echo ""
echo "=== BUILD (with timeout) ==="
timeout 300 minitiad move build --named-addresses "nuansa_ship=$HEX_PADDED" --path . 2>&1 | tail -40

echo ""
echo "=== BUILD ARTIFACTS ==="
find build -name "*.mv" 2>/dev/null | head -20 || echo "no artifacts"

echo ""
echo "=== DONE ==="
echo "HEX_PADDED=$HEX_PADDED"
echo "BECH32=$BECH"
