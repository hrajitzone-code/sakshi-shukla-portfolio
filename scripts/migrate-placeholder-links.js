const fs = require('fs');
const path = require('path');
const { isPlaceholderUrl } = require('../src/lib/demoLinkValidator.ts');

const filePath = path.join(__dirname, '..', 'src', 'data', 'projects.json');
const projects = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('=== MIGRATING PLACEHOLDER DEMO LINKS ===\n');

let cleanedCount = 0;

projects.forEach((proj) => {
  let modified = false;

  if (isPlaceholderUrl(proj.demoUrl)) {
    console.log(`[CLEANED] ${proj.id}: Removed placeholder demoUrl (${proj.demoUrl})`);
    proj.demoUrl = '';
    modified = true;
  }

  if (proj.demos && Array.isArray(proj.demos)) {
    proj.demos.forEach((d) => {
      if (isPlaceholderUrl(d.url)) {
        console.log(`[CLEANED] ${proj.id} / demo "${d.title}": Removed placeholder URL (${d.url})`);
        d.url = '';
        d.status = 'draft';
        modified = true;
      }
    });
  }

  if (modified) cleanedCount++;
});

fs.writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf8');

console.log(`\nSuccessfully audited ${projects.length} projects. Cleaned ${cleanedCount} placeholder URLs.`);
console.log('All projects are now flagged in Admin to enter genuine links, and public cards will never open fake destinations.');
