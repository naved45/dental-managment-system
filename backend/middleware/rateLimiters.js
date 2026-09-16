const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// All thresholds are configurable via environment variables so they can be
// tuned per-deployment without touching code. Sensible defaults are provided.
const env = (key, fallback) => {
  const v = process.env[key];
  return v !== undefined && v !== "" ? Number(v) : fallback;
};

const jsonHandler = (req, res) => {
  res.status(429).json({
    message: "Too many requests. Please slow down and try again shortly.",
    retryAfter: res.getHeader("Retry-After"),
  });
};

// --- Strict: authentication routes (login, register, password change, resend-verification) ---
function authKey(req) {
  const email = (req.body?.email || "").toLowerCase().trim();
  const ipPart = ipKeyGenerator(req.ip); // IPv6-safe (collapses to a /64 subnet instead of the raw address)
  return email ? `${ipPart}:${email}` : ipPart;
}

const authLimiter = rateLimit({
  windowMs: env("RATE_LIMIT_AUTH_WINDOW_MS", 15 * 60 * 1000),
  max: env("RATE_LIMIT_AUTH_MAX", 5),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authKey,
  handler: jsonHandler,
});

// --- Moderate: general public/browsing endpoints ---
const publicLimiter = rateLimit({
  windowMs: env("RATE_LIMIT_PUBLIC_WINDOW_MS", 15 * 60 * 1000),
  max: env("RATE_LIMIT_PUBLIC_MAX", 300),
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
});

// --- Loose: authenticated user actions ---
const authedLimiter = rateLimit({
  windowMs: env("RATE_LIMIT_AUTHED_WINDOW_MS", 15 * 60 * 1000),
  max: env("RATE_LIMIT_AUTHED_MAX", 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  handler: jsonHandler,
});

// --- Exponential backoff on repeated auth FAILURES (not just request count) ---
const failureStore = new Map();
const BACKOFF_BASE_SECONDS = env("RATE_LIMIT_BACKOFF_BASE_SECONDS", 11);
const BACKOFF_MAX_SECONDS = env("RATE_LIMIT_BACKOFF_MAX_SECONDS", 15 * 60);
const BACKOFF_RESET_MS = env("RATE_LIMIT_BACKOFF_RESET_MS", 60 * 60 * 1000);

function backoffKey(req) {
  if (req.user?.id) return `user:${req.user.id}`;
  const email = (req.body?.email || "").toLowerCase().trim();
  return `${req.ip}:${email || "unknown"}`;
}

function checkBackoff(req, res, next) {
  const key = backoffKey(req);
  const entry = failureStore.get(key);
  if (entry && entry.blockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((entry.blockedUntil - Date.now()) / 1000);
    res.set("Retry-After", String(waitSeconds));
    return res.status(429).json({
      message: `Too many failed attempts. Please try again in ${waitSeconds} second(s).`,
      retryAfter: waitSeconds,
    });
  }
  next();
}

function recordFailure(req) {
  const key = backoffKey(req);
  const now = Date.now();
  const entry = failureStore.get(key) || { count: 0, lastFailure: 0 };
  if (now - entry.lastFailure > BACKOFF_RESET_MS) entry.count = 0;
  entry.count += 1;
  entry.lastFailure = now;
  const waitSeconds = Math.min(BACKOFF_BASE_SECONDS * 2 ** (entry.count - 1), BACKOFF_MAX_SECONDS);
  entry.blockedUntil = now + waitSeconds * 1000;
  failureStore.set(key, entry);
}

function clearFailures(req) {
  failureStore.delete(backoffKey(req));
}

module.exports = { authLimiter, publicLimiter, authedLimiter, checkBackoff, recordFailure, clearFailures };
