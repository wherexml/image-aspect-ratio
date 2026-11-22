import { useToolTracking } from "@/lib/tool-analytics";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, ImagePlus } from "lucide-react";
import { approxNumber, parsePositive, simplifyRatio } from "@/lib/ratio";

// uploadOnly: dimensions come only from a successfully loaded image; no manual source fields.
type Props = { kind: "image" | "video"; width?: string; height?: string; onDimensions?: (w: string, h: string) => void; uploadOnly?: boolean };
type Loaded = { url: string; name: string; width: number; height: number };

export function MediaPreview({ kind, width: manualWidth = "", height: manualHeight = "", onDimensions, uploadOnly = false }: Props) {
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const copyGeneration = useRef(0);
  const ratioText = useRef<HTMLParagraphElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  const urls = useRef(new Set<string>());
  const fileInput = useRef<HTMLInputElement>(null);
  const width = uploadOnly ? (loaded ? String(loaded.width) : "") : manualWidth;
  const height = uploadOnly ? (loaded ? String(loaded.height) : "") : manualHeight;
  const pw = parsePositive(width), ph = parsePositive(height);
  const ratio = pw.ok && ph.ok ? approxNumber(pw.value) / approxNumber(ph.value) : null;
  const image = loaded && Number(width) === loaded.width && Number(height) === loaded.height ? loaded : null;

  const exactRatio = pw.ok && ph.ok ? simplifyRatio(pw.value, ph.value).join(":") : "";
  const canCopy = !!exactRatio && !busy && !error;
  const tracking = useToolTracking(kind, "ratio", canCopy ? `${width.trim()}:${height.trim()}` : null);
  useEffect(() => {
    copyGeneration.current++;
    setCopyState("idle");
    return () => { copyGeneration.current++; clearTimeout(copyTimer.current); };
  }, [width, height, busy, error, loaded]);

  async function copyRatio() {
    if (!canCopy) return;
    const id = ++copyGeneration.current;
    clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(exactRatio);
      if (id !== copyGeneration.current) return;
      tracking.copy(exactRatio);
      setCopyState("ok");
      copyTimer.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      if (id === copyGeneration.current) {
        setCopyState("fail");
        if (uploadOnly && ratioText.current) {
          const range = document.createRange();
          range.selectNodeContents(ratioText.current);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  }
  function editDimensions(w: string, h: string) {
    tracking.changed();
    setError("");
    onDimensions?.(w, h);
  }

  useEffect(() => () => {
    generation.current++;
    urls.current.forEach(url => URL.revokeObjectURL(url));
    urls.current.clear();
  }, []);
  useEffect(() => () => { if (loaded) { URL.revokeObjectURL(loaded.url); urls.current.delete(loaded.url); } }, [loaded]);

  // Picker, drop and paste share this path: type pre-check, size limits, decode and the generation guard.
  async function readFile(file?: File | null) {
    if (!file) return;
    tracking.cancel();
    const id = ++generation.current;
    setError(""); setLoaded(null); setBusy(false);
    // Any image/* type, or an empty/generic type (clipboard items), goes on to browser decoding.
    const type = file.type.toLowerCase();
    if (type && !type.startsWith("image/") && type !== "application/octet-stream") {
      setError("Choose an image file, such as JPG, PNG, or WebP."); return;
    }
    if (file.size > 20 * 1024 * 1024) { setError("Choose an image smaller than 20 MB."); return; }
    const url = URL.createObjectURL(file); urls.current.add(url); setBusy(true);
    try {
      // Decoded through <img> only: SVG scripts and external resources never run, markup is never inlined.
      const img = new Image(); img.src = url;
      await img.decode();
      if (id !== generation.current) { URL.revokeObjectURL(url); urls.current.delete(url); return; }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error("decode");
      if (img.naturalWidth * img.naturalHeight > 50_000_000) throw new Error("size");
      if (!uploadOnly) onDimensions?.(String(img.naturalWidth), String(img.naturalHeight));
      setLoaded({url, name:file.name || "Pasted image", width:img.naturalWidth, height:img.naturalHeight});
      tracking.imageRead(JSON.stringify([file.name, file.size, file.lastModified, file.type]));
    } catch (e) {
      URL.revokeObjectURL(url); urls.current.delete(url);
      if (id === generation.current) setError(e instanceof Error && e.message === "size" ? "Choose an image up to 50 megapixels." : "This image could not be read. Try another file.");
    } finally { if (id === generation.current) setBusy(false); }
  }

  // Native Cmd+V / Ctrl+V: only clipboard image files are taken; text and editable targets are left alone.
  const readRef = useRef(readFile);
  readRef.current = readFile;
  useEffect(() => {
    if (kind !== "image") return;
    const onPaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable]"))) return;
      const data = event.clipboardData;
      if (!data) return;
      // Same candidate types readFile accepts: image/*, empty, or generic octet-stream; decode decides.
      const candidate = (type: string) => { const t = type.toLowerCase(); return !t || t.startsWith("image/") || t === "application/octet-stream"; };
      let file: File | null = Array.from(data.files).find(f => candidate(f.type)) ?? null;
      if (!file) for (const item of Array.from(data.items)) {
        if (item.kind === "file" && candidate(item.type)) { file = item.getAsFile(); if (file) break; }
      }
      if (!file) return;
      event.preventDefault();
      void readRef.current(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [kind]);

  const frames: [number, number, string][] = kind === "image"
    ? [[1,1,"Square"],[4,5,"Portrait post"],[9,16,"Story"],[16,9,"Widescreen"]]
    : [[16,9,"Widescreen display"],[9,16,"Vertical phone"]];

  const fitting = <div role="radiogroup" aria-label="Frame fitting" className="seg">
    <button role="radio" aria-checked={fit === "contain"} onClick={() => setFit("contain")}>Fit · keep all</button>
    <button role="radio" aria-checked={fit === "cover"} onClick={() => setFit("cover")}>Fill · crop</button>
  </div>;

  const status = <>
    {busy && <p role="status" className="mt-2 text-sm">Reading image…</p>}
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    {loaded && <div className="mp-upload-file mt-3 flex flex-wrap items-center gap-3 text-sm"><span className="break-all">{loaded.name} · {loaded.width} × {loaded.height}</span><button type="button" className="underline" onClick={() => {tracking.cancel(); generation.current++; setLoaded(null); setBusy(false); if (!uploadOnly) onDimensions?.("", "");}}>Remove image</button></div>}
  </>;

  return <section aria-labelledby="media-heading" className="mt-10 space-y-5">
    {uploadOnly ? <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="media-heading" className="font-display text-2xl font-bold">{kind === "image" ? "Check image ratio" : "Video screen simulator"}</h2>
      {fitting}
    </div> : <h2 id="media-heading" className="font-display text-2xl font-bold">{kind === "image" ? "Check image ratio" : "Video screen simulator"}</h2>}
    {kind === "image" && <div className={`mp-drop ${uploadOnly ? "mp-drop--upload" : ""}`} onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); void readFile(e.dataTransfer.files[0]);}}>
      {uploadOnly ? <div className="mp-upload-target">
        <p className="mp-upload-prompt">Drop or paste an image here, or</p>
        {/* Visually hidden native input; the button is the single keyboard/pointer trigger. */}
        <input ref={fileInput} id="image-file" type="file" accept="image/*" tabIndex={-1} aria-hidden="true" className="sr-only" onChange={e => {void readFile(e.target.files?.[0]); e.target.value = "";}} />
        <button type="button" className="mp-upload-button" onClick={() => fileInput.current?.click()}>
          <ImagePlus aria-hidden="true" className="h-4 w-4" />Choose image
        </button>
        {status}
      </div> : (() => {
        const prompt = "Drop an image here, or choose a file";
        const input = <input id="image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-card file:px-3 file:py-2" onChange={e => {void readFile(e.target.files?.[0]); e.target.value = "";}} />;
        const hint = <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WebP, GIF or AVIF · read locally · up to 20 MB / 50 MP.</p>;
        return <><label className="block text-sm font-semibold" htmlFor="image-file">{prompt}</label>{input}{hint}</>;
      })()}
      {!uploadOnly && status}
      {loaded && !image && <p className="mt-2 text-xs text-muted-foreground">Dimensions changed. The frames below use a diagram instead of your image.</p>}
    </div>}
    <>
    <div className={uploadOnly ? "grid grid-cols-2 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" : "flex flex-wrap items-start gap-x-4 gap-y-3"} role="group" aria-label="Source dimensions">
      <label className={uploadOnly ? "min-w-0 text-sm" : "w-28 shrink-0 text-sm sm:w-32"}>Width (px)<input className={`field mt-2 w-full ${uploadOnly ? "mp-readout-field" : ""}`} inputMode="decimal" value={width} readOnly={uploadOnly} onChange={e=>editDimensions(e.target.value,height)} aria-label="Source width" aria-invalid={!uploadOnly && !pw.ok} /></label>
      <label className={uploadOnly ? "min-w-0 text-sm" : "w-28 shrink-0 text-sm sm:w-32"}>Height (px)<input className={`field mt-2 w-full ${uploadOnly ? "mp-readout-field" : ""}`} inputMode="decimal" value={height} readOnly={uploadOnly} onChange={e=>editDimensions(width,e.target.value)} aria-label="Source height" aria-invalid={!uploadOnly && !ph.ok} /></label>
      <div className={uploadOnly ? "col-span-2 min-w-0 text-sm sm:col-span-1" : "min-w-32 text-sm"}>Exact ratio
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {/* Upload-only empty state: the blank value takes no width, so Copy ratio lines up with its label. */}
          <p ref={ratioText} className={`num break-all text-2xl font-bold text-primary select-text ${uploadOnly && !exactRatio ? "hidden" : ""}`} data-testid="media-exact-ratio">{exactRatio || (uploadOnly ? "\u00a0" : "—")}</p>
          <button type="button" onClick={copyRatio} disabled={!canCopy} aria-label="Copy ratio" className="flex min-h-11 items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-semibold text-background hover:ring-2 hover:ring-primary disabled:cursor-not-allowed disabled:opacity-40">
            {copyState === "ok" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
            <span role="status">{copyState === "ok" ? "Copied" : "Copy ratio"}</span>
          </button>
        </div>
        {copyState === "fail" && (uploadOnly ? <p role="status" className="mt-2 text-xs text-muted-foreground">Press ⌘C or Ctrl+C.</p> : <div role="alert" className="mt-2 text-sm"><p>Clipboard unavailable. Copy manually:</p><input aria-label="Copy ratio manually" readOnly value={exactRatio} onFocus={e => e.target.select()} className="field mt-2" /></div>)}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" data-testid="media-source">{ratio ? `${width} × ${height} px · ${ratio === 1 ? "Square" : ratio > 1 ? "Landscape" : "Portrait"}` : uploadOnly ? "\u00a0" : "Enter valid dimensions to preview."}</p>
      {!uploadOnly && fitting}
    </div>
    <div className={`grid gap-4 ${kind === "image" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
      {frames.map(([w,h,name]) => {
        const target = w/h;
        const visible = ratio ? Math.min(ratio/target,target/ratio)*100 : 0;
        const isWide = ratio !== null && ratio > target;
        const cw = !ratio || (fit === "contain" ? isWide : !isWide) ? 100 : ratio/target*100;
        const ch = !ratio || (fit === "contain" ? !isWide : isWide) ? 100 : target/ratio*100;
        const device = kind === "video" ? (target < 1 ? "phone" : "monitor") : "plain";
        const base = device === "phone" ? 252 : device === "monitor" ? 400 : 232;
        const exact = pw.ok && ph.ok && pw.value.n * ph.value.d * BigInt(h) === ph.value.n * pw.value.d * BigInt(w);
        const empty = ratio && !exact && fit === "contain";
        const emptyPercent = (100 - (isWide ? ch : cw)) / 2;
        const summary = !ratio ? (uploadOnly ? "\u00a0" : "No preview") : exact ? "Exact fit · no empty space or crop"
          : fit === "contain" ? `Whole ${kind} visible · ${isWide ? "space above & below" : "space on both sides"}`
          : `Fills screen · ${isWide ? "left & right" : "top & bottom"} cropped`;
        const detail = !ratio ? (uploadOnly ? "\u00a0" : "Enter valid source dimensions.")
          : exact ? "Source and frame have the same ratio."
          : fit === "contain" ? `No cropping · ${Math.min(99.9, visible).toFixed(1)}% of frame covered`
          : `${Math.min(99.9, visible).toFixed(1)}% of source area visible`;
        return <article key={name} className={`mp-card ${kind === "video" ? "mp-card--video" : "mp-card--image"}`} aria-label={`${name} ${w}:${h}`}>
          <header className="mp-card-head">
            <h3 className="text-sm font-semibold">{kind === "video" ? (target < 1 ? "Same video on a vertical phone" : "On a widescreen display") : name}</h3>
            <span className="mp-chip num">{w}:{h}</span>
          </header>
          <div className="mp-stage">
            <div className={`mp-device mp-device--${device}`} style={{maxWidth:"100%"}}>
              <div className="mp-frame" data-fit={fit} style={{width:Math.min(base,base*target),aspectRatio:`${w}/${h}`,maxWidth:"100%"}}>
                {/* A labelled div needs a role; the blank upload-only summary is left out of the name. */}
                <div className="mp-screen" role="group" aria-label={summary === "\u00a0" ? `${w}:${h} frame` : `${w}:${h} frame: ${summary}`}>
                  {empty && [0, 1].map(side => <div key={side} className="mp-empty" aria-hidden="true" style={isWide
                    ? {left:0, right:0, height:`${emptyPercent}%`, ...(side ? {bottom:0} : {top:0})}
                    : {top:0, bottom:0, width:`${emptyPercent}%`, ...(side ? {right:0} : {left:0})}}>
                    {emptyPercent > 15 && <span>Empty space</span>}
                  </div>)}
                  {uploadOnly && !image && !ratio && <div aria-hidden="true" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted text-muted-foreground" style={{
                    width: `${(fit === "contain" ? target <= 1 : target >= 1) ? 100 : 100 / target}%`,
                    height: `${(fit === "contain" ? target >= 1 : target <= 1) ? 100 : target * 100}%`,
                  }} data-testid="image-placeholder">
                    {/* 640px WebP of the original 1254px PNG (kept beside it): same picture, about 3 KB instead of 1 MB. */}
                    <img src="/images/image-placeholder-light.webp" alt="" width={640} height={640} decoding="async" className="h-full w-full" />
                  </div>}
                  {ratio && (image
                    ? <img src={image.url} alt={`${name} preview of ${image.name}`} title={`${fit === "contain" ? "Fit" : "Center crop"} to ${w}:${h}`} className="absolute inset-0 h-full w-full" style={{objectFit:fit}} />
                    : <div className="mp-source" style={{width:`${cw}%`,height:`${ch}%`}}>
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                          <path className="mp-thirds" d="M33.333 0V100M66.667 0V100M0 33.333H100M0 66.667H100" />
                          <path className="mp-diag" d="M0 0L100 100M100 0L0 100" />
                        </svg>
                        <span>Your {kind}</span>
                      </div>)}
                </div>
                
              </div>
            </div>
          </div>
          <div className="mp-readout">
            <p className="text-sm font-semibold">{summary}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        </article>;
      })}
    </div>
    </>
    {kind === "video" && <p className="text-xs text-muted-foreground">Uses pixel dimensions with square pixels. No video upload or transcoding.</p>}
  </section>;
}
