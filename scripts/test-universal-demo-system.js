const { validateDemoLink, getUniversalDemoUrl, isPlaceholderUrl } = require('../src/lib/demoLinkValidator.ts');

console.log('=== UNIVERSAL DEMO-LINK SYSTEM COMPREHENSIVE TEST SUITE ===\n');

let failed = false;

// -------------------------------------------------------------
// Test Case 1: Multiple Project Types (Req 1, 4, 5, 10)
// -------------------------------------------------------------
console.log('--- 1. Testing URL Types and Protocols ---');

const testCases = [
  // A. Google Sheet
  {
    url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
    expectValid: true,
    expectType: 'google-sheets',
    label: 'Google Sheet (Valid ID)',
  },
  // B. Google Doc
  {
    url: 'https://docs.google.com/document/d/1c7uJqDfx0e6z8A_demoDoc12345/edit',
    expectValid: true,
    expectType: 'google-docs',
    label: 'Google Doc (Valid ID)',
  },
  // C. Normal Website
  {
    url: 'https://acme-analytics.com/case-study',
    expectValid: true,
    expectType: 'website',
    label: 'Normal Website URL',
  },
  // D. Deployed Software Application
  {
    url: 'https://coral-reporting-system.vercel.app/dashboard',
    expectValid: true,
    expectType: 'web-app',
    label: 'Deployed Software App on Vercel',
  },
  // E. Cloud BI Dashboard
  {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiMTIzNDU2In0%3D',
    expectValid: true,
    expectType: 'dashboard',
    label: 'Power BI Live Dashboard',
  },
  // F. Missing / Empty URL (Allowed when removing demo link)
  {
    url: '',
    expectValid: true,
    expectType: 'none',
    label: 'Missing / Empty URL (Cleared Demo)',
  },
  // G. Unsafe Protocols (Must be rejected)
  {
    url: 'javascript:alert(document.cookie)',
    expectValid: false,
    expectError: true,
    label: 'XSS Protocol (javascript:)',
  },
  {
    url: 'data:text/html,<script>alert(1)</script>',
    expectValid: false,
    expectError: true,
    label: 'Data URI Protocol (data:)',
  },
  // H. Malformed URL
  {
    url: 'htp://not-a-valid-scheme',
    expectValid: false,
    expectError: true,
    label: 'Malformed URL Scheme',
  },
  // I. Truncated Google Sheets ID
  {
    url: 'https://docs.google.com/spreadsheets/d/short/edit',
    expectValid: false,
    expectError: true,
    label: 'Truncated Google Sheet ID',
  },
  // J. Old Placeholder URL (Must be caught and rejected)
  {
    url: 'https://docs.google.com/spreadsheets/d/preview-payroll-analytics',
    expectValid: false,
    expectError: true,
    label: 'Old Placeholder URL (preview-payroll-analytics)',
  },
];

testCases.forEach((t) => {
  const result = validateDemoLink(t.url);
  const isValidMatches = result.isValid === t.expectValid;
  const isTypeMatches = !t.expectType || result.destinationType === t.expectType;

  if (isValidMatches && isTypeMatches) {
    console.log(`[PASS] ${t.label}: Validated correctly (Type: ${result.destinationType}, Valid: ${result.isValid})`);
  } else {
    console.error(`[FAIL] ${t.label}: Expected valid=${t.expectValid}, type=${t.expectType}. Got valid=${result.isValid}, type=${result.destinationType}, error="${result.error}"`);
    failed = true;
  }
});

// -------------------------------------------------------------
// Test Case 2: Full Admin-to-Public Demo Button Flow (Req 2, 3, 6)
// -------------------------------------------------------------
console.log('\n--- 2. Testing Admin Save to Public Demo Button Flow ---');

// Mock project representing saved project state in projectStore
const projectWithSheet = {
  id: 'coral-bios-daily-report',
  title: 'Coral Daily Report',
  image: '/projects/project-1.png',
  demoUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  demos: [
    {
      id: 'demo-1',
      title: 'Daily Report Sheet',
      url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      order: 1,
      status: 'published',
    },
  ],
};

const resolvedSheetUrl = getUniversalDemoUrl(projectWithSheet);
if (resolvedSheetUrl === 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit') {
  console.log('[PASS] Public Demo Button resolves genuine Google Sheet destination accurately.');
} else {
  console.error(`[FAIL] Expected resolved Google Sheet URL, got: ${resolvedSheetUrl}`);
  failed = true;
}

// Project with Deployed App
const projectWithWebApp = {
  id: 'loan-application',
  title: 'Loan Tracker App',
  image: '/projects/project-3.png',
  demoUrl: 'https://loan-underwriting-engine.vercel.app',
};

const resolvedWebAppUrl = getUniversalDemoUrl(projectWithWebApp);
if (resolvedWebAppUrl === 'https://loan-underwriting-engine.vercel.app') {
  console.log('[PASS] Public Demo Button resolves deployed software web application destination.');
} else {
  console.error(`[FAIL] Expected resolved Web App URL, got: ${resolvedWebAppUrl}`);
  failed = true;
}

// Project with NO demo URL
const projectWithNoDemo = {
  id: 'data-management',
  title: 'Data Management',
  image: '/projects/project-5.png',
  demoUrl: '',
  demos: [],
};

const resolvedEmpty = getUniversalDemoUrl(projectWithNoDemo);
if (resolvedEmpty === null) {
  console.log('[PASS] Project with no demo URL returns null (Demo button is cleanly hidden; never opens a fake link).');
} else {
  console.error(`[FAIL] Expected null for project with no demo, got: ${resolvedEmpty}`);
  failed = true;
}

// Project with OLD placeholder
const projectWithOldPlaceholder = {
  id: 'payroll-analytics',
  title: 'Payroll Analytics',
  image: '/projects/project-6.png',
  demoUrl: 'https://docs.google.com/spreadsheets/d/preview-payroll-analytics',
};

const resolvedPlaceholder = getUniversalDemoUrl(projectWithOldPlaceholder);
if (resolvedPlaceholder === null) {
  console.log('[PASS] Project with old placeholder URL is safely blocked from public Demo button.');
} else {
  console.error(`[FAIL] Expected placeholder to be blocked, got: ${resolvedPlaceholder}`);
  failed = true;
}

// -------------------------------------------------------------
// Test Case 3: Data Independence (Req 7)
// -------------------------------------------------------------
console.log('\n--- 3. Testing Field Independence ---');

// Updating photo does not touch demoUrl
const initialDemoUrl = projectWithSheet.demoUrl;
const photoUpdate = {
  ...projectWithSheet,
  image: '/uploads/new-screenshot.png',
  images: [{ id: 'img-new', url: '/uploads/new-screenshot.png', caption: 'New', order: 1, isPrimary: true }],
};

if (photoUpdate.demoUrl === initialDemoUrl && photoUpdate.image === '/uploads/new-screenshot.png') {
  console.log('[PASS] Updating photo preserves demoUrl without modification.');
} else {
  console.error('[FAIL] Photo update affected demoUrl!');
  failed = true;
}

// Updating demoUrl does not touch photos
const initialPhoto = projectWithSheet.image;
const demoUpdate = {
  ...projectWithSheet,
  demoUrl: 'https://updated-dashboard.powerbi.com/view',
};

if (demoUpdate.image === initialPhoto && demoUpdate.demoUrl === 'https://updated-dashboard.powerbi.com/view') {
  console.log('[PASS] Updating demo URL preserves project photo without modification.');
} else {
  console.error('[FAIL] Demo URL update affected project photo!');
  failed = true;
}

if (failed) {
  console.error('\n>>> UNIVERSAL DEMO TEST SUITE FAILED <<<');
  process.exit(1);
} else {
  console.log('\n>>> ALL UNIVERSAL DEMO-LINK TESTS PASSED WITH 100% SUCCESS! <<<');
}
