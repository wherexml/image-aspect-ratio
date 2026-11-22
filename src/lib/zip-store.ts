/**
 * Zero-dependency PKZIP "store" (method 0, uncompressed) archive builder.
 * Ideal for bundling already-compressed PNG/JPEG image tiles client-side
 * without inflating the client bundle with external compression libraries.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ (bytes[i] ?? 0)) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipFileEntry = {
  name: string;
  bytes: Uint8Array;
};

export function buildStoreZipBytes(entries: readonly ZipFileEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const encodedNames = entries.map(e => encoder.encode(e.name));
  const crcs = entries.map(e => crc32(e.bytes));

  let localTotal = 0;
  let centralTotal = 0;
  for (let i = 0; i < entries.length; i++) {
    const nameLen = encodedNames[i]!.length;
    localTotal += 30 + nameLen + entries[i]!.bytes.length;
    centralTotal += 46 + nameLen;
  }

  const out = new Uint8Array(localTotal + centralTotal + 22);
  const view = new DataView(out.buffer);
  const offsets: number[] = [];

  // DOS timestamp (fixed clean 2026-11-17 12:00:00)
  const dosTime = (12 << 11) | (0 << 5) | 0;
  const dosDate = ((2026 - 1980) << 9) | (11 << 5) | 17;

  let pos = 0;
  for (let i = 0; i < entries.length; i++) {
    const nameBytes = encodedNames[i]!;
    const data = entries[i]!.bytes;
    const crc = crcs[i]!;
    offsets.push(pos);

    view.setUint32(pos, 0x04034b50, true); // Local file header signature
    view.setUint16(pos + 4, 20, true); // Version needed (2.0)
    view.setUint16(pos + 6, 0x0800, true); // UTF-8 filename flag
    view.setUint16(pos + 8, 0, true); // Store (0 = no compression)
    view.setUint16(pos + 10, dosTime, true);
    view.setUint16(pos + 12, dosDate, true);
    view.setUint32(pos + 14, crc, true);
    view.setUint32(pos + 18, data.length, true);
    view.setUint32(pos + 22, data.length, true);
    view.setUint16(pos + 26, nameBytes.length, true);
    view.setUint16(pos + 28, 0, true);
    pos += 30;

    out.set(nameBytes, pos);
    pos += nameBytes.length;
    out.set(data, pos);
    pos += data.length;
  }

  const centralStart = pos;
  for (let i = 0; i < entries.length; i++) {
    const nameBytes = encodedNames[i]!;
    const data = entries[i]!.bytes;
    const crc = crcs[i]!;

    view.setUint32(pos, 0x02014b50, true); // Central directory signature
    view.setUint16(pos + 4, 20, true); // Version made by
    view.setUint16(pos + 6, 20, true); // Version needed
    view.setUint16(pos + 8, 0x0800, true); // UTF-8 flag
    view.setUint16(pos + 10, 0, true); // Store
    view.setUint16(pos + 12, dosTime, true);
    view.setUint16(pos + 14, dosDate, true);
    view.setUint32(pos + 16, crc, true);
    view.setUint32(pos + 20, data.length, true);
    view.setUint32(pos + 24, data.length, true);
    view.setUint16(pos + 28, nameBytes.length, true);
    view.setUint16(pos + 30, 0, true);
    view.setUint16(pos + 32, 0, true);
    view.setUint16(pos + 34, 0, true);
    view.setUint16(pos + 36, 0, true);
    view.setUint32(pos + 38, 0, true);
    view.setUint32(pos + 42, offsets[i]!, true);
    pos += 46;

    out.set(nameBytes, pos);
    pos += nameBytes.length;
  }

  const centralSize = pos - centralStart;
  view.setUint32(pos, 0x06054b50, true); // End of central directory
  view.setUint16(pos + 4, 0, true);
  view.setUint16(pos + 6, 0, true);
  view.setUint16(pos + 8, entries.length, true);
  view.setUint16(pos + 10, entries.length, true);
  view.setUint32(pos + 12, centralSize, true);
  view.setUint32(pos + 16, centralStart, true);
  view.setUint16(pos + 20, 0, true);

  return out;
}

export function buildStoreZip(entries: readonly ZipFileEntry[]): Blob {
  const bytes = buildStoreZipBytes(entries);
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([ab], { type: "application/zip" });
}
