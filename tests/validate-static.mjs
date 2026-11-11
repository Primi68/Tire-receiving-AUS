import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const manifest = await readFile(new URL("../app/src/main/AndroidManifest.xml", import.meta.url), "utf8");
const activity = await readFile(new URL("../app/src/main/java/com/primi/tirereceiving/MainActivity.java", import.meta.url), "utf8");

const seedSource = app.match(/const SEED_TIRES = (\[[\s\S]*?\n\]);/)?.[1];
assert.ok(seedSource, "Initial tire list must be present");
assert.doesNotMatch(app, /inspectionTireSearch\.focus\s*\(/, "New inspections must not auto-focus search and open the keyboard");
assert.match(app, /tire-receiving\.work-items\.v1/, "Daily work items must have a stable local-storage key");
assert.match(app, /function formulaMarkup\(/, "Quantity formulas must use structured markup for emphasis");
assert.match(app, /class=\"formula-focus\"/, "Rack quantity and group count must be visually emphasized");
assert.match(app, /stripeColors: normalizeStripeColors\(stripeSource\.stripeColors/, "Saved records must snapshot tire stripe colors");
assert.match(app, /workItems,/, "JSON backups must include daily work items");
assert.match(html, /id=\"worklistSheet\"/, "The batch work-list builder must be present");
assert.match(html, /id=\"todayProgressText\"/, "Today must show inspection progress without a large dashboard");
assert.match(html, /id=\"statsActualTotal\"/, "The data menu must show cumulative receiving quantity");
assert.match(app, /formatNumber\(actualTotal\)/, "Cumulative receiving quantity must keep exact thousands-separated digits");
const seedTires = Function(`"use strict"; return ${seedSource}`)();

const expectedTires = [
  ["myp-19", 'MYP 19"', 975, "blue", { blue: 25, orange: 20 }, ["red", "red", "", ""], 0],
  ["bridgestone-20", 'Bridgestone 20"', 966, "orange", { blue: 25, orange: 20 }, ["yellow", "", "", ""], null],
  ["e80-hk-front-20", 'E80 HK Front 20"', 756, "orange", { orange: 20 }, ["green", "", "", ""], null],
  ["e80-hk-rear-20", 'E80 HK Rear 20"', 756, "orange", { orange: 16 }, ["green", "", "orange", ""], null],
  ["hk-performance-front-21", 'HK Performance Front 21"', 500, "orange", { orange: 20 }, ["pink", "", "", ""], null],
  ["hk-performance-rear-21", 'HK Performance Rear 21"', 500, "orange", { orange: 16 }, ["white", "", "", ""], null],
  ["ct-p-20", 'CT P 20"', 420, "blue", { blue: 20 }, ["yellow", "orange", "", ""], 0],
  ["e80-continental-front-19", 'E80 Continental Front 19"', 400, "blue", { blue: 25, orange: 20 }, ["white", "orange", "", ""], null],
  ["e80-continental-rear-19", 'E80 Continental Rear 19"', 400, "blue", { blue: 25, orange: 16 }, ["", "yellow-dashed", "orange-dashed", ""], 1],
  ["goodyear-18", 'Goodyear 18"', 270, "blue", { blue: 16 }, ["", "", "", ""], null],
  ["goodyear-20", 'Goodyear 20"', 595, "blue", { blue: 20 }, ["", "", "", ""], null],
  ["e41-18-hk", 'E41 18" HK', 900, "blue", { blue: 25 }, ["sky", "", "", ""], null],
  ["w68-front-18-rt", 'W68 Front 18" RT', 352, "orange", { blue: 20, orange: 16 }, ["brown", "", "red", "orange"], 2],
  ["w68-rear-18-rt", 'W68 Rear 18" RT', 352, "blue", { blue: 20 }, ["green", "purple", "green", ""], null],
];

assert.equal(seedTires.length, expectedTires.length, "Exactly 14 initial tire types are expected");

for (const [index, expected] of expectedTires.entries()) {
  const [id, name, expectedQty, defaultColor, presets, stripeColors, stripeClosePair] = expected;
  const tire = seedTires[index];
  assert.equal(tire.id, id, `Tire ${index + 1} must keep its stable id`);
  assert.equal(tire.name, name, `${id} must keep its display name`);
  assert.equal(tire.expectedQty, expectedQty, `${id} must keep its expected trailer quantity`);
  assert.equal(tire.defaultColor, defaultColor, `${id} must keep its default rack color`);
  assert.deepEqual(
    Object.fromEntries(Object.entries(tire.presets).map(([color, preset]) => [color, preset.qtyPerRack])),
    presets,
    `${id} must keep its Blue/Orange rack capacities`,
  );
  assert.deepEqual(tire.stripeColors, stripeColors, `${id} must keep its four stripe colors`);
  assert.equal(tire.stripeClosePair, stripeClosePair, `${id} must keep its close stripe pair`);
}

for (const tire of seedTires) {
  assert.ok(tire.presets[tire.defaultColor], `${tire.name} must have its default rack preset`);
  for (const preset of Object.values(tire.presets)) {
    const block = preset.qtyPerRack * 4;
    const groups = Math.floor(tire.expectedQty / block);
    const extra = tire.expectedQty % block;
    assert.equal(block * groups + extra, tire.expectedQty, `${tire.name} formula must reproduce its expected quantity`);
  }
}

const referencedIds = [...app.matchAll(/querySelector\("#([A-Za-z0-9_-]+)"\)/g)].map((match) => match[1]);
for (const id of new Set(referencedIds)) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `DOM element #${id} must exist`);
}

assert.doesNotMatch(manifest, /android\.permission\.INTERNET/, "Offline APK must not request internet permission");
assert.match(activity, /setDomStorageEnabled\(true\)/, "WebView local storage must be enabled");
assert.match(activity, /setAllowFileAccess\(false\)/, "Direct file access must stay disabled");
assert.match(activity, /TireNative/, "Android bridge must be registered");
assert.match(activity, /setWebChromeClient\(new WebChromeClient\(\)/, "Android WebView must install JavaScript dialog handling");
assert.match(activity, /onJsConfirm\(/, "Android WebView must handle confirmation dialogs");
assert.match(activity, /result\.confirm\(\)/, "Android confirmation must support approval");
assert.match(activity, /result\.cancel\(\)/, "Android confirmation must support cancellation");
assert.match(app, /window\.receiveBackup/, "Android backup import callback must exist");
assert.match(app, /window\.handleAndroidBack/, "Android back handler must exist");

console.log(`Validated ${seedTires.length} tire presets, ${new Set(referencedIds).size} DOM references, and offline Android wiring.`);
