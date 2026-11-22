import { useEffect, useState } from "react";

export function useImageCopySupported(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(window.isSecureContext && typeof navigator.clipboard?.write === "function" && typeof ClipboardItem !== "undefined");
  }, []);
  return supported;
}

export async function copyTextSafe(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback (works on HTTP LAN origins such as 10.0.0.x)
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export async function copyPngBlobSafe(
  createBlob: () => Promise<Blob>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof window === "undefined") {
    return { ok: false, message: "Image copy is not available here. Use Download to save the file." };
  }
  if (!window.isSecureContext) {
    return {
      ok: false,
      message:
        "Browsers only allow copying images over HTTPS or localhost (blocked on HTTP LAN IPs). Tap Download to save the image.",
    };
  }
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return {
      ok: false,
      message: "Your browser does not support copying PNG images directly. Use Download to save the image.",
    };
  }
  try {
    // Pass Promise<Blob> directly to ClipboardItem so Safari/WebKit preserves user-gesture activation
    const item = new ClipboardItem({ "image/png": createBlob() });
    await navigator.clipboard.write([item]);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Clipboard permission was blocked by the browser. Use Download to save the image.",
    };
  }
}
