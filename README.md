# Holo Tour

A child-friendly guided tour of the holographic principle. Every card opens with one plain sentence and a picture you can move. The fold **Show me the maths** has the real formula, a worked sample, and live recalculation.

The physics (Schwarzschild radius, Bekenstein–Hawking entropy, sugar-cube counts, the Poincaré disk, regularised geodesics, and the HaPPY greedy entanglement wedge) is Ada in `src/`, compiled to WebAssembly. JavaScript only draws, runs the menus, and writes the F9 feedback file.

Live site (GitHub Pages, `main`, repository root): <https://robertboettchersf.github.io/holographic-principle/>

## Build

Same Ada → WebAssembly toolchain as [symmetry-visualizations](https://github.com/RobertBoettcherSF/symmetry-visualizations) and [murmuration-spark](https://github.com/RobertBoettcherSF/murmuration-spark).

```sh
sudo apt install rpm2cpio cpio lld libedit2
# alr is needed once, to fetch the GNAT 14 runtime the compiler itself uses
./tools/get-toolchain.sh
gprbuild -P tests/smoke.gpr && ./obj/native/smoke
./build.sh
node --test tests/*.test.mjs
```

`build.sh` writes `ada.js`, `index.html` and `tour.html` at the repository root. The visible stamp and `version.txt` are the same line. Build times are Europe/Berlin.

## Stops

1. **A black hole's memory is on its skin** — mass slider, Schwarzschild radius, horizon area, Bekenstein–Hawking entropy and bits, with the Sun and the Earth as comparisons.
2. **Area beats volume** — sugar cubes against stickers.
3. **A 3D world drawn on a 2D sheet** — a pannable Poincaré disk and the boundary arc that encodes a bulk point.
4. **Shortest paths measure connection** — a bulk geodesic and the Ryu–Takayanagi entropy, checked against `(c/3) ln(L/ε)`.
5. **A secret shared so it can survive** — the first ring of the HaPPY pentagon code and the greedy entanglement wedge.

English (UK) is the default. German, Spanish and French translate the interface. Sound can be switched off; that choice is remembered. F9 downloads a feedback file.
