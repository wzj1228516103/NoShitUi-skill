import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const codes = ['zh-CN', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const projects = JSON.parse(read('docs/screenshots/concepts/showcase-slides.json'));
const english = JSON.parse(read('ui-atlas-demo/locales/en.json'));
const html = read('ui-atlas-demo/showcase.html');
const keys = object => Object.keys(object).sort();
for (const code of codes) {
  const bundle = JSON.parse(read(`ui-atlas-demo/locales/${code}.json`));
  assert.equal(bundle.language, code);
  assert.deepEqual(keys(bundle.ui), keys(english.ui), `${code}: complete interface translation`);
  assert.deepEqual(keys(bundle.projects), projects.map(project => project.id).sort(), `${code}: all twenty examples`);
  const readme = read(bundle.readme);
  assert.match(readme, new RegExp(`^## ${bundle.installAnchor}$`, 'im'), `${code}: localized installation heading`);
  for (const [key, value] of Object.entries(bundle.ui)) {
    assert.ok(typeof value === 'string' && value.trim(), `${code}: ${key} must be translated`);
    assert.ok(!/TODO|TRANSLATE|undefined/.test(value), `${code}: ${key} has placeholder text`);
  }
  for (const { id } of projects) {
    const entry = bundle.projects[id];
    for (const field of ['role', 'slogan', 'description', 'action']) {
      assert.ok(typeof entry[field] === 'string' && entry[field].trim(), `${code}/${id}: ${field}`);
    }
    assert.equal(entry.tags.length, english.projects[id].tags.length, `${code}/${id}: complete tags`);
    assert.ok(entry.tags.every(tag => typeof tag === 'string' && tag.trim()));
    assert.ok(html.includes(`data-project="${id}"`), `${id}: matching card`);
  }
  assert.ok(html.includes(`value="${code}"`), `${code}: language selector option`);
  console.log(`${code}: complete interface, 20 examples, and matching README`);
}
assert.equal((html.match(/data-project="/g) || []).length, projects.length);
console.log('All eight languages validated.');
