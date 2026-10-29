/**
 * Backwards-compatibility wrapper for demoLinkValidator
 */
import { validateDemoLink } from './demoLinkValidator';
import type { DemoLinkValidationResult } from './demoLinkValidator';

export interface DemoUrlValidationResult {
  isValid: boolean;
  error?: string;
  sheetId?: string;
  isGoogleSheets: boolean;
}

export function validateDemoUrl(rawUrl: string): DemoUrlValidationResult {
  const res: DemoLinkValidationResult = validateDemoLink(rawUrl);
  return {
    isValid: res.isValid && res.destinationType !== 'none',
    error: res.error,
    sheetId: res.destinationType === 'google-sheets' ? res.cleanUrl.split('/d/')[1]?.split('/')[0] : undefined,
    isGoogleSheets: res.destinationType === 'google-sheets',
  };
}
