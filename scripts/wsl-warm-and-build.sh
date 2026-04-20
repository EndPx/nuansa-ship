#!/bin/bash
# Warm the Move dependency git cache, then build.
# This avoids the `minitiad move build` hang on first-time git fetch.
set +e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

echo "=== WARM GIT CACHE ==="
mkdir -p ~/.move/https___github_com_initia-labs_movevm_git
cd ~/.move/https___github_com_initia-labs_movevm_git

if [ ! -d main ]; then
  # Move compiler caches by refspec folder; timeout=60 per attempt, retry 3x
  for i in 1 2 3; do
    echo "attempt $i: cloning movevm.git..."
    timeout 120 git clone --depth 1 https://github.com/initia-labs/movevm.git main 2>&1 | tail -5
    if [ -d main/.git ]; then
      echo "cache warmed successfully."
      break
    fi
    rm -rf main
    sleep 2
  done
fi

ls -la ~/.move/https___github_com_initia-labs_movevm_git/ 2>&1 | head -5

echo ""
echo "=== REBUILD ==="
DST="$HOME/nuansa-ship-contracts"
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
timeout 240 minitiad move build --named-addresses "nuansa_ship=$HEX_PADDED" --path . 2>&1 | tail -30

echo ""
echo "=== ARTIFACTS ==="
find build -name "*.mv" 2>/dev/null | head -20
