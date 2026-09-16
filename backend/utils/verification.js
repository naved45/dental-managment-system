const crypto = require("crypto");

// Generates a random verification token + a 24h expiry timestamp.
// Used for both staff and patient email verification.
function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expires };
}

module.exports = { generateVerificationToken };
