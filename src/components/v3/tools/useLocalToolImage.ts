"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ERR_BYTES, ERR_PIXELS, ERR_READ, isCandidateType } from "@/lib/image-input";
import { loadSamplePhotoFile } from "@/lib/sample-photo";
import { INPUT_MAX_BYTES, INPUT_MAX_PIXELS } from "@/lib/square";
import { consumeV2PendingImage } from "@/lib/v2-image-handoff";

export type LocalToolImage = {
  img: HTMLImageElement;
  url: string;
  name: string;
  width: number;
  height: number;
  byteSize: number;
  mimeType: string;
};

export function useLocalToolImage(onLoadedReset?: (img: LocalToolImage) => void) {
  const [loaded, setLoaded] = useState<LocalToolImage | null>(null);
  const [reading, setReading] = useState(false);
  const [inputError, setInputError] = useState("");
  const generationRef = useRef(0);
  const urlsRef = useRef(new Set<string>());
  const onResetRef = useRef(onLoadedReset);
  onResetRef.current = onLoadedReset;

  useEffect(() => {
    return () => {
      generationRef.current++;
      urlsRef.current.forEach(u => URL.revokeObjectURL(u));
      urlsRef.current.clear();
    };
  }, []);

  const readFile = useCallback(async (file?: File | null) => {
    if (!file) return;
    const id = ++generationRef.current;
    setInputError("");
    if (!isCandidateType(file.type)) {
      setInputError(ERR_READ);
      return;
    }
    if (file.size > INPUT_MAX_BYTES) {
      setInputError(ERR_BYTES);
      return;
    }
    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    setReading(true);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      if (id !== generationRef.current) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(url);
        return;
      }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error("decode");
      if (img.naturalWidth * img.naturalHeight > INPUT_MAX_PIXELS) throw new Error("pixels");
      const next: LocalToolImage = {
        img,
        url,
        name: file.name || "pasted-image.png",
        width: img.naturalWidth,
        height: img.naturalHeight,
        byteSize: file.size,
        mimeType: file.type || "image/png",
      };
      setLoaded(prev => {
        if (prev) {
          URL.revokeObjectURL(prev.url);
          urlsRef.current.delete(prev.url);
        }
        return next;
      });
      onResetRef.current?.(next);
    } catch (err) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
      if (id === generationRef.current) {
        setInputError(err instanceof Error && err.message === "pixels" ? ERR_PIXELS : ERR_READ);
      }
    } finally {
      if (id === generationRef.current) setReading(false);
    }
  }, []);

  const readRef = useRef(readFile);
  readRef.current = readFile;

  useEffect(() => {
    const pending = consumeV2PendingImage();
    if (pending) void readRef.current(pending);
  }, []);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || Boolean(target.closest("input, textarea, select, [contenteditable]")))
      ) {
        return;
      }
      const data = event.clipboardData;
      if (!data) return;
      let file: File | null = Array.from(data.files).find(f => isCandidateType(f.type)) ?? null;
      if (!file) {
        for (const item of Array.from(data.items)) {
          if (item.kind === "file" && isCandidateType(item.type)) {
            file = item.getAsFile();
            if (file) break;
          }
        }
      }
      if (!file) return;
      event.preventDefault();
      void readRef.current(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const clearImage = useCallback(() => {
    generationRef.current++;
    setLoaded(prev => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
        urlsRef.current.delete(prev.url);
      }
      return null;
    });
    setInputError("");
  }, []);

  return { loaded, reading, inputError, setInputError, readFile, clearImage };
}

async function decodeFileToImage(file: File): Promise<HTMLImageElement | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function createSyntheticSampleFile(
  kind: "vertical-9x16" | "og-1200x630" | "carousel-panorama" | "photo-4x3",
): Promise<File> {
  if (kind === "photo-4x3") {
    return loadSamplePhotoFile("landscape");
  }

  if (kind === "vertical-9x16") {
    const baseFile = await loadSamplePhotoFile("vertical");
    const baseImg = await decodeFileToImage(baseFile);
    if (!baseImg || typeof document === "undefined") return baseFile;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.drawImage !== "function") return baseFile;

    ctx.drawImage(baseImg, 0, 0, 1080, 1920);

    // 1. Crisp creator title placed safely inside the central Safe Zone!
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.beginPath();
    ctx.roundRect(148, 340, 784, 152, 24);
    ctx.fill();
    ctx.fillStyle = "#FDE047";
    ctx.textAlign = "center";
    ctx.font = "800 44px system-ui, -apple-system, sans-serif";
    ctx.fillText("MORNING LATTE ROUTINE", 540, 405);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("✓ Title inside safe box stays 100% visible", 540, 460);

    // 2. Realistic burned-in video subtitle placed TOO LOW (so user immediately sees the app caption collision!)
    ctx.fillStyle = "rgba(220, 38, 38, 0.9)";
    ctx.beginPath();
    ctx.roundRect(110, 1545, 860, 78, 16);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 30px system-ui, -apple-system, sans-serif";
    ctx.fillText("✗ Subtitle placed down here gets blocked by captions!", 540, 1594);
    ctx.restore();

    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/jpeg", 0.88));
    canvas.width = 0;
    canvas.height = 0;
    return blob
      ? new File([blob], "creator-latte-vlog-9x16.jpg", { type: "image/jpeg" })
      : baseFile;
  }

  if (kind === "carousel-panorama") {
    const baseFile = await loadSamplePhotoFile("landscape");
    const baseImg = await decodeFileToImage(baseFile);
    if (!baseImg || typeof document === "undefined") return baseFile;

    const canvas = document.createElement("canvas");
    canvas.width = 3240;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.drawImage !== "function") return baseFile;

    // Center-crop the sunlit rolling green grassland photograph across the wide 3-slide panoramic frame
    const srcR = baseImg.naturalWidth / baseImg.naturalHeight;
    const dstR = 3240 / 1350;
    let sw = baseImg.naturalWidth;
    let sh = baseImg.naturalHeight;
    if (srcR > dstR) {
      sw = sh * dstR;
    } else {
      sh = sw / dstR;
    }
    const sx = (baseImg.naturalWidth - sw) / 2;
    const sy = (baseImg.naturalHeight - sh) / 2;
    ctx.drawImage(baseImg, sx, sy, sw, sh, 0, 0, 3240, 1350);

    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/jpeg", 0.86));
    canvas.width = 0;
    canvas.height = 0;
    return blob
      ? new File([blob], "green-grassland-panorama-3240x1350.jpg", { type: "image/jpeg" })
      : baseFile;
  }

  // og-1200x630: Editorial nature/field OG card built from the sunlit green grassland photograph
  const baseFile = await loadSamplePhotoFile("landscape");
  const baseImg = await decodeFileToImage(baseFile);
  if (!baseImg || typeof document === "undefined") return baseFile;

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx || typeof ctx.drawImage !== "function") return baseFile;

  const sw = baseImg.naturalWidth;
  const sh = sw / (1200 / 630);
  const sy = (baseImg.naturalHeight - sh) / 2;
  ctx.drawImage(baseImg, 0, sy, sw, sh, 0, 0, 1200, 630);

  // Subtle dark gradient scrim for crisp centered headline legibility
  const scrim = ctx.createLinearGradient(0, 140, 0, 630);
  scrim.addColorStop(0, "rgba(9, 9, 11, 0.12)");
  scrim.addColorStop(1, "rgba(9, 9, 11, 0.76)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, 1200, 630);

  // Centered safe headline (stays inside 630×630 for WhatsApp 1:1!)
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.textAlign = "center";
  ctx.font = "700 22px ui-monospace, monospace";
  ctx.fillText("SUMMER FIELD GUIDE · 2026", 600, 265);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 58px system-ui, -apple-system, sans-serif";
  ctx.fillText("Rolling Green Meadows", 600, 338);
  ctx.fillStyle = "#A7F3D0";
  ctx.font = "600 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("Open Pastures & Highland Trails", 600, 392);

  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/png"));
  canvas.width = 0;
  canvas.height = 0;
  return blob
    ? new File([blob], "green-meadow-og-card-1200x630.png", { type: "image/png" })
    : baseFile;
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
