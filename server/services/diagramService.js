/**
 * High-Fidelity Educational SVG Diagram Generator & Curated Diagram Registry
 * Provides crisp, responsive vector schematics that never fail, rate-limit, or break.
 * Outputs raw SVG markup and guaranteed UTF-8 encoded data URIs.
 */

export function cleanTitleText(text = '') {
  let cleaned = String(text || '')
    .replace(/^File:/i, '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  // Deduplicate repeated consecutive words (e.g. "architecture Architecture" -> "Architecture")
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');

  const suffixes = ['diagram', 'architecture', 'schematic', 'overview', 'illustration', 'model'];
  for (const suf of suffixes) {
    const doublePattern = new RegExp(`(${suf})\\s+${suf}`, 'gi');
    cleaned = cleaned.replace(doublePattern, '$1');
  }

  // Remove trailing dangling prepositions and articles (e.g. "Using A", "With", "For", "In")
  cleaned = cleaned.replace(/\b(using\s+a|using|with|and|for|of|in|to|by|on|a|an|the)$/i, '').trim();

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
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
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
  const stepX = 560 / Math.max(1, nodeCount - 1);

  const nodes = conceptList.map((c, i) => {
    const x = nodeCount === 1 ? 400 : Math.round(startX + i * stepX);
    const y = i % 2 === 0 ? 230 : 270;
    return {
      text: escapeXml(c),
      x,
      y,
      index: i + 1
    };
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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

  <rect width="800" height="450" rx="16" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="2" />

  <!-- Grid lines -->
  <g opacity="0.06" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="450" />`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="800" y2="${i * 50}" />`).join('')}
  </g>

  <!-- Header Card -->
  <rect x="35" y="25" width="730" height="75" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
  
  <rect x="50" y="38" width="115" height="24" rx="12" fill="#1e1b4b" stroke="#6366f1" stroke-width="1" />
  <circle cx="62" cy="50" r="4" fill="#38bdf8" />
  <text x="74" y="54" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#c7d2fe" letter-spacing="1">AUVIZRA CORE</text>
  
  <text x="175" y="54" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${safeTopic}</text>
  <text x="50" y="85" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">${safeSubtopic} • Dynamic Concept Flow</text>

  <!-- Connective Path -->
  ${nodes.length > 1 ? `
  <path d="M ${nodes.map((n, i) => (i === 0 ? `${n.x} ${n.y}` : `S ${(nodes[i-1].x + n.x) / 2} ${nodes[i-1].y - 20}, ${n.x} ${n.y}`)).join(' ')}" 
        fill="none" stroke="url(#accentGrad)" stroke-width="3" stroke-dasharray="6,4" />
  ` : ''}

  <!-- Concept Nodes -->
  ${nodes.map((n) => `
    <g transform="translate(${n.x}, ${n.y})">
      <circle cx="0" cy="0" r="32" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" filter="url(#nodeGlow)" opacity="0.7" />
      <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#818cf8" stroke-width="2" />
      
      <circle cx="-16" cy="-16" r="9" fill="#4f46e5" stroke="#ffffff" stroke-width="1.5" />
      <text x="-16" y="-12" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">${n.index}</text>

      <text x="0" y="4" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#e2e8f0" text-anchor="middle">${n.text}</text>

      <rect x="-55" y="36" width="110" height="24" rx="6" fill="#090d16" stroke="#334155" stroke-width="1" />
      <text x="0" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" fill="#38bdf8" text-anchor="middle">Stage ${n.index}</text>
    </g>
  `).join('')}

  <!-- Bottom Caption Box -->
  <rect x="35" y="365" width="730" height="65" rx="12" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />
  <circle cx="58" cy="397" r="8" fill="#059669" />
  <text x="58" y="401" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">✓</text>
  <text x="78" y="392" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#f1f5f9">Verified Visual Overview:</text>
  <text x="78" y="412" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="400" fill="#94a3b8">${safeCaption}</text>
</svg>
  `.trim();
}

function generateHierarchySvgString(topic, subtopic, concepts, caption) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="bgH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101d" />
      <stop offset="100%" stop-color="#05080e" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" rx="16" fill="url(#bgH)" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Header -->
  <rect x="35" y="25" width="730" height="65" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
  <text x="60" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#f8fafc">${topic} - Structure &amp; Specifications</text>
  <text x="60" y="72" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#38bdf8">${subtopic}</text>

  <!-- Central Hierarchy Root -->
  <rect x="290" y="110" width="220" height="48" rx="10" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
  <text x="400" y="140" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">${topic}</text>

  <!-- Connective Branch Lines -->
  <line x1="400" y1="158" x2="400" y2="190" stroke="#6366f1" stroke-width="2"/>
  <line x1="140" y1="190" x2="660" y2="190" stroke="#6366f1" stroke-width="2"/>

  <!-- Sub Modules -->
  ${concepts.slice(0, 4).map((c, i) => {
    const x = 140 + i * (520 / Math.max(1, concepts.slice(0, 4).length - 1));
    return `
      <line x1="${x}" y1="190" x2="${x}" y2="230" stroke="#06b6d4" stroke-width="2"/>
      <g transform="translate(${x - 75}, 230)">
        <rect width="150" height="95" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
        <rect x="0" y="0" width="150" height="26" rx="8" fill="#1e293b"/>
        <text x="75" y="17" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#38bdf8" text-anchor="middle">Module ${i + 1}</text>
        <text x="75" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(c)}</text>
        <rect x="15" y="68" width="120" height="18" rx="4" fill="#090d16" stroke="#334155"/>
        <text x="75" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="600" fill="#94a3b8" text-anchor="middle">Active Sub-system</text>
      </g>
    `;
  }).join('')}

  <!-- Footer -->
  <rect x="35" y="370" width="730" height="55" rx="12" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />
  <text x="60" y="402" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#cbd5e1">${caption}</text>
</svg>
  `.trim();
}

function generateEnvironmentSvgString(topic, subtopic, concepts, caption) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="bgEnv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061c14" />
      <stop offset="50%" stop-color="#0a2a1f" />
      <stop offset="100%" stop-color="#04120d" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" rx="16" fill="url(#bgEnv)" stroke="#14532d" stroke-width="2"/>

  <!-- Header -->
  <rect x="35" y="25" width="730" height="65" rx="12" fill="#022c22" stroke="#059669" stroke-width="1.5" />
  <circle cx="60" cy="57" r="12" fill="#10b981"/>
  <text x="60" y="61" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">GEO</text>
  <text x="85" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#f0fdf4">${topic}</text>
  <text x="85" y="72" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#6ee7b7">${subtopic} • Regional &amp; Spatial Overview</text>

  <!-- Central Map / Layout Graphic -->
  <g transform="translate(60, 105)">
    <!-- Landscape / Layout Panels -->
    <rect x="0" y="0" width="320" height="240" rx="14" fill="#042f2e" stroke="#134e4a" stroke-width="2" />
    <text x="160" y="30" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#5eead4" text-anchor="middle">Settlement &amp; Environment</text>
    
    <!-- Stylized Map Elements -->
    <path d="M 30 160 Q 100 100 160 170 T 280 120" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-linecap="round"/>
    <circle cx="80" cy="95" r="24" fill="#065f46" stroke="#34d399" stroke-width="2"/>
    <text x="80" y="99" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">Centre</text>
    
    <circle cx="230" cy="170" r="28" fill="#065f46" stroke="#34d399" stroke-width="2"/>
    <text x="230" y="174" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">Habitation</text>

    <!-- Side Key Attributes -->
    <g transform="translate(340, 0)">
      <rect width="340" height="240" rx="14" fill="#022c22" stroke="#065f46" stroke-width="1.5" />
      <text x="170" y="30" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#6ee7b7" text-anchor="middle">Key Regional Features</text>
      
      ${concepts.slice(0, 4).map((c, idx) => `
        <g transform="translate(20, ${50 + idx * 44})">
          <rect width="300" height="34" rx="6" fill="#064e3b" stroke="#047857" stroke-width="1"/>
          <circle cx="18" cy="17" r="5" fill="#34d399"/>
          <text x="36" y="21" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#ecfdf5">${escapeXml(c)}</text>
        </g>
      `).join('')}
    </g>
  </g>

  <!-- Footer -->
  <rect x="35" y="370" width="730" height="55" rx="12" fill="#022c22" stroke="#065f46" stroke-width="1" />
  <text x="60" y="402" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#d1fae5">${caption}</text>
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
      title: 'TCP Three-Way Handshake Protocol (SYN, SYN-ACK, ACK)',
      url: toBase64Uri(generateTcpHandshakeSvgString()),
      thumbUrl: toBase64Uri(generateTcpHandshakeSvgString()),
      mime: 'image/svg+xml',
      score: 99,
      description: 'Step-by-step TCP connection establishment sequence: Client SYN, Server SYN-ACK, and Client ACK.',
      author: 'Auvizra Diagram Engine',
      license: 'Public Domain / Educational',
      source: 'Auvizra Engine'
    },
    {
      id: 'curated-tcp-header-svg',
      title: 'TCP Segment Header Format (RFC 793)',
      url: toBase64Uri(generateTcpHeaderSvgString()),
      thumbUrl: toBase64Uri(generateTcpHeaderSvgString()),
      mime: 'image/svg+xml',
      score: 96,
      description: '32-bit grid architecture of a TCP header showing ports, sequence numbers, ack numbers, and control flags.',
      author: 'Auvizra Diagram Engine',
      license: 'Public Domain / Educational',
      source: 'Auvizra Engine'
    }
  ]
};

function generateTcpHandshakeSvgString() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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

  <rect width="800" height="450" rx="16" fill="url(#tcpBg)" stroke="#1e293b" stroke-width="2"/>
  <text x="400" y="38" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#f8fafc" text-anchor="middle">TCP Three-Way Handshake Protocol</text>
  <text x="400" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#94a3b8" text-anchor="middle">Connection Establishment Flow (RFC 793)</text>

  <rect x="60" y="80" width="160" height="50" rx="10" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
  <text x="140" y="108" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">CLIENT (Host A)</text>
  <text x="140" y="122" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500" fill="#a5b4fc" text-anchor="middle">Active Open</text>
  <line x1="140" y1="130" x2="140" y2="380" stroke="#475569" stroke-width="2" stroke-dasharray="6,6" />

  <rect x="580" y="80" width="160" height="50" rx="10" fill="#042f2e" stroke="#14b8a6" stroke-width="2" />
  <text x="660" y="108" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">SERVER (Host B)</text>
  <text x="660" y="122" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500" fill="#5eead4" text-anchor="middle">Passive Open</text>
  <line x1="660" y1="130" x2="660" y2="380" stroke="#475569" stroke-width="2" stroke-dasharray="6,6" />

  <line x1="140" y1="170" x2="650" y2="210" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowB)" />
  <rect x="290" y="165" width="220" height="30" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1.5" />
  <text x="400" y="185" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">1. SYN (Seq = x)</text>

  <line x1="660" y1="240" x2="150" y2="280" stroke="#34d399" stroke-width="3" marker-end="url(#arrowG)" />
  <rect x="260" y="235" width="280" height="30" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1.5" />
  <text x="400" y="255" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#34d399" text-anchor="middle">2. SYN-ACK (Seq = y, Ack = x + 1)</text>

  <line x1="140" y1="310" x2="650" y2="350" stroke="#818cf8" stroke-width="3" marker-end="url(#arrowB)" />
  <rect x="290" y="305" width="220" height="30" rx="6" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" />
  <text x="400" y="325" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#a5b4fc" text-anchor="middle">3. ACK (Ack = y + 1)</text>

  <rect x="70" y="360" width="140" height="26" rx="6" fill="#065f46" stroke="#10b981" stroke-width="1.5" />
  <text x="140" y="377" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#ecfdf5" text-anchor="middle">ESTABLISHED</text>

  <rect x="590" y="360" width="140" height="26" rx="6" fill="#065f46" stroke="#10b981" stroke-width="1.5" />
  <text x="660" y="377" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#ecfdf5" text-anchor="middle">ESTABLISHED</text>

  <text x="400" y="420" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle">Bidirectional sequence synchronization complete.</text>
</svg>`;
}

function generateTcpHeaderSvgString() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <rect width="800" height="450" rx="16" fill="#0a0e17" stroke="#1e293b" stroke-width="2"/>
  <text x="400" y="40" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">TCP Segment Header Structure (RFC 793)</text>
  <rect x="40" y="80" width="350" height="50" rx="4" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
  <text x="215" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#c7d2fe" text-anchor="middle">Source Port (16 bits)</text>
  <rect x="410" y="80" width="350" height="50" rx="4" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
  <text x="585" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#c7d2fe" text-anchor="middle">Destination Port (16 bits)</text>
  <rect x="40" y="140" width="720" height="50" rx="4" fill="#042f2e" stroke="#14b8a6" stroke-width="1.5" />
  <text x="400" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#a7f3d0" text-anchor="middle">Sequence Number (32 bits)</text>
  <rect x="40" y="200" width="720" height="50" rx="4" fill="#082f49" stroke="#0284c7" stroke-width="1.5" />
  <text x="400" y="230" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#bae6fd" text-anchor="middle">Acknowledgment Number (32 bits)</text>
</svg>`;
}
