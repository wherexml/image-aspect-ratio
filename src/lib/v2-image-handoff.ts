let pendingImageFile: File | null = null;

export function setV2PendingImage(file: File | null): void {
  pendingImageFile = file;
}

export function consumeV2PendingImage(): File | null {
  const file = pendingImageFile;
  pendingImageFile = null;
  return file;
}
