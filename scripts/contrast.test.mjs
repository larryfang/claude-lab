import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// Reads the colour tokens from styles.css and checks WCAG AA (4.5:1) for every text pair the UI uses.
const css = fs.readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
function tokens(selector) {
  const start = css.indexOf(selector + " {"), end = css.indexOf("}", start), out = {};
  for (const m of css.slice(start, end).matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2];
  return out;
}
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const light = tokens(":root"), dark = { ...light, ...tokens('[data-theme="dark"]') };
const TEXT_PAIRS = [["ink", "bg"], ["ink-2", "surface"], ["muted", "bg"], ["muted", "surface"], ["muted", "surface-2"], ["link", "bg"], ["link", "surface"],
  ["clay-deep", "clay-soft"], ["clay-deep", "bg"], ["tip", "surface"], ["note", "surface"], ["concept", "surface"], ["try", "surface"],
  ["bad", "surface"], ["on-accent", "tip"], ["on-accent", "bad"], ["on-accent", "btn-from"], ["on-accent", "btn-to"], ["lvl-core", "surface"]];
// Light tints are opaque hex; dark tints carry alpha, so they are checked on the light theme only.
const LIGHT_ONLY = [["tip", "tip-bg"], ["note", "note-bg"], ["try", "try-bg"], ["warn", "warn-bg"], ["concept", "concept-bg"]];

for (const [name, t, pairs] of [["light", light, [...TEXT_PAIRS, ...LIGHT_ONLY]], ["dark", dark, TEXT_PAIRS]]) {
  test(`${name} theme text meets WCAG AA`, () => {
    const fails = pairs.filter(([f, b]) => t[f] && t[b] && ratio(t[f], t[b]) < 4.5).map(([f, b]) => `${f} on ${b}: ${ratio(t[f], t[b]).toFixed(2)}`);
    const missing = pairs.filter(([f, b]) => !t[f] || !t[b]).map(([f, b]) => `${f}/${b}`);
    assert.deepEqual(missing, [], "tokens missing from styles.css");
    assert.deepEqual(fails, []);
  });
}

// Non-text contrast (WCAG 1.4.11, 3:1): focus rings and form-control boundaries against the surfaces they sit on.
const NON_TEXT_PAIRS = [["focus", "bg"], ["focus", "surface"], ["control-line", "surface"], ["control-line", "bg"]];
for (const [name, t] of [["light", light], ["dark", dark]]) {
  test(`${name} theme focus ring and control borders meet 3:1`, () => {
    const missing = NON_TEXT_PAIRS.filter(([f, b]) => !t[f] || !t[b]).map(([f, b]) => `${f}/${b}`);
    assert.deepEqual(missing, [], "tokens missing from styles.css");
    const fails = NON_TEXT_PAIRS.filter(([f, b]) => ratio(t[f], t[b]) < 3).map(([f, b]) => `${f} on ${b}: ${ratio(t[f], t[b]).toFixed(2)}`);
    assert.deepEqual(fails, []);
  });
}
test("the simulator's suggested command is readable as text", () => {
  const m = css.match(/\.ccsim-input::placeholder \{ color: (#[0-9a-fA-F]{6})/), bar = css.match(/\.ccsim-inputline \{[^}]*background: (#[0-9a-fA-F]{6})/);
  assert.ok(m && bar, "placeholder and input-bar colours must be literal hex in styles.css");
  assert.ok(ratio(m[1], bar[1]) >= 4.5, `placeholder ${m[1]} on ${bar[1]}: ${ratio(m[1], bar[1]).toFixed(2)}`);
});
