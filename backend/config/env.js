// Validates required environment variables once at startup, so misconfiguration
// fails loudly and immediately instead of silently falling back to an insecure
// default (like a hardcoded JWT secret) that ships in the source code.

const REQUIRED = ["JWT_SECRET"];

function loadEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key] || process.env[key].trim() === "");
  if (missing.length) {
    console.error(
      `\n[startup] Missing required environment variable(s): ${missing.join(", ")}.\n` +
      `Set them in backend/.env before starting the server (see .env.example).\n`
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "[startup] WARNING: JWT_SECRET is shorter than 32 characters. " +
      "Use a longer, random value in production (e.g. `openssl rand -hex 32`)."
    );
  }
}

module.exports = { loadEnv };
