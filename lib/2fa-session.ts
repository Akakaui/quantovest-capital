const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function signature(payload: string) {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('2FA session signing secret is not configured');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return { key, bytes: new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))) };
}

export async function createTwoFactorToken(userId: string, ttlSeconds = 3600) {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + ttlSeconds}`;
  const { bytes } = await signature(payload);
  return `${payload}.${toBase64Url(bytes)}`;
}

export async function verifyTwoFactorToken(token: string | undefined, userId: string) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== userId) return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const { key } = await signature(payload);
  return crypto.subtle.verify('HMAC', key, fromBase64Url(parts[2]), encoder.encode(payload));
}
