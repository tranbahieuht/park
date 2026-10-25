import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/sites/nortonpark/assets/map/location-map.html'), 'utf8');
const data = JSON.parse(html.match(/window\.LM_DATA=(.*?);<\/script>/s)[1]);
const source = fs.readFileSync(path.join(root, 'src/components/sites/nortonpark/data/location-map-i18n.ts'), 'utf8');
const moduleContext = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, moduleContext);
const { LOCATION_MAP_VI: vi, LOCATION_MAP_EN: en } = moduleContext.exports;

test('every map translation has a nonempty VI and EN value', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(vi).sort());
  for (const key of Object.keys(vi)) {
    assert.ok(vi[key].trim(), key);
    assert.ok(en[key].trim(), key);
  }
});

test('required tabs, categories and travel-time units have English translations', () => {
  assert.equal(en['map.ui.highlights'].toUpperCase(), 'HIGHLIGHTS');
  assert.equal(en['map.ui.time'].toUpperCase(), 'TRAVEL TIME');
  assert.equal(en['map.ui.filters'].toUpperCase(), 'FILTERS');
  assert.equal(en['map.ui.minute'], 'MIN');
  assert.equal(en['map.ui.explore'].toUpperCase(), 'CLICK THE MAP TO EXPLORE');
  assert.deepEqual([0, 1, 2, 3].map(i => en[`map.highlight.${i}.k`].toUpperCase()),
    ['ADJACENT', 'OPPOSITE', 'STRATEGIC CONNECTIONS', 'NEARBY']);
});

test('all map points and all travel-band items are covered, including unopened tabs', () => {
  const covered = (key, original) => {
    assert.equal(vi[key], original, `Vietnamese source changed: ${key}`);
    assert.ok(en[key], `Missing English: ${key}`);
    assert.doesNotMatch(en[key], /Bệnh viện|\bBV\b|\bKCN\b|Nút giao|Cầu vượt|Khu công nghiệp|Vành đai|Sân bay|Trường ĐH/);
  };
  for (const kind of ['poi', 'junction', 'bridge', 'airport', 'road']) {
    for (const feature of data.features[kind]) covered(`map.feature.${feature.id}`, feature.name);
  }
  for (const band of data.bands) band.items.forEach((item, i) => covered(`map.band.${band.id}.${i}`, item.name));
  for (const legend of data.legend) covered(`map.legend.${legend.id}`, legend.name);
  for (const [id, category] of Object.entries(data.cats)) covered(`map.cat.${id}`, category.name);
  for (const preset of data.presets) covered(`map.preset.${preset.id}`, preset.name);
  data.highlights.forEach((highlight, i) => {
    for (const key of ['k', 'title', 'sub']) covered(`map.highlight.${i}.${key}`, highlight[key]);
  });
});

test('static UI, tooltips and accessibility bindings cannot reference missing keys', () => {
  const markup = html.slice(0, html.indexOf('<script>window.LM_DATA='));
  for (const [, key] of markup.matchAll(/data-lm-i18n(?:-title|-label)?="(map\.[^"]+)"/g)) {
    assert.ok(en[key], key);
    assert.ok(vi[key], key);
  }
});

test('standalone map scripts parse (Next build does not compile public HTML scripts)', () => {
  for (const [, attrs, script] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/ld\+json"/.test(attrs)) continue;
    assert.doesNotThrow(() => new vm.Script(script));
  }
});

test('an open location card renders its own travel time and updates with the locale', () => {
  const render = html.match(/function renderCard\(\) \{[\s\S]*?\n\}/)[0];
  const feature = data.features.poi.find(point => point.id === 'columbia');
  for (const copy of [vi, en]) {
    const nodes = {};
    vm.runInNewContext(`${render}\nrenderCard();`, {
      cardFor: { ...feature, kind: 'poi' }, CAT: data.cats, D: data,
      $: selector => nodes[selector] ||= {},
      tr: (key, fallback) => copy[key] ?? fallback,
      esc: value => String(value),
      bandOf: id => data.bands.find(band => band.items.some(item => item.f === id))?.t,
    });
    assert.equal(nodes['#card .n'].textContent, copy['map.feature.columbia']);
    assert.equal(nodes['#card .k'].textContent, copy[`map.cat.${feature.cat}`]);
    assert.ok(nodes['#card .m'].innerHTML.includes(copy['map.ui.cardTravel']));
    assert.ok(nodes['#card .m'].innerHTML.includes(copy['map.ui.cardFrom']));
  }
});
