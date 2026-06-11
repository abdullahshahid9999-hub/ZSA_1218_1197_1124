// lib/utils/rateLimit.ts

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store: Record<string, RateLimitEntry> = {};

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, max: 5 }
): RateLimitResult {
  const now = Date.now();
  const entry = store[key];

  if (!entry || entry.resetAt < now) {
    store[key] = { count: 1, resetAt: now + options.windowMs };
    return { allowed: true, remaining: options.max - 1, resetAt: store[key].resetAt };
  }

  if (entry.count >= options.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.max - entry.count, resetAt: entry.resetAt };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetAt < now) delete store[key];
    });
  }, 5 * 60 * 1000);
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });
    const data = await res.json();
    return data.success === true && (data.score ?? 1) >= 0.5;
  } catch {
    return false;
  }
}
