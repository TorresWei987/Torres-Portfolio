import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { projects } from './content.mjs';

const pages = ['index.html','work/index.html','about/index.html', ...projects.map(p => `projects/${p.slug}/index.html`), '404.html'];
let references = 0;
for (const page of pages) {
  const html = await readFile(`dist/${page}`, 'utf8');
  assert.match(html, /<html lang="en"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: one main heading`);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="Pause animations"/);
  assert.doesNotMatch(html, /lorem ipsum|placeholder|href="#"/i);
  for (const match of html.matchAll(/<(?:img)\b[^>]*>/g)) {
    assert.match(match[0], /\balt="/);
    assert.match(match[0], /\bwidth="/);
    assert.match(match[0], /\bheight="/);
  }
  for (const match of html.matchAll(/(?:href|src|data-lightbox)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
    const ref = match[1];
    const target = resolve('dist', `.${ref}`, ref.endsWith('/') ? 'index.html' : '');
    await access(target);
    references++;
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), `${page}: anchor ${match[1]}`);
}
const demo = await readFile('dist/demos/handbooker/app.js', 'utf8');
assert.ok(!demo.includes('fetch("/"') && !demo.includes("fetch('/'"), 'Portfolio demo must not submit to site root');
console.log(`Passed: ${pages.length} pages, ${references} local references, image dimensions, English metadata, navigation anchors, and isolated demo checks.`);
