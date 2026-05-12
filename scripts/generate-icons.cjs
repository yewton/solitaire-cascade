#!/usr/bin/env node
'use strict';

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 table for PNG encoding
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function encodePNG(w, h, pixels) {
  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  const stride = 1 + w * 4;
  const raw = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * stride + 1 + x * 4;
      raw[di]     = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
      raw[di + 3] = pixels[si + 3];
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const s = size;
  const px = new Uint8Array(s * s * 4);

  function put(x, y, r, g, b, a = 255) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= s || y < 0 || y >= s) return;
    const i = (y * s + x) * 4;
    const af = a / 255, bf = 1 - af;
    px[i]     = Math.round(px[i]     * bf + r * af);
    px[i + 1] = Math.round(px[i + 1] * bf + g * af);
    px[i + 2] = Math.round(px[i + 2] * bf + b * af);
    px[i + 3] = Math.min(255, px[i + 3] + a);
  }

  // Check if point is inside a rounded rectangle
  function inRR(x, y, x1, y1, x2, y2, r) {
    if (x < x1 || x > x2 || y < y1 || y > y2) return false;
    if (x < x1 + r && y < y1 + r) return (x - x1 - r) ** 2 + (y - y1 - r) ** 2 <= r * r;
    if (x > x2 - r && y < y1 + r) return (x - x2 + r) ** 2 + (y - y1 - r) ** 2 <= r * r;
    if (x < x1 + r && y > y2 - r) return (x - x1 - r) ** 2 + (y - y2 + r) ** 2 <= r * r;
    if (x > x2 - r && y > y2 - r) return (x - x2 + r) ** 2 + (y - y2 + r) ** 2 <= r * r;
    return true;
  }

  function fillRR(x1, y1, x2, y2, r, cr, cg, cb, ca = 255) {
    const bx1 = Math.max(0, Math.floor(x1));
    const by1 = Math.max(0, Math.floor(y1));
    const bx2 = Math.min(s, Math.ceil(x2));
    const by2 = Math.min(s, Math.ceil(y2));
    for (let y = by1; y < by2; y++)
      for (let x = bx1; x < bx2; x++)
        if (inRR(x, y, x1, y1, x2, y2, r)) put(x, y, cr, cg, cb, ca);
  }

  // Check if point is inside a heart centered at (cx, cy) with radius R
  function inHeart(x, y, cx, cy, R) {
    const dx = x - cx, dy = y - cy;
    const topY = -R * 0.22;
    return (
      (dx + R * 0.5) ** 2 + (dy + R * 0.22) ** 2 <= (R * 0.56) ** 2 ||
      (dx - R * 0.5) ** 2 + (dy + R * 0.22) ** 2 <= (R * 0.56) ** 2 ||
      (dy >= topY && dy <= R * 1.05 && Math.abs(dx) <= R * (1 - (dy - topY) / (R * 1.27)))
    );
  }

  function fillHeart(cx, cy, R, r, g, b) {
    for (let y = Math.floor(cy - R * 0.8); y <= Math.ceil(cy + R * 1.1); y++)
      for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++)
        if (inHeart(x, y, cx, cy, R)) put(x, y, r, g, b);
  }

  // --- Background: deep dark purple-black ---
  for (let i = 0; i < s * s; i++) {
    px[i * 4] = 10; px[i * 4 + 1] = 8; px[i * 4 + 2] = 22; px[i * 4 + 3] = 255;
  }
  // Radial vignette (lighter at center)
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const dx = (x - s / 2) / (s / 2), dy = (y - s / 2) / (s / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      const fade = Math.max(0, 1 - d * 0.65);
      put(x, y, 45, 20, 90, Math.round(fade * 70));
    }
  }

  const cx = s / 2, cy = s / 2;
  const cw = s * 0.60, ch = s * 0.78, cr = s * 0.07;

  // Card shadow
  fillRR(cx - cw / 2 + s * 0.022, cy - ch / 2 + s * 0.022,
         cx + cw / 2 + s * 0.022, cy + ch / 2 + s * 0.022,
         cr, 0, 0, 0, 90);

  // Card body (warm white)
  fillRR(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2, cr, 252, 248, 243);

  // Subtle inner border
  fillRR(cx - cw / 2 + s * 0.018, cy - ch / 2 + s * 0.018,
         cx + cw / 2 - s * 0.018, cy + ch / 2 - s * 0.018,
         cr * 0.7, 230, 220, 210, 60);

  // Large red heart centered on card
  fillHeart(cx, cy + s * 0.015, s * 0.165, 210, 38, 48);

  // Small suit marks in top-left and bottom-right (only for larger sizes)
  if (size >= 96) {
    const sm = s * 0.07; // small heart radius
    fillHeart(cx - cw / 2 + s * 0.075, cy - ch / 2 + s * 0.1, sm, 210, 38, 48);
    fillHeart(cx + cw / 2 - s * 0.075, cy + ch / 2 - s * 0.1, sm, 210, 38, 48);
  }

  return px;
}

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [512, 192, 180, 144, 96, 32];
for (const size of sizes) {
  const name = size === 180 ? 'apple-touch-icon' : size === 32 ? 'favicon' : `icon-${size}`;
  const png = encodePNG(size, size, drawIcon(size));
  const outPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${name}.png (${size}x${size})`);
}
