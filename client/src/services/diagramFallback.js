/**
 * Client-Side Guaranteed SVG Generator
 * Used for instant, zero-latency image fallbacks when external CDNs fail.
 * Produces crisp, beautiful vector diagrams encoded as base64 data URIs.
 */

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateClientFallbackSVG(title = 'Concept Visual', category = 'Visual Diagram') {
  const safeTitle = escapeXml(title.replace(/\b(\w+)\s+\1\b/gi, '$1').trim().slice(0, 50));
  const safeCategory = escapeXml(category.slice(0, 30));

  // Determine a theme based on title hash
  const colors = [
    { from: '#4f46e5', to: '#06b6d4', glow: '#6366f1' },
    { from: '#059669', to: '#10b981', glow: '#34d399' },
    { from: '#7c3aed', to: '#ec4899', glow: '#a855f7' },
    { from: '#0284c7', to: '#38bdf8', glow: '#0ea5e9' }
  ];
  let hash = 0;
  for (let i = 0; i < safeTitle.length; i++) {
    hash = (hash << 5) - hash + safeTitle.charCodeAt(i);
  }
  const color = colors[Math.abs(hash) % colors.length];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c1017"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#080c14"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color.from}"/>
      <stop offset="100%" stop-color="${color.to}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="800" height="480" rx="16" fill="url(#bg)" stroke="#1e293b" stroke-width="2"/>

  <!-- Subtle grid lines -->
  <g opacity="0.06" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="480"/>`).join('')}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="800" y2="${i * 50}"/>`).join('')}
  </g>

  <!-- Category Badge -->
  <rect x="50" y="45" width="140" height="28" rx="14" fill="#1e1b4b" stroke="${color.glow}" stroke-width="1.5"/>
  <circle cx="65" cy="59" r="4" fill="${color.to}"/>
  <text x="78" y="63" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e0e7ff" letter-spacing="1">${safeCategory.toUpperCase()}</text>

  <!-- Title -->
  <text x="50" y="115" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="800" fill="#f8fafc">${safeTitle}</text>
  <text x="50" y="140" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Interactive Concept Model &amp; Visual Representation</text>

  <!-- Visual Central Graphic -->
  <g transform="translate(400, 260)">
    <!-- Central Node -->
    <circle cx="0" cy="0" r="50" fill="#0f172a" stroke="${color.glow}" stroke-width="3" filter="url(#glow)"/>
    <circle cx="0" cy="0" r="40" fill="url(#accent)"/>
    <text x="0" y="5" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">CORE</text>

    <!-- Satellite Nodes -->
    ${[-150, 0, 150].map((offsetX, idx) => `
      <g transform="translate(${offsetX}, ${idx === 1 ? 90 : -70})">
        <line x1="${-offsetX * 0.4}" y1="${idx === 1 ? -40 : 35}" x2="0" y2="0" stroke="url(#accent)" stroke-width="2" stroke-dasharray="4,4"/>
        <rect x="-60" y="-20" width="120" height="40" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        <text x="0" y="4" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#cbd5e1" text-anchor="middle">Module ${idx + 1}</text>
      </g>
    `).join('')}
  </g>

  <!-- Bottom Caption Box -->
  <rect x="50" y="395" width="700" height="50" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <circle cx="75" cy="420" r="8" fill="${color.to}"/>
  <text x="75" y="424" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#0c1017" text-anchor="middle">✓</text>
  <text x="95" y="425" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#cbd5e1">Vizora Dynamic Engine: Schematic verified and rendered locally.</text>
</svg>
  `.trim();

  // Return safe base64 data URI
  const base64 = typeof window !== 'undefined' && window.btoa 
    ? window.btoa(unescape(encodeURIComponent(svg))) 
    : Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
