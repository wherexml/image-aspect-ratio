const TINY_FALLBACK_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function fallbackPngFile(name: string): File {
  const bin = atob(TINY_FALLBACK_PNG_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: "image/png" });
}

/**
 * Loads a real, high-clarity editorial photograph from `/samples/` in the browser,
 * with a deterministic in-memory PNG fallback for offline JSDOM unit tests.
 */
export async function loadSamplePhotoFile(
  variant: "landscape" | "vertical" = "landscape",
): Promise<File> {
  const filename =
    variant === "vertical" ? "creator-latte-9x16.jpg" : "green-grassland.jpg";
  if (typeof window === "undefined" || typeof fetch !== "function") {
    return fallbackPngFile(filename);
  }
  try {
    const res = await fetch(`/samples/${filename}`);
    if (!res.ok) throw new Error("fetch");
    const blob = await res.blob();
    if (!blob.size) throw new Error("empty");
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  } catch {
    return fallbackPngFile(filename);
  }
}
