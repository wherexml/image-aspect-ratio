import { useState } from "react";
import { EDGE_DEFAULT, parseEdge } from "@/lib/square";
import { ImageFrameEditor } from "./ImageFrameEditor";

// Reviewed product copy (reports/2026-11-07/task9-development/copy-reviewed.md); keep verbatim.
const ERR_EDGE = "Enter a whole number from 1 to 4096 pixels.";

/** /make-image-square: the shared frame editor fixed at 1:1, Output size 1–4096 px (default 1080), `-square` filenames. */
export function SquareImageMaker() {
  const [edgeText, setEdgeText] = useState(String(EDGE_DEFAULT));
  const [lastEdge, setLastEdge] = useState(EDGE_DEFAULT);
  const edge = parseEdge(edgeText);
  const previewEdge = edge ?? lastEdge;

  function onEdge(text: string) {
    setEdgeText(text);
    const value = parseEdge(text);
    if (value) setLastEdge(value);
  }

  return <ImageFrameEditor label="Make image square" idPrefix="square" analyticsTool="make_square"
    preview={{ width: previewEdge, height: previewEdge }} output={edge ? { width: edge, height: edge } : null}
    suffix="square" frameKey={edgeText}
    sizeField={exporting => <label className="min-w-0 text-sm">Output size (px)
      <input className="field mt-2" disabled={exporting} inputMode="numeric" autoComplete="off" spellCheck={false} value={edgeText}
        aria-invalid={edge === null} aria-describedby={edge === null ? "square-edge-error" : undefined}
        onChange={e => onEdge(e.target.value)} />
    </label>}
    sizeStatus={edge === null && <p id="square-edge-error" role="alert" className="text-sm text-destructive">{ERR_EDGE}</p>} />;
}
