function toHex(c) {
  return c.startsWith('#') ? c : `#${c}`;
}

export function carPlaceholder(brand, model, bodyColor = '#16277e', bgTop = '#c9d8f5', bgBottom = '#eaf1ff') {
  const label = `${brand} ${model}`.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${toHex(bgTop)}"/><stop offset="100%" stop-color="${toHex(bgBottom)}"/></linearGradient></defs>` +
    `<rect width="600" height="400" fill="url(#g)"/>` +
    `<g>` +
    `<path d="M92 262 Q92 216 138 206 L172 168 Q184 152 210 152 L400 152 Q426 152 436 168 L456 206 Q502 216 502 262 Z" fill="${toHex(bodyColor)}"/>` +
    `<path d="M180 166 Q190 158 214 160 L386 160 Q396 160 400 172 L374 206 L192 206 Z" fill="#aebfe6" opacity="0.9"/>` +
    `<circle cx="188" cy="264" r="40" fill="#0b1832"/><circle cx="188" cy="264" r="19" fill="#c9d4f0"/>` +
    `<circle cx="412" cy="264" r="40" fill="#0b1832"/><circle cx="412" cy="264" r="19" fill="#c9d4f0"/>` +
    `<circle cx="100" cy="266" r="6" fill="#ffe27a"/>` +
    `<rect x="452" y="240" width="16" height="22" rx="5" fill="#ff6b6b" transform="rotate(-14 460 251)"/>` +
    `</g>` +
    `<text x="300" y="352" font-family="Segoe UI, Arial, sans-serif" font-size="27" font-weight="700" fill="#0f2a66" text-anchor="middle">${label}</text>` +
    `<text x="300" y="378" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#6b7a99" text-anchor="middle">DriveEasy</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function bannerCar(bg1 = '#0f2a66', bg2 = '#2c5ae0') {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${toHex(bg1)}"/><stop offset="100%" stop-color="${toHex(bg2)}"/></linearGradient></defs>` +
    `<rect width="640" height="420" fill="url(#g)"/>` +
    `<circle cx="100" cy="70" r="120" fill="rgba(255,255,255,0.06)"/>` +
    `<circle cx="560" cy="360" r="160" fill="rgba(255,255,255,0.06)"/>` +
    `<g transform="translate(20 60)">` +
    `<path d="M92 262 Q92 216 138 206 L172 168 Q184 152 210 152 L400 152 Q426 152 436 168 L456 206 Q502 216 502 262 Z" fill="#ffffff"/>` +
    `<path d="M180 166 Q190 158 214 160 L386 160 Q396 160 400 172 L374 206 L192 206 Z" fill="#cfd9f2"/>` +
    `<circle cx="188" cy="264" r="40" fill="#0b1832"/><circle cx="188" cy="264" r="19" fill="#c9d4f0"/>` +
    `<circle cx="412" cy="264" r="40" fill="#0b1832"/><circle cx="412" cy="264" r="19" fill="#c9d4f0"/>` +
    `<circle cx="100" cy="266" r="6" fill="#ffe27a"/>` +
    `</g>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}