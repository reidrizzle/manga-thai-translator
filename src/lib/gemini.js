import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

/**
 * System prompt crafted specifically for professional, natural Thai Manga/Manhwa translation
 * Using Google's native box_2d [ymin, xmin, ymax, xmax] detection for pixel-perfect alignment.
 */
const SYSTEM_PROMPT = `
You are a professional Manga/Manhwa/Webtoon OCR, typesetter, and Thai localization specialist.

CRITICAL BOUNDING BOX DETECTION (USE Google box_2d):
Detect every dialogue speech bubble and narration box that contains readable text.
For every bubble or box, you MUST output "box_2d" as an array of 4 integers:
  "box_2d": [ymin, xmin, ymax, xmax]
- Values must be integers normalized to [0, 1000] relative to the image dimensions:
  ymin = top edge (0 to 1000)
  xmin = left edge (0 to 1000)
  ymax = bottom edge (0 to 1000)
  xmax = right edge (0 to 1000)
- TIGHT BOUNDS: The box must accurately and tightly surround the speech bubble or narration rectangle. DO NOT place it outside the bubble or include character art!

CRITICAL TRANSLATION & FILTERING RULES:
1. ONLY detect areas containing actual comic dialogue, speech bubbles, character thoughts, or narration boxes in the original source language.
2. DO NOT detect blank canvas, drawing paper, sketchbooks, character bodies, clothing, or furniture as bubbles!
3. DO NOT output bubbles that only contain punctuation marks (e.g. "...!!", "??", "!", "..."). Let comic sound/emotion drawings stay untouched!
4. "original_text" MUST be the exact words read from the comic in the source language. It must NEVER be Thai!
5. "thai_translation" MUST be natural, punchy, colloquial Thai dialogue suitable for Thai comic publications. Avoid robotic or stiff literal translations.

OUTPUT JSON FORMAT (JSON ONLY, no markdown fences):
{
  "page_summary": "1-sentence scene summary",
  "bubbles": [
    {
      "id": 1,
      "type": "speech" | "thought" | "narration" | "system",
      "shape": "bubble" | "rect",
      "bg_color": "white" | "dark",
      "text_color": "black" | "white",
      "font_size_hint": "small" | "medium" | "large",
      "box_2d": [ymin, xmin, ymax, xmax],
      "original_text": "Exact text in comic source language",
      "thai_translation": "คำแปลภาษาไทยที่กระชับและลื่นไหล",
      "speaker_tone": "confident | whispering | furious | confused | playful"
    }
  ]
}
`;

/**
 * Permissive safety settings for comic action, combat, and fantasy drama
 */
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

/**
 * Clean and extract JSON from model output
 */
const extractJson = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (err) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error('Failed to parse translation JSON: ' + err.message);
  }
};

/**
 * Translate a manga image using Google Gemini Vision with automatic model fallback,
 * directional reading rules (Manga Right-to-Left vs Manhwa Left-to-Right), and relaxed safety filters.
 */
export async function translateMangaImage({
  imageBase64,
  mimeType = 'image/jpeg',
  sourceLang = 'auto',
  tonePreset = 'manhwa_natural',
  customApiKey = null,
  modelName = 'gemini-3.5-flash',
}) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ไม่พบ Gemini API Key กรุณาระบุในหน้าตั้งค่าเว็บ หรือตั้งค่าตัวแปร GEMINI_API_KEY ใน .env หรือ Render'
    );
  }

  if (apiKey.length < 10) {
    throw new Error('API Key สั้นเกินไป กรุณาระบุ Google Gemini API Key ที่ถูกต้อง');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Extract pure base64 data if data URL is provided
  let cleanBase64 = imageBase64;
  if (imageBase64.includes('base64,')) {
    const parts = imageBase64.split('base64,');
    cleanBase64 = parts[1];
    const match = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (match && match[1]) {
      mimeType = match[1];
    }
  }

  // Directional Reading Flow Rule
  let readingFlow = 'Read from Left-to-Right and Top-to-Bottom.';
  let langInstruction = 'Auto-detect source language.';

  if (sourceLang === 'Japanese') {
    readingFlow =
      'CRITICAL MANGA ORDER: Read text strictly from RIGHT-TO-LEFT and TOP-TO-BOTTOM (Traditional Japanese Manga reading flow). Order bubble IDs accordingly.';
    langInstruction = 'The source language is Japanese Manga.';
  } else if (sourceLang === 'Korean') {
    readingFlow =
      'CRITICAL MANHWA ORDER: Read text strictly from LEFT-TO-RIGHT and TOP-TO-BOTTOM (Korean Webtoon vertical strip flow). Order bubble IDs accordingly.';
    langInstruction = 'The source language is Korean Manhwa/Webtoon.';
  } else if (sourceLang === 'English') {
    readingFlow = 'Read text from LEFT-TO-RIGHT and TOP-TO-BOTTOM (Western Comic flow).';
    langInstruction = 'The source language is English Comic.';
  } else if (sourceLang === 'Chinese') {
    readingFlow = 'Read text from LEFT-TO-RIGHT and TOP-TO-BOTTOM (Chinese Manhua flow).';
    langInstruction = 'The source language is Chinese Manhua.';
  }

  const prompt = `
${SYSTEM_PROMPT}

Language Instruction: ${langInstruction}
Reading Flow Direction: ${readingFlow}
Tone Mode: ${tonePreset}

Now, carefully inspect this manga/manhwa page image. Locate every speech bubble, text box, and narration following the specific reading flow direction.
Translate every bubble into natural, colloquial Thai that sounds like authentic Thai comic publications.
Output box_2d: [ymin, xmin, ymax, xmax] coordinates normalized to [0, 1000] for each bubble/box.
Output JSON only.
`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType,
    },
  };

  // ⚡ Active Google Gemini Free Tier models (verified working with Vision & JSON output)
  const ALLOWED_MODELS = [
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  const preferredModel = ALLOWED_MODELS.includes(modelName)
    ? modelName
    : 'gemini-3.5-flash';

  const candidateModels = Array.from(
    new Set([preferredModel, ...ALLOWED_MODELS])
  );

  /** Small sleep helper — gives overloaded servers a moment to recover */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let lastError = null;
  let rawText = '';

  for (const candidate of candidateModels) {
    // Each model gets 2 attempts with a short pause between them
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: candidate,
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
          safetySettings: SAFETY_SETTINGS,
        });

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        rawText = response.text();
        if (rawText) break; // ✅ success — stop retrying
      } catch (err) {
        lastError = err;

        // Hard stop — invalid key cannot be retried
        if (
          err.message.includes('API key not valid') ||
          err.message.includes('API_KEY_INVALID')
        ) {
          throw err;
        }

        const is503 = err.message.includes('503') || err.message.includes('Service Unavailable') || err.message.includes('high demand');
        const is404 = err.message.includes('404') || err.message.includes('not found');
        const is429 = err.message.includes('429') || err.message.includes('Too Many Requests') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota');

        if (is404) {
          console.warn(`⚠️ ${candidate} returned 404 — skipping to next model`);
          break;
        }

        if (is429) {
          // Quota exhausted for this model — skip immediately (retrying won't help)
          console.warn(`🚫 ${candidate} quota exceeded (429) — skipping to next model`);
          break;
        }

        if (is503 && attempt === 1) {
          console.warn(`⏳ ${candidate} is overloaded (503). Waiting 2s before retry...`);
          await sleep(2000);
          continue;
        }

        console.warn(`⚠️ ${candidate} attempt ${attempt} failed (${err.message.slice(0, 80)}). Trying next model...`);
        break;
      }
    }
    if (rawText) break;
  }

  if (!rawText) {
    const msg = lastError?.message || '';
    const isQuota = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
    const isOverload = msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable');

    if (isQuota) {
      throw new Error(
        '🚫 โควตาฟรีของ Gemini หมดแล้ว (จำกัด 20 ครั้ง/วัน/โมเดล)\n\n' +
        'วิธีแก้:\n' +
        '• รอ ~20 ชั่วโมง แล้วกดแปลใหม่ (โควตาจะ reset อัตโนมัติ)\n' +
        '• หรือสร้าง API Key ใหม่ใน Google AI Studio (ใช้ Gmail อื่น)\n' +
        '• หรืออัพเกรดเป็น Gemini API Paid Tier ที่ aistudio.google.com'
      );
    }
    if (isOverload) {
      throw new Error('⚠️ เซิร์ฟเวอร์ Gemini โหลดสูงทุกโมเดล กรุณารอ 30 วินาที แล้วกดแปลใหม่อีกครั้ง');
    }
    throw lastError || new Error('ทุกโมเดลของ Gemini ไม่สามารถประมวลผลได้');
  }



  const data = extractJson(rawText);

  // Normalize bubbles structure
  let rawBubbles = [];
  if (Array.isArray(data)) {
    rawBubbles = data;
  } else if (Array.isArray(data.bubbles)) {
    rawBubbles = data.bubbles;
  } else if (Array.isArray(data.dialogue)) {
    rawBubbles = data.dialogue;
  } else if (Array.isArray(data.translations)) {
    rawBubbles = data.translations;
  } else if (Array.isArray(data.boxes)) {
    rawBubbles = data.boxes;
  }

  // Filter bubbles — ONLY keep genuine text dialogue/narration
  // Eliminates hallucinations (Thai characters in original_text) and punctuation-only overlays
  const thaiCharRegex = /[\u0E00-\u0E7F]/;
  const isSourceNonThai = sourceLang === 'English' || sourceLang === 'Japanese' || sourceLang === 'Korean' || sourceLang === 'auto';

  const dialogueOnly = rawBubbles.filter((b) => {
    const origText = (b.original_text || b.text || b.original || '').trim();
    if (origText.length < 1) return false;

    // Reject hallucinations where original_text is Thai when reading non-Thai comic
    if (isSourceNonThai && thaiCharRegex.test(origText)) {
      return false;
    }

    // Skip pure punctuation-only bubbles (...!!, ??, !) so they don't cover comic art
    const stripped = origText.replace(/[\s.!?…\-~]/g, '');
    if (stripped.length === 0) return false;

    return true;
  });

  // Determine coordinate scale across the whole response
  // Gemini's standard box_2d format is [ymin, xmin, ymax, xmax] on a 0-1000 scale.
  // In manga/webtoon, bubbles further down the page will have coordinates > 100.
  // If ANY coordinate across ANY bubble is > 100, the WHOLE response is on 0-1000 scale.
  const allCoordinates = dialogueOnly.flatMap((b) => {
    if (Array.isArray(b.box_2d) && b.box_2d.length === 4) return b.box_2d.map(Number);
    if (Array.isArray(b.box) && b.box.length === 4) return b.box.map(Number);
    if (b.box && typeof b.box === 'object') {
      return [b.box.ymin, b.box.xmin, b.box.ymax, b.box.xmax, b.box.x, b.box.y]
        .filter((v) => v !== undefined)
        .map(Number);
    }
    return [];
  });

  const is1000Scale = allCoordinates.some((val) => val > 100);

  const normalizedBubbles = dialogueOnly.map((b, idx) => {
    let x = 15, y = 15, width = 30, height = 8;

    // 1. Primary & Native: Gemini 2D Object Detection box_2d: [ymin, xmin, ymax, xmax] (0-1000 scale)
    if (Array.isArray(b.box_2d) && b.box_2d.length === 4) {
      const [y1Raw, x1Raw, y2Raw, x2Raw] = b.box_2d.map(Number);
      const ymin = Math.min(y1Raw, y2Raw);
      const ymax = Math.max(y1Raw, y2Raw);
      const xmin = Math.min(x1Raw, x2Raw);
      const xmax = Math.max(x1Raw, x2Raw);

      const div = (is1000Scale || ymax > 100 || xmax > 100) ? 10 : 1;
      x = xmin / div;
      y = ymin / div;
      width = (xmax - xmin) / div;
      height = (ymax - ymin) / div;
    } else if (Array.isArray(b.box) && b.box.length === 4) {
      const [y1Raw, x1Raw, y2Raw, x2Raw] = b.box.map(Number);
      const ymin = Math.min(y1Raw, y2Raw);
      const ymax = Math.max(y1Raw, y2Raw);
      const xmin = Math.min(x1Raw, x2Raw);
      const xmax = Math.max(x1Raw, x2Raw);

      const div = (is1000Scale || ymax > 100 || xmax > 100) ? 10 : 1;
      x = xmin / div;
      y = ymin / div;
      width = (xmax - xmin) / div;
      height = (ymax - ymin) / div;
    } else if (b.box && typeof b.box === 'object') {
      // Fallback: Standard Box Object { top, left, width, height }
      const rawTop = b.box.top ?? b.box.y ?? b.box.ymin;
      const rawLeft = b.box.left ?? b.box.x ?? b.box.xmin;
      const rawW = b.box.width ?? b.box.w;
      const rawH = b.box.height ?? b.box.h ?? (b.box.ymax !== undefined ? Number(b.box.ymax) - Number(rawTop) : undefined);

      if (rawTop !== undefined && rawLeft !== undefined) {
        const topNum = Number(rawTop);
        const leftNum = Number(rawLeft);
        const div = (is1000Scale || topNum > 100 || leftNum > 100) ? 10 : 1;
        x = leftNum / div;
        y = topNum / div;
        width = rawW !== undefined ? Number(rawW) / div : 28;
        height = rawH !== undefined ? Number(rawH) / div : 8;
      }
    }

    // Clamp to valid percentage range (height up to 40% allows tall vertical webtoon bubbles)
    width  = Math.max(4, Math.min(95, Number(width)  || 25));
    height = Math.max(2, Math.min(40, Number(height) || 8));
    x      = Math.max(0.2, Math.min(97, Number(x)    || 10));
    y      = Math.max(0.2, Math.min(98, Number(y)    || 10));

    const type = b.type || 'speech';
    const isDarkBg =
      b.bg_color === 'dark' ||
      type === 'system' ||
      (b.speaker_tone && (b.speaker_tone.includes('evil') || b.speaker_tone.includes('system')));

    return {
      id: b.id || idx + 1,
      type: type,
      shape: b.shape || (type === 'narration' || type === 'system' ? 'rect' : 'bubble'),
      bg_color: isDarkBg ? 'dark' : (b.bg_color || 'white'),
      text_color: b.text_color || (isDarkBg ? 'white' : 'black'),
      font_size_hint: b.font_size_hint || 'medium',
      box: {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        width:  Number(width.toFixed(2)),
        height: Number(height.toFixed(2)),
      },
      original_text:   b.original_text   || b.text        || b.original || '',
      thai_translation: b.thai_translation || b.translation || b.thai     || '',
      speaker_tone:    b.speaker_tone     || b.tone        || '',
    };
  });

  return {
    page_summary: data.page_summary || '',
    bubbles: normalizedBubbles,
  };
}
