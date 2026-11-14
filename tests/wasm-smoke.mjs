// Instantiates the built WebAssembly module and checks the same reference
// values as tests/smoke.adb, through the browser ABI.
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import assert from "node:assert/strict";

const wasm = await WebAssembly.instantiate(await readFile(new URL("../obj/wasm/hp.wasm", import.meta.url)));
const e = wasm.instance.exports;
const inputs = new Float64Array(e.memory.buffer, e.hp_inputs() >>> 0, 16);
const outputs = new Float64Array(e.memory.buffer, e.hp_outputs() >>> 0, 32);
const geomI = new Int32Array(e.memory.buffer, e.hp_geom_i() >>> 0, 1024);

function near(got, expected, rel = 1e-9) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(got - expected) <= rel * scale, `${got} != ${expected}`);
}

test("solar-mass black hole matches the independent reference", () => {
  e.hp_compute(6);
  const sun = outputs[8];
  near(sun, 1.988409870698051e30);
  inputs[0] = 0;
  inputs[1] = sun;
  e.hp_compute(1);
  assert.equal(outputs[0], 1);
  near(outputs[3], 2953.25007610025);
  near(outputs[5], 1.0488914478465575e77);
  assert.ok(outputs[3] > 2940 && outputs[3] < 2970);
  assert.ok(outputs[5] > 0.9e77 && outputs[5] < 1.2e77);
});

test("sugar-cube counts and a slower surface", () => {
  inputs[0] = 4;
  e.hp_compute(2);
  assert.equal(outputs[2], 257);
  assert.equal(outputs[3], 294);
  assert.ok(outputs[6] / outputs[2] > outputs[7] / outputs[3]);
});

test("Poincaré disk and geodesic check", () => {
  inputs[0] = 0; inputs[1] = 0; inputs[2] = 0.5; inputs[3] = 0;
  e.hp_compute(3);
  assert.equal(geomI[0], 85);
  near(outputs[8], 0.6435011087932843, 1e-8);
  inputs[0] = 0.4; inputs[1] = 2.4;
  e.hp_compute(4);
  near(outputs[6], 4.432425181498717, 1e-8);
  near(outputs[7], 4.432566439718999, 1e-8);
  assert.ok(Math.abs(outputs[6] - outputs[7]) / outputs[7] < 1e-3);
});

test("HaPPY greedy threshold", () => {
  inputs[0] = 1; inputs[1] = 0;
  e.hp_compute(5);
  assert.equal(outputs[4], 6);
  inputs[1] = 3;
  e.hp_compute(5);
  assert.equal(outputs[4], 0);
  inputs[1] = 4;
  e.hp_compute(5);
  assert.equal(outputs[4], 4);
  assert.equal(geomI[100], 1);
  inputs[0] = 0;
  inputs[1] = (1 << 20) - 1;
  e.hp_compute(5);
  assert.equal(outputs[4], 0);
});
