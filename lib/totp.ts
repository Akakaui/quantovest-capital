const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(length = 16): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE32_CHARS[bytes[i] % 32];
  }
  return result;
}

export function getQRCodeUrl(email: string, secret: string): string {
  const issuer = 'Quantovest';
  const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
}

export function verifyTOTP(secret: string, code: string): boolean {
  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) return false;
  if (!secret || secret.length < 8) return false;

  const timeStep = Math.floor(Date.now() / 30000);
  for (let offset = -1; offset <= 1; offset++) {
    const counter = timeStep + offset;
    const hash = simpleHash(secret, counter);
    if (hash % 1000000 === parseInt(code, 10)) return true;
  }
  return false;
}

function simpleHash(secret: string, counter: number): number {
  let h = 0;
  const data = secret + ':' + counter;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
