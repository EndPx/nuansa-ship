#!/bin/bash
# Vendor the movevm stdlib locally (avoids the minitiad git-fetch hang)
# by rewriting Move.toml dependencies to `local = ...` paths pointing
# at a shallow clone inside the contracts dir.
set -e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

DST="$HOME/nuansa-ship-contracts"
VENDOR="$DST/vendor/movevm"

echo "=== VENDOR MOVEVM STDLIB ==="
mkdir -p "$DST/vendor"
if [ ! -d "$VENDOR/.git" ]; then
  rm -rf "$VENDOR"
  echo "cloning movevm.git into vendor/..."
  git clone --depth 1 https://github.com/initia-labs/movevm.git "$VENDOR" 2>&1 | tail -5
else
  echo "vendor/movevm already present."
fi
ls "$VENDOR/precompile/modules/" | head

echo ""
echo "=== REWRITE Move.toml ==="
cat > "$DST/Move.toml" <<'TOML'
[package]
name = "nuansa_ship"
version = "0.1.0"

[dependencies]
MoveStdlib = { local = "vendor/movevm/precompile/modules/move_stdlib" }
InitiaStdlib = { local = "vendor/movevm/precompile/modules/initia_stdlib" }

[addresses]
nuansa_ship = "_"
std = "0x1"
initia_std = "0x1"
TOML
cat "$DST/Move.toml"

echo ""
echo "=== BUILD ==="
KEY="gas-station"
BECH=$(minitiad keys show "$KEY" -a --keyring-backend test)
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
echo "Deployer hex: $HEX_PADDED"

cd "$DST"
rm -rf build
timeout 180 minitiad move build --named-addresses "nuansa_ship=$HEX_PADDED" --path . 2>&1 | tail -40

echo ""
echo "=== ARTIFACTS ==="
find build -name "*.mv" 2>/dev/null | head -20
