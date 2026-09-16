const router = require("express").Router();
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { upload, uploadDir } = require("../config/upload");
const auth = require("../middleware/auth");
const { authedLimiter } = require("../middleware/rateLimiters");
const { detectRealFileType, EXTENSION_FOR } = require("../utils/fileSignature");
const AppError = require("../utils/AppError");

router.use(auth, authedLimiter);

// Single-file upload endpoint (X-ray images, documents). Security model:
//   1. multer buffers the file in memory only — nothing touches disk yet.
//   2. We inspect the file's actual binary signature (magic bytes), NOT the
//      client-supplied filename or Content-Type — both are trivially spoofed.
//   3. Only if the real content matches an allowed type do we write it to
//      disk, under a fully random filename with an extension WE choose based
//      on the detected type (never the client's original extension/name).
//      This makes path traversal and extension/content mismatch impossible.
//   4. Files are served back only via express.static from an isolated
//      uploads/ folder that is never treated as executable by the server —
//      see server.js for the "X-Content-Type-Options: nosniff" header added
//      there, which stops browsers from executing mismatched content types.
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);

  const realType = detectRealFileType(req.file.buffer);
  if (!realType) {
    throw new AppError("This file's content doesn't match an allowed type (JPEG, PNG, WEBP, or PDF)", 400);
  }

  const safeName = crypto.randomBytes(24).toString("hex") + EXTENSION_FOR[realType];
  const destPath = path.join(uploadDir, safeName);
  await fs.writeFile(destPath, req.file.buffer);

  res.json({ url: `/uploads/${safeName}`, filename: req.file.originalname });
});

module.exports = router;
