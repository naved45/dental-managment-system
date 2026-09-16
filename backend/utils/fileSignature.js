// Validates a file's REAL type by inspecting its binary "magic number" —
// the first few bytes of the file — rather than trusting the client-supplied
// filename extension or Content-Type header, both of which are trivial for
// an attacker to fake (e.g. renaming malware.exe to photo.jpg).
//
// Deliberately implemented in-house (no external dependency) for exactly
// the 4 file types this app accepts, so the check is small enough to audit
// by eye rather than trusting a third-party package's correctness.

function matches(buffer, signature, offset = 0) {
  if (buffer.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[offset + i] !== signature[i]) return false;
  }
  return true;
}

// Returns 'jpeg' | 'png' | 'webp' | 'pdf' | null (null = unrecognized/not allowed)
function detectRealFileType(buffer) {
  if (matches(buffer, [0xff, 0xd8, 0xff])) return "jpeg";
  if (matches(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (matches(buffer, [0x52, 0x49, 0x46, 0x46]) && matches(buffer, [0x57, 0x45, 0x42, 0x50], 8)) return "webp"; // "RIFF"...."WEBP"
  if (matches(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf"; // "%PDF-"
  return null;
}

const EXTENSION_FOR = { jpeg: ".jpg", png: ".png", webp: ".webp", pdf: ".pdf" };

module.exports = { detectRealFileType, EXTENSION_FOR };
