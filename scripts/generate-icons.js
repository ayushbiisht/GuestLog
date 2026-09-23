import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate clean SVG icon (cobalt blue theme, crisp hotel building & calendar)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4B70E2" />
      <stop offset="100%" stop-color="#1E3A8A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  
  <!-- Rounded Base Canvas in Cobalt Blue -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Hotel Building Emblem in White -->
  <g filter="url(#shadow)" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" transform="translate(64, 64) scale(0.75)">
    <!-- Main Hotel Structure -->
    <rect x="64" y="64" width="384" height="400" rx="36" fill="#FFFFFF" fill-opacity="0.15" stroke="#FFFFFF" stroke-width="28" />
    <!-- Roof / Top Accent -->
    <path d="M192 64V32h128v32" stroke="#FFFFFF" stroke-width="28" />
    <!-- Hotel Windows Grid -->
    <rect x="128" y="140" width="64" height="64" rx="10" fill="#FFFFFF" stroke="none" />
    <rect x="320" y="140" width="64" height="64" rx="10" fill="#FFFFFF" stroke="none" />
    <rect x="128" y="248" width="64" height="64" rx="10" fill="#FFFFFF" stroke="none" />
    <rect x="320" y="248" width="64" height="64" rx="10" fill="#FFFFFF" stroke="none" />
    <!-- Entrance Arch Door -->
    <path d="M208 464V360c0-26 21-48 48-48s48 21 48 48v104" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="20" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('Created public/icon.svg');

// PNG encoder in pure node
function createPng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    let crc = 0 ^ -1;
    for (let i = 4; i < 8 + len; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (((crc ^ byte) & 1) ? 0xedb88320 : 0);
        byte = byte >>> 1;
      }
    }
    crc = (crc ^ -1) >>> 0;
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const rgba = drawFn(x, y, width, height);
      rawData[pixelOffset] = rgba[0];
      rawData[pixelOffset + 1] = rgba[1];
      rawData[pixelOffset + 2] = rgba[2];
      rawData[pixelOffset + 3] = rgba[3];
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw vibrant Cobalt Blue icon with clean Hotel Building Silhouette
function drawBrandIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;

  // Cobalt Blue gradient (#4B70E2 to #1E3A8A)
  const t = (x + y) / (w + h);
  const r = Math.round(75 * (1 - t) + 30 * t);
  const g = Math.round(112 * (1 - t) + 58 * t);
  const b = Math.round(226 * (1 - t) + 138 * t);

  if (!isMaskable) {
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    const cornerR = w * 0.22;
    const innerW = cx - cornerR;
    const innerH = cy - cornerR;
    if (dx > innerW && dy > innerH) {
      const d = Math.hypot(dx - innerW, dy - innerH);
      if (d > cornerR) return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  const scale = isMaskable ? 0.52 : 0.64;
  const nx = (x - cx) / (w * scale);
  const ny = (y - cy) / (h * scale);

  // Outer hotel building boundary: nx in [-0.55, 0.55], ny in [-0.65, 0.75]
  const inBuilding = nx >= -0.55 && nx <= 0.55 && ny >= -0.65 && ny <= 0.75;
  const onBorder = inBuilding && (nx <= -0.45 || nx >= 0.45 || ny <= -0.55 || ny >= 0.65);

  // Roof flag / tower
  const onRoof = nx >= -0.15 && nx <= 0.15 && ny >= -0.85 && ny <= -0.65;

  // 4 Windows
  const inWin1 = nx >= -0.38 && nx <= -0.18 && ny >= -0.45 && ny <= -0.25;
  const inWin2 = nx >= 0.18 && nx <= 0.38 && ny >= -0.45 && ny <= -0.25;
  const inWin3 = nx >= -0.38 && nx <= -0.18 && ny >= -0.12 && ny <= 0.08;
  const inWin4 = nx >= 0.18 && nx <= 0.38 && ny >= -0.12 && ny <= 0.08;

  // Door
  const inDoor = nx >= -0.18 && nx <= 0.18 && ny >= 0.25 && ny <= 0.75;

  if (onBorder || onRoof || inWin1 || inWin2 || inWin3 || inWin4 || inDoor) {
    return [255, 255, 255, 255]; // Pure White Emblem
  }

  if (inBuilding) {
    // Subtle translucent building tint inside cobalt
    return [
      Math.min(255, r + 35),
      Math.min(255, g + 35),
      Math.min(255, b + 35),
      255,
    ];
  }

  return [r, g, b, 255]; // Cobalt Gradient Background
}

// Generate PNG sizes
const png16 = createPng(16, 16, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

const png32 = createPng(32, 32, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

const png48 = createPng(48, 48, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);

const png180 = createPng(180, 180, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

const png192 = createPng(192, 192, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createPng(512, 512, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

const maskable512 = createPng(512, 512, (x, y, w, h) => drawBrandIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskable512);

// Generate true multi-resolution binary Windows .ICO file wrapping 16x16, 32x32, 48x48 PNGs
function buildIcoFile(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO format
  header.writeUInt16LE(images.length, 4); // Number of images

  const dirEntries = [];
  let offset = 6 + images.length * 16;

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size, 0); // Width
    entry.writeUInt8(img.size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image data size in bytes
    entry.writeUInt32LE(offset, 12); // Image data offset

    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map((img) => img.buffer)]);
}

const icoBuffer = buildIcoFile([
  { size: 16, buffer: png16 },
  { size: 32, buffer: png32 },
  { size: 48, buffer: png48 },
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('Created public/favicon.ico (Multi-size true ICO: 16x16, 32x32, 48x48)');
