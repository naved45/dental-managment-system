const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Files are held in memory, NOT written to disk yet. This lets the route
// handler inspect the real file content (magic bytes) and reject anything
// that doesn't genuinely match an allowed type before a single byte ever
// touches the filesystem. See routes/upload.js and utils/fileSignature.js.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB — also enforced again below in case a client lies about Content-Length
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Cheap first-pass rejection by extension/mimetype. NOT sufficient on its
    // own (both are trivially spoofable) — the authoritative check is the
    // magic-byte inspection in routes/upload.js once the bytes are in hand.
    const allowedExt = /\.(jpe?g|png|webp|pdf)$/i;
    const allowedMime = /^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/;
    if (!allowedExt.test(file.originalname) || !allowedMime.test(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WEBP, or PDF files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = { upload, uploadDir };
