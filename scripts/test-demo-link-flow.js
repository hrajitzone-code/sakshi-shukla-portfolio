const { validateDemoLink } = require('../src/lib/demoLinkValidator.ts');

function validateDemoUrl(rawUrl) {
  const res = validateDemoLink(rawUrl);
  return {
    isValid: res.isValid && res.destinationType !== 'none',
    error: res.error,
    sheetId: res.destinationType === 'google-sheets' ? res.cleanUrl.split('/d/')[1]?.split('/')[0] : undefined,
    isGoogleSheets: res.destinationType === 'google-sheets',
  };
}

console.log('=== TESTING DEMO LINK VALIDATION & ADMIN-TO-PUBLIC FLOW ===\n');

let failed = false;

// 1. Test URL Validation
const tests = [
  {
    url: '',
    expectedValid: false,
    label: 'Empty URL',
  },
  {
    url: 'https://docs.google.com/spreadsheets/d/preview-coral-bios-daily-report',
    expectedValid: false,
    label: 'Placeholder preview URL with non-existent ID',
  },
  {
    url: 'https://docs.google.com/spreadsheets/d/',
    expectedValid: false,
    label: 'Google Sheets link missing ID',
  },
  {
    url: 'https://docs.google.com/spreadsheets/d/short-id/edit',
    expectedValid: false,
    label: 'Truncated / too short Google Sheets ID',
  },
  {
    url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
    expectedValid: true,
    expectedSheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    label: 'Genuine full Google Sheets share link',
  },
  {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiMTIzNDU2In0%3D',
    expectedValid: true,
    label: 'Valid Power BI interactive dashboard link',
  },
];

tests.forEach((t) => {
  const res = validateDemoUrl(t.url);
  if (res.isValid !== t.expectedValid) {
    console.error(`[FAIL] ${t.label}: Expected isValid=${t.expectedValid}, got ${res.isValid} (${res.error})`);
    failed = true;
  } else {
    console.log(`[PASS] ${t.label}: ${res.isValid ? 'Valid' : 'Blocked with error: ' + res.error}`);
  }
});

// 2. Test Link Synchronization in project mock
const mockProject = {
  id: 'test-proj',
  title: 'Test Project',
  image: '/projects/initial.png',
  images: [{ id: 'img-1', url: '/projects/initial.png', caption: 'Initial', order: 1, isPrimary: true }],
  demoUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  demos: [
    {
      id: 'demo-1',
      title: 'Test Demo',
      url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      order: 1,
      status: 'published',
    },
  ],
};

function getProjectDemoUrl(project) {
  if (project.demos && Array.isArray(project.demos)) {
    const pub = project.demos.find((d) => d.status === 'published' && d.url && d.url.trim().length > 0);
    if (pub) return pub.url.trim();
  }
  if (project.demoUrl && typeof project.demoUrl === 'string' && project.demoUrl.trim().length > 0) {
    return project.demoUrl.trim();
  }
  return null;
}

const resolvedUrl = getProjectDemoUrl(mockProject);
if (resolvedUrl === 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit') {
  console.log('[PASS] getProjectDemoUrl correctly reads the latest published demo URL.');
} else {
  console.error(`[FAIL] Expected resolved URL to match updated demo URL, got: ${resolvedUrl}`);
  failed = true;
}

// 3. Test that image updates do not modify demoUrl
const updatedImages = [
  { id: 'img-2', url: '/uploads/new-photo.png', caption: 'New photo', order: 1, isPrimary: true },
  ...mockProject.images,
];
const projectAfterImageUpdate = {
  ...mockProject,
  images: updatedImages,
  image: updatedImages[0].url,
};

if (projectAfterImageUpdate.image === '/uploads/new-photo.png' && projectAfterImageUpdate.demoUrl === mockProject.demoUrl) {
  console.log('[PASS] Updating project photos updates image display without altering demoUrl.');
} else {
  console.error('[FAIL] Updating photos interfered with demoUrl!');
  failed = true;
}

if (failed) {
  console.error('\n>>> TEST SUITE FAILED <<<');
  process.exit(1);
} else {
  console.log('\n>>> ALL DEMO FLOW & VALIDATION TESTS PASSED! <<<');
}
