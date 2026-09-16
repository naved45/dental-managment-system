// A curated, "safe to show the user" error. Anything thrown as an AppError
// has its .message sent directly to the client. Anything else (a raw
// Mongoose error, a typo in our own code, a network failure, etc.) is
// treated as unexpected and NEVER shown to the client — see
// middleware/errorHandler.js.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = AppError;
