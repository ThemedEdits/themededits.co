// Node script — generates a real projects/<slug>/index.html for every
// entry in PORTFOLIO_ITEMS, from the template. Run: node build-projects.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

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

PORTFOLIO_ITEMS.forEach(item => {
  const dir = path.join(__dirname, 'projects', item.id);
  fs.mkdirSync(dir, { recursive: true });

  const fixed = template
    .replace(/(\bhref|\bsrc)="\.\.\//g, '$1="../../')
    .replace(/data\.assetsRoot\s*=\s*'\.\.\/'/, `data.assetsRoot = '../../'`)

  fs.writeFileSync(path.join(dir, 'index.html'), fixed);
  console.log('Built:', `projects/${item.id}/index.html`);
});

console.log(`\nDone — ${PORTFOLIO_ITEMS.length} project pages generated.`);