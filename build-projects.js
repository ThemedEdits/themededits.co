// Node script — generates a real projects/<slug>/index.html for every
// entry in PORTFOLIO_ITEMS, from the template. Run: node build-projects.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE_URL = 'https://themededits.vercel.app';

const itemsSrc = fs.readFileSync(path.join(__dirname, 'js/portfolio-items.js'), 'utf8');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(itemsSrc + '\nthis.PORTFOLIO_ITEMS = PORTFOLIO_ITEMS;', sandbox);

const PORTFOLIO_ITEMS = sandbox.PORTFOLIO_ITEMS;

if (!PORTFOLIO_ITEMS) {
  console.error('Could not load PORTFOLIO_ITEMS from js/portfolio-items.js — check the file exists and defines it.');
  process.exit(1);
}

const template = fs.readFileSync(path.join(__dirname, 'projects/project-template.html'), 'utf8');

// Basic HTML-attribute/text escaping so titles or descriptions with
// & < > " never break the markup they're injected into.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// De-dupe by id in case the data file has an accidental repeat entry.
const seen = new Set();
const uniqueItems = PORTFOLIO_ITEMS.filter(item => {
  if (seen.has(item.id)) {
    console.warn(`Skipping duplicate entry for "${item.id}" — already built.`);
    return false;
  }
  seen.add(item.id);
  return true;
});

uniqueItems.forEach(item => {
  const dir = path.join(__dirname, 'projects', item.id);
  fs.mkdirSync(dir, { recursive: true });

  const projectUrl = `${SITE_URL}/projects/${item.id}/`;
  const projectImage = item.heroImage
    ? `${SITE_URL}${item.heroImage}`
    : `${SITE_URL}${item.thumbnail}`;
  const keywords = [item.title, item.subtitle, ...(item.services || []), 'Themed Edits']
    .filter(Boolean)
    .join(', ');

  const fixed = template
    .replace(/(\bhref|\bsrc)="\.\.\//g, '$1="../../')
    .replace(/\bdata\.assetsRoot\s*=\s*(['"])\.\.\/\1/g, 'data.assetsRoot = \'../../\'')
    .replace(/\{\{PROJECT_TITLE\}\}/g, escapeHtml(item.title))
    .replace(/\{\{PROJECT_SUBTITLE\}\}/g, escapeHtml(item.subtitle))
    .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, escapeHtml(item.description))
    .replace(/\{\{PROJECT_KEYWORDS\}\}/g, escapeHtml(keywords))
    .replace(/\{\{PROJECT_URL\}\}/g, projectUrl)
    .replace(/\{\{PROJECT_IMAGE\}\}/g, projectImage);

  fs.writeFileSync(path.join(dir, 'index.html'), fixed);
  console.log('Built:', `projects/${item.id}/index.html`);
});

console.log(`\nDone — ${uniqueItems.length} project pages generated.`);