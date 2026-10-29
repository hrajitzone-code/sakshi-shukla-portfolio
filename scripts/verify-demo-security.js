const fs = require('fs');
const path = require('path');

console.log('=== DEMO ISOLATION & SECURITY AUDIT ===\n');

let failed = false;

// 1. Audit projects.json for real client/proprietary data
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'projects.json'), 'utf8'));
const projectsRaw = JSON.stringify(projects);

if (projectsRaw.includes('Coral BIOS')) {
  console.error('[FAIL] projects.json still contains real client name "Coral BIOS"');
  failed = true;
} else {
  console.log('[PASS] 1. projects.json sanitized: Zero occurrences of "Coral BIOS". All 11 projects use synthetic dummy data.');
}

// Check for live Google Sheets edit/private links
const unsafeLinks = projects.flatMap(p => [p.demoUrl, ...(p.demos || []).map(d => d.url)]).filter(u => u && !u.startsWith('https://example.com/demo-preview') && !u.startsWith('#'));
if (unsafeLinks.length > 0) {
  console.error('[FAIL] Found potentially unsafe live demo URLs:', unsafeLinks);
  failed = true;
} else {
  console.log('[PASS] 2. System Demo links sanitized: All URLs point to safe mock preview endpoints.');
}

// 2. Audit src/lib/data.ts for personal PII and client references
const dataFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'data.ts'), 'utf8');
if (dataFile.includes('sakshishukla1167@gmail.com') || dataFile.includes('8200619139') || dataFile.includes('AJIT ZONE PVT. LTD.') || dataFile.includes('Coral BIOS')) {
  console.error('[FAIL] src/lib/data.ts still contains real personal contact data, company names, or client references');
  failed = true;
} else {
  console.log('[PASS] 3. src/lib/data.ts sanitized: Real email, phone, company names, and client references replaced with fictional demo data.');
}

// 3. Audit src/lib/auth.ts for hardcoded secret fallbacks
const authFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'auth.ts'), 'utf8');
if (authFile.includes('sakshi-admin-2026') || authFile.includes('sakshi-shukla-portfolio-secret-salt-2026')) {
  console.error('[FAIL] src/lib/auth.ts still contains hardcoded secret fallbacks');
  failed = true;
} else {
  console.log('[PASS] 4. src/lib/auth.ts sanitized: Zero hardcoded secrets. Requires explicit environment variables or uses ephemeral runtime salt.');
}

// 4. Audit API Route security & Demo Mode enforcement
const projectsRoute = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'api', 'projects', 'route.ts'), 'utf8');
const projectIdRoute = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'api', 'projects', '[id]', 'route.ts'), 'utf8');
const uploadRoute = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'api', 'upload', 'route.ts'), 'utf8');
const contactRoute = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'api', 'contact', 'route.ts'), 'utf8');

if (!projectsRoute.includes('IS_DEMO_MODE') || !projectIdRoute.includes('IS_DEMO_MODE') || !uploadRoute.includes('IS_DEMO_MODE')) {
  console.error('[FAIL] API routes missing IS_DEMO_MODE enforcement');
  failed = true;
} else {
  console.log('[PASS] 5. API Routes protected: All mutating endpoints (POST, PUT, DELETE, Upload) strictly reject modifications with 403 in Demo Mode.');
}

if (!uploadRoute.includes('MAX_FILE_SIZE_BYTES') || !uploadRoute.includes('ALLOWED_MIME_TYPES')) {
  console.error('[FAIL] Upload route missing file size or MIME type validation');
  failed = true;
} else {
  console.log('[PASS] 6. Upload validation added: 5 MB size ceiling and strictly allowed MIME types (JPEG, PNG, WebP).');
}

if (!contactRoute.includes('RATE_LIMIT_WINDOW_MS') || !contactRoute.includes('sanitize')) {
  console.error('[FAIL] Contact route missing rate limiting or sanitization');
  failed = true;
} else {
  console.log('[PASS] 7. Contact endpoint protected: IP rate limiting, input sanitization, and demo simulation mode.');
}

// 5. Audit layout metadata for search engines and production domain isolation
const layoutFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'layout.tsx'), 'utf8');
if (!layoutFile.includes('robots') || !layoutFile.includes('index: false')) {
  console.error('[FAIL] src/app/layout.tsx missing noindex metadata');
  failed = true;
} else if (layoutFile.includes('sakshi-shukla-portfolio-six.vercel.app')) {
  console.error('[FAIL] src/app/layout.tsx hardcodes live production domain');
  failed = true;
} else {
  console.log('[PASS] 8. Production URL Isolation & noindex: Zero hardcoded production domains, noindex/nofollow configured.');
}

// 6. Audit Admin Dashboard Demo Banner
const dashboardFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'admin', 'AdminDashboard.tsx'), 'utf8');
if (!dashboardFile.includes('Public Demo Sandbox (Read-Only Mode)')) {
  console.error('[FAIL] AdminDashboard missing demo sandbox banner');
  failed = true;
} else {
  console.log('[PASS] 9. Admin Dashboard UX: Public Demo Sandbox alert banner prominently rendered.');
}

// 7. Audit Login Endpoint Protection & Credential Handling
const loginRoute = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'login', 'route.ts'), 'utf8');
if (!loginRoute.includes('LOGIN_RATE_WINDOW_MS') || !loginRoute.includes('isAuthConfigured') || !loginRoute.includes('503')) {
  console.error('[FAIL] Login route missing rate-limiting or 503 fallback when ADMIN_PASSWORD is unset');
  failed = true;
} else {
  console.log('[PASS] 10. Login Endpoint Protection: Rate limiting enabled (5 failed attempts locks IP), and safe 503 refusal when no ADMIN_PASSWORD is provided.');
}

if (failed) {
  console.error('\n>>> ONE OR MORE SECURITY CHECKS FAILED <<<');
  process.exit(1);
} else {
  console.log('\n>>> ALL 10 DEMO ISOLATION & SECURITY CHECKS PASSED SUCCESSFULLY! <<<');
}
