/**
 * High-quality sample manhwa data for immediate interactive preview
 */

// Generate a sleek SVG manhwa comic page as a data URI
const createSampleSvg = (title, sceneText, characterAction) => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="40%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#090d16" />
      </linearGradient>
      <linearGradient id="auraGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#ec4899" stop-opacity="0.8"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="800" height="1200" fill="url(#bgGrad)"/>

    <!-- Manga Panels Grid -->
    <!-- Panel 1: Top Establishing Scene -->
    <rect x="40" y="40" width="720" height="340" rx="16" fill="#182238" stroke="#334155" stroke-width="3"/>
    <path d="M 60 360 L 250 180 L 450 360" fill="none" stroke="#6366f1" stroke-width="4" opacity="0.3"/>
    <circle cx="400" cy="200" r="90" fill="url(#auraGrad)" opacity="0.25" filter="url(#glow)"/>
    <text x="400" y="210" fill="#94a3b8" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      [ SCENE 1: DUNGEON ENTRANCE ]
    </text>

    <!-- Original Bubble 1 in Panel 1 -->
    <ellipse cx="260" cy="140" rx="120" ry="55" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
    <path d="M 230 190 L 210 240 L 270 190" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
    <text x="260" y="145" fill="#0f172a" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      이곳이 바로 S급 던전인가...?
    </text>

    <!-- Narration Box in Panel 1 -->
    <rect x="520" y="60" width="200" height="60" fill="#fef3c7" stroke="#b45309" stroke-width="3" rx="4"/>
    <text x="620" y="95" fill="#78350f" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      제 13구역 - 심연의 문
    </text>

    <!-- Panel 2: Center Dramatic Action -->
    <rect x="40" y="410" width="720" height="420" rx="16" fill="#0f172a" stroke="#4f46e5" stroke-width="4"/>
    <polygon points="400,430 450,580 620,530 480,640 560,790 400,680 240,790 320,640 180,530 350,580" fill="url(#auraGrad)" filter="url(#glow)" opacity="0.8"/>
    <text x="400" y="620" fill="#ffffff" font-size="36" font-family="sans-serif" font-weight="black" text-anchor="middle" filter="url(#glow)">
      ⚡ AWAKENING ⚡
    </text>

    <!-- Original Bubble 2 in Panel 2 -->
    <ellipse cx="560" cy="500" rx="130" ry="60" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
    <path d="M 520 550 L 480 600 L 550 555" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
    <text x="560" y="495" fill="#0f172a" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      크윽... 마력이 통제되지 않아!
    </text>
    <text x="560" y="520" fill="#0f172a" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      전부 물러서!
    </text>

    <!-- SFX Text in Panel 2 -->
    <text x="210" y="520" fill="#f43f5e" font-size="44" font-family="sans-serif" font-weight="black" transform="rotate(-15 210 520)" filter="url(#glow)">
      콰아아앙!!
    </text>

    <!-- Panel 3: Bottom Climax -->
    <rect x="40" y="860" width="720" height="300" rx="16" fill="#182238" stroke="#334155" stroke-width="3"/>
    <circle cx="200" cy="1010" r="70" fill="#312e81"/>
    <text x="200" y="1020" fill="#818cf8" font-size="20" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      [ HERO FACE ]
    </text>

    <!-- Original Bubble 3 in Panel 3 -->
    <ellipse cx="500" cy="980" rx="150" ry="65" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
    <path d="M 420 1020 L 350 1050 L 430 1035" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
    <text x="500" y="975" fill="#0f172a" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      หึ... ไม่ว่าจะเกิดอะไรขึ้น
    </text>
    <text x="500" y="1000" fill="#0f172a" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">
      ฉันก็ต้องรอดกลับไปให้ได้!
    </text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getSamplePages = () => [
  {
    id: 'sample-p1',
    name: 'ตอนที่ 1: ประตูดันเจี้ยนแห่งความมืด (หน้า 1)',
    size: 245000,
    mimeType: 'image/svg+xml',
    base64: createSampleSvg('Chapter 1', 'Scene 1', 'Awakening'),
    status: 'done',
    page_summary: 'พระเอกยืนอยู่หน้าดันเจี้ยนระดับ S และปลดปล่อยพลังเวทที่ควบคุมไม่ได้',
    bubbles: [
      {
        id: 1,
        type: 'speech',
        box: {
          x: 18.0,
          y: 7.2,
          width: 32.0,
          height: 9.8,
        },
        original_text: '이곳이 바로 S급 던전인가...?',
        thai_translation: 'ที่นี่น่ะเหรอ... ดันเจี้ยนระดับ S ที่เขาร่ำลือกัน...?',
        speaker_tone: 'ตื่นเต้น / ระแวง',
      },
      {
        id: 2,
        type: 'narration',
        box: {
          x: 65.0,
          y: 5.0,
          width: 25.0,
          height: 5.2,
        },
        original_text: '제 13구역 - 심연의 문',
        thai_translation: 'เขตที่ 13 - ประตูสู่ก้นบึ้งอเวจี',
        speaker_tone: 'ผู้บรรยายเคร่งขรึม',
      },
      {
        id: 3,
        type: 'sfx',
        box: {
          x: 18.0,
          y: 40.0,
          width: 26.0,
          height: 8.0,
        },
        original_text: '콰아아앙!!',
        thai_translation: 'ตูมมมมม!!',
        speaker_tone: 'เสียงระเบิดกัมปนาท',
      },
      {
        id: 4,
        type: 'speech',
        box: {
          x: 54.0,
          y: 37.0,
          width: 34.0,
          height: 11.5,
        },
        original_text: '크윽... 마력이 통제되지 않아! 전부 물러서!',
        thai_translation: 'อึ่ก... พลังเวทมันบ้าคลั่งจนคุมไม่อยู่แล้ว! ถอยออกไปให้หมด!!',
        speaker_tone: 'ตะโกนเตือนสุดเสียง',
      },
      {
        id: 5,
        type: 'speech',
        box: {
          x: 44.0,
          y: 77.0,
          width: 38.0,
          height: 11.0,
        },
        original_text: 'หึ... ไม่ว่าจะเกิดอะไรขึ้น ฉันก็ต้องรอดกลับไปให้ได้!',
        thai_translation: 'หึ... ต่อให้ต้องแลกด้วยอะไร ฉันก็ต้องรอดกลับไปให้ได้คอยดูสิ!',
        speaker_tone: 'มุ่งมั่น เด็ดเดี่ยว',
      },
    ],
  },
];
