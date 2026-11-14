#!/bin/sh
# Compiles src/*.adb to WebAssembly and embeds it in ada.js.
# Same toolchain as symmetry-visualizations / murmuration-spark.
set -e
cd "$(dirname "$0")"
T=$PWD/toolchain/usr
[ -x "$T/bin/llvm-gcc" ] || { echo "Run tools/get-toolchain.sh first"; exit 1; }
export LD_LIBRARY_PATH="$PWD/toolchain/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
LD=$(command -v wasm-ld || ls /usr/bin/wasm-ld-* | tail -1)
rm -rf obj/wasm && mkdir -p obj/wasm
cd obj/wasm
for F in ../../src/*.adb; do
  "$T/bin/llvm-gcc" -c --target=wasm32 -O2 -gnat2012 -gnatp -gnatwa -gnatwe \
    --RTS="$T/lib/rts-native" -I../../src "$F"
done
ar x "$T/lib/rts-native/adalib/libgnat.a" s-memcop.o s-memmov.o s-memset.o
"$LD" --no-entry --strip-all --export-memory \
  --export=hp_inputs --export=hp_outputs --export=hp_geom --export=hp_geom_i \
  --export=hp_compute --export=hp_tick \
  -z stack-size=1048576 --initial-memory=16777216 \
  -o hp.wasm *.o
cd ../..
python3 tools/embed.py obj/wasm/hp.wasm version.txt web/index.html web/tour.html
echo "Built site ($(wc -c < obj/wasm/hp.wasm) bytes of WebAssembly)"
