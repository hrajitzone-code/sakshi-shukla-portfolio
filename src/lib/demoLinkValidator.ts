/**
 * Universal Project Demo Link Validator & Utility Engine
 * Supports Google Sheets, Google Docs, deployed software applications, dashboards, forms, and external websites.
 * Rejects unsafe protocols (javascript:, data:, vbscript:, file:) and catches placeholder links.
 */

export type DemoDestinationType =
  | 'google-sheets'
  | 'google-docs'
  | 'web-app'
  | 'dashboard'
  | 'form'
  | 'website'
  | 'none';

export interface DemoLinkValidationResult {
  isValid: boolean;
  cleanUrl: string;
  error?: string;
  warning?: string;
  destinationType: DemoDestinationType;
  isPlaceholder: boolean;
  label: string;
}

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Checks if a URL is a known fake placeholder link from previous seed data.
 */
export function isPlaceholderUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const url = rawUrl.trim().toLowerCase();
  if (url.includes('preview-') || url.includes('/demo-preview/') || url.includes('test-demo-sheet')) {
    return true;
  }
  return false;
}

/**
 * Universally validates and classifies any project demo URL.
 * Allows valid HTTP and HTTPS links.
 * Returns isValid = true with destinationType = 'none' if empty (allowing projects without demos).
 */
export function validateDemoLink(rawUrl?: string | null): DemoLinkValidationResult {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: true,
      cleanUrl: '',
      destinationType: 'none',
      isPlaceholder: false,
      label: 'No Demo Configured',
    };
  }

  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  // 1. Security Check: Reject dangerous or unsafe protocols
  for (const proto of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(proto)) {
      return {
        isValid: false,
        cleanUrl: '',
        error: `Unsafe link protocol rejected (${proto}). Only secure web links (http:// or https://) are allowed.`,
        destinationType: 'none',
        isPlaceholder: false,
        label: 'Unsafe Protocol',
      };
    }
  }

  // 2. Syntax Check: Parse as standard URL
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        isValid: false,
        cleanUrl: '',
        error: 'Demo URL must start with http:// or https://',
        destinationType: 'none',
        isPlaceholder: false,
        label: 'Invalid Protocol',
      };
    }
  } catch {
    return {
      isValid: false,
      cleanUrl: '',
      error: 'Invalid URL format. Please paste a complete web address (e.g. https://...).',
      destinationType: 'none',
      isPlaceholder: false,
      label: 'Malformed URL',
    };
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  // 3. Detect known dummy/placeholder links
  if (isPlaceholderUrl(trimmed)) {
    return {
      isValid: false,
      cleanUrl: trimmed,
      error: 'This is a sample placeholder URL. Please replace it with your genuine Google Sheet, live web app, or dashboard URL.',
      destinationType: 'website',
      isPlaceholder: true,
      label: 'Placeholder Link',
    };
  }

  // 4. Google Sheets Classification & Validation
  if (host.includes('docs.google.com') && path.includes('/spreadsheets')) {
    const match = path.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      return {
        isValid: false,
        cleanUrl: trimmed,
        error: 'Google Sheets link is missing the document ID. A valid link format is: https://docs.google.com/spreadsheets/d/SHEET_ID/edit',
        destinationType: 'google-sheets',
        isPlaceholder: false,
        label: 'Invalid Google Sheet',
      };
    }

    const sheetId = match[1];
    if (sheetId.length < 15) {
      return {
        isValid: false,
        cleanUrl: trimmed,
        error: `Google Sheets document ID ("${sheetId}") appears truncated or invalid.`,
        destinationType: 'google-sheets',
        isPlaceholder: false,
        label: 'Truncated Sheet ID',
      };
    }

    return {
      isValid: true,
      cleanUrl: trimmed,
      destinationType: 'google-sheets',
      isPlaceholder: false,
      label: 'Google Sheet',
    };
  }

  // 5. Google Docs Classification & Validation
  if (host.includes('docs.google.com') && path.includes('/document')) {
    const match = path.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      return {
        isValid: false,
        cleanUrl: trimmed,
        error: 'Google Docs link is missing the document ID.',
        destinationType: 'google-docs',
        isPlaceholder: false,
        label: 'Invalid Google Doc',
      };
    }

    return {
      isValid: true,
      cleanUrl: trimmed,
      destinationType: 'google-docs',
      isPlaceholder: false,
      label: 'Google Doc',
    };
  }

  // 6. BI Dashboards & Forms
  if (host.includes('powerbi.com') || host.includes('tableau.com') || host.includes('looker')) {
    return {
      isValid: true,
      cleanUrl: trimmed,
      destinationType: 'dashboard',
      isPlaceholder: false,
      label: 'BI Dashboard',
    };
  }

  if (host.includes('forms.gle') || host.includes('typeform.com') || host.includes('tally.so')) {
    return {
      isValid: true,
      cleanUrl: trimmed,
      destinationType: 'form',
      isPlaceholder: false,
      label: 'Online Form',
    };
  }

  // 7. Deployed Application Classification
  if (
    host.includes('vercel.app') ||
    host.includes('netlify.app') ||
    host.includes('render.com') ||
    host.includes('railway.app') ||
    host.includes('herokuapp.com') ||
    host.includes('github.io') ||
    host.startsWith('app.')
  ) {
    return {
      isValid: true,
      cleanUrl: trimmed,
      destinationType: 'web-app',
      isPlaceholder: false,
      label: 'Deployed Web App',
    };
  }

  // 8. General External Website / Live Project
  return {
    isValid: true,
    cleanUrl: trimmed,
    destinationType: 'website',
    isPlaceholder: false,
    label: 'Live Website',
  };
}

/**
 * Universal Resolver: extracts the active, genuine demo URL for a project.
 * Returns null if no genuine URL is configured (preventing any fake destinations).
 */
export function getUniversalDemoUrl(project?: any): string | null {
  if (!project) return null;

  // 1. Check top-level demoUrl
  if (project.demoUrl && typeof project.demoUrl === 'string') {
    const val = validateDemoLink(project.demoUrl);
    if (val.isValid && val.destinationType !== 'none' && !val.isPlaceholder) {
      return val.cleanUrl;
    }
  }

  // 2. Check primary published demo from demos array
  if (project.demos && Array.isArray(project.demos)) {
    for (const d of project.demos) {
      if (d && d.status === 'published' && d.url) {
        const val = validateDemoLink(d.url);
        if (val.isValid && val.destinationType !== 'none' && !val.isPlaceholder) {
          return val.cleanUrl;
        }
      }
    }
  }

  return null;
}
