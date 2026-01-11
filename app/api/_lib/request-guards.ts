function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0]?.trim();
  if (first) return first;
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function utf8ByteLength(input: string) {
  return new TextEncoder().encode(input).byteLength;
}

export async function readJsonWithLimit<T>(req: Request, opts: { maxBytes: number }) {
  const contentLengthRaw = req.headers.get("content-length");
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : null;
  if (contentLength != null && Number.isFinite(contentLength) && contentLength > opts.maxBytes) {
    return { ok: false as const, status: 413 as const, error: "Payload too large." };
  }

  const text = await req.text();
  if (utf8ByteLength(text) > opts.maxBytes) {
    return { ok: false as const, status: 413 as const, error: "Payload too large." };
  }

  try {
    const parsed = JSON.parse(text) as T;
    return { ok: true as const, value: parsed };
  } catch {
    return { ok: false as const, status: 400 as const, error: "Invalid JSON payload." };
  }
}

type FixedWindowState = { count: number; resetAtMs: number };
const fixedWindowByKey = new Map<string, FixedWindowState>();
const MAX_KEYS = 5000;

export function enforceRateLimit(req: Request, opts: { keyPrefix: string; limit: number; windowMs: number }) {
  const ip = getClientIp(req);
  const key = `${opts.keyPrefix}:${ip}`;
  const now = Date.now();

  const current = fixedWindowByKey.get(key);
  if (!current || now >= current.resetAtMs) {
    fixedWindowByKey.set(key, { count: 1, resetAtMs: now + opts.windowMs });
    return { ok: true as const };
  }

  if (current.count >= opts.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAtMs - now) / 1000));
    return { ok: false as const, status: 429 as const, error: "Rate limit exceeded.", retryAfterSec };
  }

  current.count += 1;

  if (fixedWindowByKey.size > MAX_KEYS) {
    for (const [k, state] of fixedWindowByKey) {
      if (now >= state.resetAtMs) fixedWindowByKey.delete(k);
      if (fixedWindowByKey.size <= MAX_KEYS) break;
    }
  }

  return { ok: true as const };
}

