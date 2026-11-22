"use client";

import { Button } from "@ui-sdk/react/button";
import { Eye, ImagePlus, RefreshCw, X } from "lucide-react";
import type { LocalToolImage } from "./useLocalToolImage";

export function V3ToolFileBar({
  loaded,
  isDemoSample,
  reading,
  onChooseFile,
  onTrySample,
  onClear,
  chooseLabel = "Choose image",
  replaceLabel = "Replace",
  uploadTestId,
  sampleTestId,
}: {
  loaded: LocalToolImage | null;
  isDemoSample: boolean;
  reading: boolean;
  onChooseFile: () => void;
  onTrySample: () => void;
  onClear: () => void;
  chooseLabel?: string;
  replaceLabel?: string;
  uploadTestId?: string;
  sampleTestId?: string;
}) {
  if (!loaded) return null;

  return (
    <div
      className="rounded-[14px] border border-border bg-card px-3.5 py-2.5 shadow-2xs"
      data-testid="v3-tool-file-bar"
    >
      <div className="v2-file-bar">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={loaded.url}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md border border-border bg-muted object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">{loaded.name}</span>
              {isDemoSample && (
                <span className="v2-badge shrink-0">Sample</span>
              )}
            </div>
            <p className="num text-xs text-muted-foreground">
              {loaded.width} × {loaded.height} px
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            onClick={onChooseFile}
            disabled={reading}
            className={
              isDemoSample
                ? "v2-btn v2-btn--primary v2-btn--sm"
                : "v2-btn v2-btn--outline v2-btn--sm"
            }
            data-testid={uploadTestId}
          >
            {isDemoSample ? (
              <ImagePlus aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            <span>{isDemoSample ? chooseLabel : replaceLabel}</span>
          </Button>

          {!isDemoSample && (
            <Button
              onClick={onTrySample}
              disabled={reading}
              className="v2-btn v2-btn--outline v2-btn--sm"
              data-testid={sampleTestId}
            >
              <Eye aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Try sample</span>
            </Button>
          )}

          <Button
            onClick={onClear}
            disabled={reading}
            className="v2-btn v2-btn--ghost v2-btn--sm"
            aria-label="Remove image"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function V3StageEmptyDropzone({
  reading,
  inputError,
  prompt = "Drop or paste an image here",
  hint,
  onChooseFile,
  onTrySample,
  uploadTestId,
  sampleTestId,
}: {
  reading: boolean;
  inputError?: string;
  prompt?: string;
  hint?: string;
  onChooseFile: () => void;
  onTrySample: () => void;
  uploadTestId?: string;
  sampleTestId?: string;
}) {
  return (
    <div
      onClick={e => {
        if ((e.target as HTMLElement).closest("button")) return;
        onChooseFile();
      }}
      className="flex w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-foreground/25 bg-card p-8 text-center transition hover:border-primary/80"
    >
      <span className="v2-dropzone-icon mb-2" aria-hidden="true">
        <ImagePlus className="h-4 w-4" />
      </span>
      <p className="text-sm font-semibold text-foreground">{prompt}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Button
          onClick={onChooseFile}
          disabled={reading}
          className="v2-btn v2-btn--primary v2-btn--sm"
          data-testid={uploadTestId}
        >
          <ImagePlus aria-hidden="true" className="h-3.5 w-3.5" />
          <span>Choose image</span>
        </Button>
        <Button
          onClick={onTrySample}
          disabled={reading}
          className="v2-btn v2-btn--outline v2-btn--sm"
          data-testid={sampleTestId}
        >
          <span>Try sample</span>
        </Button>
      </div>
      {inputError && (
        <p role="alert" className="mt-2.5 text-xs font-medium text-destructive">
          {inputError}
        </p>
      )}
    </div>
  );
}
