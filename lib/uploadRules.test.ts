import { describe, expect, it } from 'vitest';
import { isUploadPurpose } from './uploadRules';

describe('upload purpose validation', () => {
  it('allows every supported investor/admin upload flow', () => {
    expect(isUploadPurpose('avatar')).toBe(true);
    expect(isUploadPurpose('trader')).toBe(true);
    expect(isUploadPurpose('deposit-proof')).toBe(true);
    expect(isUploadPurpose('kyc')).toBe(true);
  });

  it('rejects arbitrary storage paths', () => {
    expect(isUploadPurpose('invoice')).toBe(false);
    expect(isUploadPurpose(null)).toBe(false);
  });
});
