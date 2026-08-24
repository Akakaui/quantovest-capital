export const uploadPurposes = ['avatar', 'trader', 'deposit-proof', 'deposit-qr', 'kyc'] as const;
export type UploadPurpose = typeof uploadPurposes[number];
export function isUploadPurpose(value: FormDataEntryValue | null): value is UploadPurpose { return typeof value === 'string' && (uploadPurposes as readonly string[]).includes(value); }
