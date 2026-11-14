import {test} from "node:test";
import assert from "node:assert/strict";
import {messages, locales} from "../web/i18n.js";

function leaves(node, prefix = "") {
  if (node === null || typeof node !== "object") return [prefix];
  return Object.keys(node).flatMap(key => leaves(node[key], prefix ? prefix + "." + key : key));
}

test("en, de, es and fr expose the same copy", () => {
  const en = leaves(messages.en).sort();
  for (const lang of ["de", "es", "fr"]) {
    const keys = leaves(messages[lang]).sort();
    assert.deepEqual(keys, en, lang);
    for (const key of en) {
      const value = key.split(".").reduce((o, k) => o[k], messages[lang]);
      assert.equal(typeof value, "string");
      assert.ok(value.length > 0, key);
    }
  }
});

test("default locale is UK English", () => {
  assert.equal(locales.en, "en-GB");
  assert.equal(locales.de, "de-DE");
  assert.equal(locales.es, "es-ES");
  assert.equal(locales.fr, "fr-FR");
});
