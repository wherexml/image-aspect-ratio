// Shared local-image input guards for /make-image-square and /change-image-aspect-ratio.
// Reviewed product copy (reports/2026-11-07/task9-development/copy-reviewed.md); keep verbatim.
export const ERR_BYTES = "Choose an image under 20 MB.";
export const ERR_PIXELS = "Choose an image with no more than 50 million pixels.";
export const ERR_READ = "This browser could not read this image. Choose another file.";
export const ERR_DOWNLOAD = "The image could not be downloaded. Try again.";

/** Accepts image/*, empty and octet-stream types; decoding is the real check. */
export const isCandidateType = (type: string) => { const t = type.toLowerCase(); return !t || t.startsWith("image/") || t === "application/octet-stream"; };
