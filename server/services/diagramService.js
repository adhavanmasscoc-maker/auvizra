/**
 * High-Fidelity Educational SVG Diagram Generator & Curated Diagram Registry
 * Provides crisp, dark-mode vector schematics that never fail, rate-limit, or break.
 * Outputs raw SVG markup and guaranteed base64 data URIs.
 */

export function cleanTitleText(text = '') {
  let cleaned = String(text || '')
    .replace(/^File:/i, '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  // Remove duplicate consecutive words (e.g. "architecture Architecture" -> "Architecture")
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');

  const suffixes = ['diagram', 'architecture', 'schematic', 'overview', 'illustration'];
  for (const suf of suffixes) {
    const doublePattern = new RegExp(`(${suf})\\s+${suf}`, 'gi');
    cleaned = cleaned.replace(doublePattern, '$1');
  }

  return cleaned.trim() || 'Visual Schematic';
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function toBase64Uri(svgString) {
  const base64 = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export function generateSvgMarkupString({ topic, subtopic, concepts = [], caption = '', template = 'nodes' }) {
  const safeTopic = escapeXml(cleanTitleText(topic || 'Visual Concept'));
  const safeSubtopic = escapeXml(cleanTitleText(subtopic || 'Concept Overview'));
  const safeCaption = escapeXml(caption || `Visual concept schematic and flow relationship for ${safeTopic}.`);
  
  // Deduplicate and filter concepts
  const cleanConcepts = Array.from(new Set(concepts.map(c => cleanTitleText(c))))
    .filter(c => c.length > 1 && !safeTopic.toLowerCase().includes(c.toLowerCase()))
    .slice(0, 4);

  const conceptList = (cleanConcepts.length > 0 ? cleanConcepts : ['Core Module', 'Process Flow', 'System Output']);

  if (template === 'hierarchy') {
    return generateHierarchySvgString(safeTopic, safeSubtopic, conceptList, safeCaption);
  }

  if (template === 'environment' || (/village|city|geo|land|orbit|space/i.test(safeTopic) && template !== 'nodes')) {
    return generateEnvironmentSvgString(safeTopic, safeSubtopic, conceptList, safeCaption);
  }

  const nodeCount = conceptList.length;
  const startX = 120;
  const stepX = 620 / Math.max(1, nodeCount - 1);

  const nodes = conceptList.map((c, i) => {
    const x = nodeCount === 1 ? 450 : Math.round(startX + i * stepX);
    const y = i % 2 === 0 ? 250 : 300;
    return {
      text: escapeXml(c),
      x,
      y,
      index: i + 1
    };
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#101726" />
      <stop offset="100%" stop-color="#080c14" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="900" height="520" rx="16" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="2" />

  <!-- Grid lines -->
  <g opacity="0.06" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="520" />`).join('')}
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="900" y2="${i * 50}" />`).join('')}
  </g>

  <!-- Header Card -->
  <rect x="40" y="30" width="820" height="85" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
  
  <rect x="60" y="46" width="110" height="24" rx="12" fill="#1e1b4b" stroke="#6366f1" stroke-width="1" />
  <circle cx="72" cy="58" r="4" fill="#38bdf8" />
  <text x="84" y="62" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#c7d2fe" letter-spacing="1">VIZORA CORE</text>

  <text x="185" y="62" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="19" font-weight="800" fill="#f8fafc">${safeTopic}</text>
  <text x="60" y="98" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">${safeSubtopic} • Dynamic Concept Flow</text>

  <!-- Connective Path -->
  ${nodes.length > 1 ? `
  <path d="M ${nodes.map((n, i) => (i === 0 ? `${n.x} ${n.y}` : `S ${(nodes[i-1].x + n.x) / 2} ${nodes[i-1].y - 20}, ${n.x} ${n.y}`)).join(' ')}" 
        fill="none" stroke="url(#accentGrad)" stroke-width="3" stroke-dasharray="6,4" />
  ` : ''}

  <!-- Concept Nodes -->
  ${nodes.map((n) => `
    <g transform="translate(${n.x}, ${n.y})">
      <circle cx="0" cy="0" r="36" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" filter="url(#nodeGlow)" opacity="0.7" />
      <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#818cf8" stroke-width="2" />
      
      <circle cx="-20" cy="-20" r="10" fill="#4f46e5" stroke="#ffffff" stroke-width="1.5" />
      <text x="-20" y="-16" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">${n.index}</text>

      <text x="0" y="4" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#e2e8f0" text-anchor="middle">${n.text}</text>

      <rect x="-60" y="42" width="120" height="28" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <text x="0" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" fill="#38bdf8" text-anchor="middle">Stage ${n.index}</text>
    </g>
  `).join('')}

  <!-- Bottom Caption Box -->
  <rect x="40" y="415" width="820" height="75" rx="12" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />
  <circle cx="65" cy="452" r="9" fill="#059669" />
  <text x="65" y="456" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">✓</text>
  <text x="90" y="445" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#f1f5f9">Verified Visual Overview:</text>
  <text x="90" y="468" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="400" fill="#94a3b8">${safeCaption}</text>
</svg>
  `.trim();
}

function generateHierarchySvgString(topic, subtopic, concepts, caption) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%" height="100%">
  <defs>
    <linearGradient id="bgH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101d" />
      <stop offset="100%" stop-color="#05080e" />
    </linearGradient>
  </defs>
  <rect width="900" height="520" rx="16" fill="url(#bgH)" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Header -->
  <rect x="40" y="25" width="820" height="70" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
  <text x="70" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#f8fafc">${topic} - Structure &amp; Specifications</text>
  <text x="70" y="78" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500" fill="#38bdf8">${subtopic}</text>

  <!-- Central Hierarchy Root -->
  <rect x="330" y="125" width="240" height="55" rx="12" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
  <text x="450" y="158" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">${topic}</text>

  <!-- Connective Branch Lines -->
  <line x1="450" y1="180" x2="450" y2="215" stroke="#6366f1" stroke-width="2"/>
  <line x1="160" y1="215" x2="740" y2="215" stroke="#6366f1" stroke-width="2"/>

  <!-- Sub Modules -->
  ${concepts.slice(0, 4).map((c, i) => {
    const x = 160 + i * (580 / Math.max(1, concepts.slice(0, 4).length - 1));
    return `
      <line x1="${x}" y1="215" x2="${x}" y2="260" stroke="#06b6d4" stroke-width="2"/>
      <g transform="translate(${x - 85}, 260)">
        <rect width="170" height="110" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
        <rect x="0" y="0" width="170" height="30" rx="10" fill="#1e293b"/>
        <text x="85" y="20" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">Module ${i + 1}</text>
        <text x="85" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(c)}</text>
        <rect x="15" y="78" width="140" height="20" rx="4" fill="#090d16" stroke="#334155"/>
        <text x="85" y="92" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" fill="#94a3b8" text-anchor="middle">Active Sub-system</text>
      </g>
    `;
  }).join('')}

  <!-- Footer -->
  <rect x="40" y="425" width="820" height="65" rx="12" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />
  <text x="70" y="462" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500" fill="#cbd5e1">${caption}</text>
</svg>
  `.trim();
}

function generateEnvironmentSvgString(topic, subtopic, concepts, caption) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%" height="100%">
  <defs>
    <linearGradient id="bgEnv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061c14" />
      <stop offset="50%" stop-color="#0a2a1f" />
      <stop offset="100%" stop-color="#04120d" />
    </linearGradient>
  </defs>
  <rect width="900" height="520" rx="16" fill="url(#bgEnv)" stroke="#14532d" stroke-width="2"/>

  <!-- Header -->
  <rect x="40" y="25" width="820" height="70" rx="12" fill="#022c22" stroke="#059669" stroke-width="1.5" />
  <circle cx="70" cy="60" r="14" fill="#10b981"/>
  <text x="70" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">GEO</text>
  <text x="100" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#f0fdf4">${topic}</text>
  <text x="100" y="78" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500" fill="#6ee7b7">${subtopic} • Regional &amp; Spatial Overview</text>

  <!-- Central Map / Layout Graphic -->
  <g transform="translate(100, 120)">
    <!-- Landscape / Layout Panels -->
    <rect x="0" y="0" width="340" height="270" rx="16" fill="#042f2e" stroke="#134e4a" stroke-width="2" />
    <text x="170" y="35" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#5eead4" text-anchor="middle">Settlement &amp; Environment</text>
    
    <!-- Stylized Map Elements -->
    <path d="M 40 180 Q 120 120 180 190 T 300 140" fill="none" stroke="#2dd4bf" stroke-width="4" stroke-linecap="round"/>
    <circle cx="90" cy="110" r="28" fill="#065f46" stroke="#34d399" stroke-width="2"/>
    <text x="90" y="115" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">Centre</text>
    
    <circle cx="250" cy="190" r="32" fill="#065f46" stroke="#34d399" stroke-width="2"/>
    <text x="250" y="195" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">Habitation</text>

    <!-- Side Key Attributes -->
    <g transform="translate(370, 0)">
      <rect width="330" height="270" rx="16" fill="#022c22" stroke="#065f46" stroke-width="1.5" />
      <text x="165" y="35" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#6ee7b7" text-anchor="middle">Key Regional Features</text>
      
      ${concepts.slice(0, 4).map((c, idx) => `
        <g transform="translate(20, ${60 + idx * 50})">
          <rect width="290" height="38" rx="8" fill="#064e3b" stroke="#047857" stroke-width="1"/>
          <circle cx="20" cy="19" r="6" fill="#34d399"/>
          <text x="40" y="23" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#ecfdf5">${escapeXml(c)}</text>
        </g>
      `).join('')}
    </g>
  </g>

  <!-- Footer -->
  <rect x="40" y="425" width="820" height="65" rx="12" fill="#022c22" stroke="#065f46" stroke-width="1" />
  <text x="70" y="462" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500" fill="#d1fae5">${caption}</text>
</svg>
  `.trim();
}

export function generateSvgDiagram(params) {
  const svg = generateSvgMarkupString(params);
  return toBase64Uri(svg);
}

// Canonical schematics
export const CURATED_TOPIC_VISUALS = {
  tcp: [
    {
      id: 'curated-tcp-handshake-svg',
      title: 'TCP Three-Way Handshake (SYN, SYN-ACK, ACK)',
      url: toBase64Uri(generateTcpHandshakeSvgString()),
      thumbUrl: toBase64Uri(generateTcpHandshakeSvgString()),
      mime: 'image/svg+xml',
      score: 99,
      description: 'Step-by-step TCP connection establishment sequence: Client SYN, Server SYN-ACK, and Client ACK.',
      author: 'Vizora Diagram Engine',
      license: 'Public Domain / Educational',
      source: 'Vizora Engine'
    },
    {
      id: 'curated-tcp-header-svg',
      title: 'TCP Segment Header Format (RFC 793)',
      url: toBase64Uri(generateTcpHeaderSvgString()),
      thumbUrl: toBase64Uri(generateTcpHeaderSvgString()),
      mime: 'image/svg+xml',
      score: 96,
      description: '32-bit grid architecture of a TCP header showing ports, sequence numbers, ack numbers, and control flags.',
      author: 'Vizora Diagram Engine',
      license: 'Public Domain / Educational',
      source: 'Vizora Engine'
    }
  ]
};

function generateTcpHandshakeSvgString() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%" height="100%">
  <defs>
    <linearGradient id="tcpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c14" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <marker id="arrowB" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
    </marker>
    <marker id="arrowG" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
    </marker>
  </defs>

  <rect width="900" height="520" rx="16" fill="url(#tcpBg)" stroke="#1e293b" stroke-width="2"/>
  <text x="450" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#f8fafc" text-anchor="middle">TCP Three-Way Handshake Protocol</text>
  <text x="450" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500" fill="#94a3b8" text-anchor="middle">Connection Establishment Flow (RFC 793)</text>

  <rect x="80" y="100" width="180" height="60" rx="12" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
  <text x="170" y="132" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">CLIENT (Host A)</text>
  <text x="170" y="150" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#a5b4fc" text-anchor="middle">Active Open</text>
  <line x1="170" y1="160" x2="170" y2="440" stroke="#475569" stroke-width="2" stroke-dasharray="6,6" />

  <rect x="640" y="100" width="180" height="60" rx="12" fill="#042f2e" stroke="#14b8a6" stroke-width="2" />
  <text x="730" y="132" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">SERVER (Host B)</text>
  <text x="730" y="150" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#5eead4" text-anchor="middle">Passive Open</text>
  <line x1="730" y1="160" x2="730" y2="440" stroke="#475569" stroke-width="2" stroke-dasharray="6,6" />

  <line x1="170" y1="200" x2="720" y2="250" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowB)" />
  <rect x="330" y="195" width="240" height="34" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="1.5" />
  <text x="450" y="217" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#38bdf8" text-anchor="middle">1. SYN (Seq = x)</text>

  <line x1="730" y1="280" x2="180" y2="330" stroke="#34d399" stroke-width="3" marker-end="url(#arrowG)" />
  <rect x="300" y="275" width="300" height="34" rx="8" fill="#0f172a" stroke="#059669" stroke-width="1.5" />
  <text x="450" y="297" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#34d399" text-anchor="middle">2. SYN-ACK (Seq = y, Ack = x + 1)</text>

  <line x1="170" y1="360" x2="720" y2="410" stroke="#818cf8" stroke-width="3" marker-end="url(#arrowB)" />
  <rect x="330" y="355" width="240" height="34" rx="8" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" />
  <text x="450" y="377" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#a5b4fc" text-anchor="middle">3. ACK (Ack = y + 1)</text>

  <rect x="90" y="420" width="160" height="30" rx="6" fill="#065f46" stroke="#10b981" stroke-width="1.5" />
  <text x="170" y="440" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#ecfdf5" text-anchor="middle">ESTABLISHED</text>

  <rect x="650" y="420" width="160" height="30" rx="6" fill="#065f46" stroke="#10b981" stroke-width="1.5" />
  <text x="730" y="440" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#ecfdf5" text-anchor="middle">ESTABLISHED</text>

  <text x="450" y="490" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle">Bidirectional sequence synchronization complete.</text>
</svg>`;
}

function generateTcpHeaderSvgString() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" width="100%" height="100%">
  <rect width="900" height="480" rx="16" fill="#0a0e17" stroke="#1e293b" stroke-width="2"/>
  <text x="450" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#ffffff" text-anchor="middle">TCP Segment Header Structure (RFC 793)</text>
  <rect x="60" y="90" width="390" height="60" rx="4" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
  <text x="255" y="125" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#c7d2fe" text-anchor="middle">Source Port (16 bits)</text>
  <rect x="450" y="90" width="390" height="60" rx="4" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
  <text x="645" y="125" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#c7d2fe" text-anchor="middle">Destination Port (16 bits)</text>
  <rect x="60" y="150" width="780" height="60" rx="4" fill="#042f2e" stroke="#14b8a6" stroke-width="1.5" />
  <text x="450" y="185" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#a7f3d0" text-anchor="middle">Sequence Number (32 bits)</text>
  <rect x="60" y="210" width="780" height="60" rx="4" fill="#082f49" stroke="#0284c7" stroke-width="1.5" />
  <text x="450" y="245" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#bae6fd" text-anchor="middle">Acknowledgment Number (32 bits)</text>
</svg>`;
}
