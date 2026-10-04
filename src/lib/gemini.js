import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

/**
 * System prompt crafted specifically for professional, natural Thai Manga/Manhwa translation
 */
const SYSTEM_PROMPT = `
You are a professional Manga/Manhwa/Webtoon translator and typesetter localizing into Thai.

YOUR MOST IMPORTANT RULE — ABSOLUTE REQUIREMENT BEFORE ADDING ANY BUBBLE:
=== ONLY include a bubble in the output if you can actually READ and COPY text characters from it. ===
If an area contains NO readable text characters (letters, words, numbers), DO NOT include it — even if it is a white rectangle or speech-bubble shape.

COMMON FALSE POSITIVES TO AVOID:
- White drawing paper, sketchbooks, or canvas objects held by characters in the artwork → NOT a bubble
- Blank white panels or borders between panels that contain no text → NOT a bubble
- White clothing, walls, or objects in the scene → NOT a bubble
- Any area where original_text would be empty or blank → DO NOT include

WHAT TO DETECT (Scan the entire page thoroughly from TOP to BOTTOM):
✓ Narration boxes and caption rectangles (at top, middle, and bottom of the page)
✓ Every dialogue speech bubble (including shouts, whispers, and short expressions like "...!!", "K-KUHK...", "??", "HMM...")
✓ Thought bubbles
✓ System UI windows (game status panels) with text
Do NOT skip any narration boxes or speech bubbles!

TRANSLATION QUALITY:
- Produce NATURAL, VIBRANT Thai translations (ภาษาไม่แข็งกระด้าง ลื่นไหล เข้าปากคนไทย) matching published Thai Webtoon quality.
- Use authentic Thai comic particles (วะ, โว้ย, สิ, น่า, หืม?, เอ๊ะ!, บ้าเอ๊ย!, ชิ!) matching character personality.
- Provide natural Thai line breaks (\n) in thai_translation.

BOUNDING BOX RULES:
- Return box_2d as [ymin, xmin, ymax, xmax] integers strictly on the 0–1000 scale (0 = top/left 0%, 1000 = bottom/right 100%).
- ymin is top edge, xmin is left edge, ymax is bottom edge, xmax is right edge.
- The box must cover the FULL INTERIOR area of the speech bubble or narration box (the entire white area with padding).
- For rectangular narration boxes: cover the full printed box edge-to-edge.
- NEVER include a box for an area with no readable text characters.

Return ONLY valid JSON:
{
  "page_summary": "1-sentence scene description",
  "bubbles": [
    {
      "id": 1,
      "type": "speech" | "thought" | "narration" | "system",
      "shape": "bubble" | "rect",
      "bg_color": "white" | "dark",
      "text_color": "black" | "white",
      "font_size_hint": "small" | "medium" | "large",
      "box_2d": [ymin, xmin, ymax, xmax],
      "original_text": "Exact text you can READ from the bubble",
      "thai_translation": "คำแปลภาษาไทยที่ลื่นไหล",
      "speaker_tone": "confident | whispering | furious | confused | mocking | system_alert"
    }
  ]
}

FINAL CHECK before outputting: For every bubble in your list, verify original_text is non-empty. Remove any entry where original_text is empty.
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
  modelName = 'gemini-2.5-flash',
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
Return box_2d coordinates [ymin, xmin, ymax, xmax] integers strictly on the 0-1000 scale.
Output JSON only.
`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType,
    },
  };

  // ⚡ Current Gemini Free Tier models
  // gemini-2.5-flash & gemini-3.8-flash
  const ALLOWED_MODELS = [
    'gemini-2.5-flash',
    'gemini-3.8-flash',
  ];

  const preferredModel = ALLOWED_MODELS.includes(modelName)
    ? modelName
    : 'gemini-2.5-flash';

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

  // Filter bubbles — ONLY keep entries with actual readable text
  // This eliminates false detections of blank white paper/artwork as narration boxes
  const dialogueOnly = rawBubbles.filter((b) => {
    // Must have original text — if empty, the AI detected blank paper, not a speech bubble
    const origText = (b.original_text || b.text || b.original || '').trim();
    if (origText.length < 1) return false;
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

    // Standard Gemini 2D Object Detection: [ymin, xmin, ymax, xmax] (0-1000 scale)
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
      if (b.box.ymin !== undefined && b.box.xmin !== undefined) {
        const ymin = Math.min(Number(b.box.ymin), Number(b.box.ymax));
        const ymax = Math.max(Number(b.box.ymin), Number(b.box.ymax));
        const xmin = Math.min(Number(b.box.xmin), Number(b.box.xmax));
        const xmax = Math.max(Number(b.box.xmin), Number(b.box.xmax));
        const div = (is1000Scale || ymax > 100 || xmax > 100) ? 10 : 1;
        x = xmin / div;
        y = ymin / div;
        width = (xmax - xmin) / div;
        height = (ymax - ymin) / div;
      } else if (b.box.x !== undefined && b.box.y !== undefined) {
        const bx = Number(b.box.x);
        const by = Number(b.box.y);
        const bw = Number(b.box.width || b.box.w || 28);
        const bh = Number(b.box.height || b.box.h || 8);
        const div = (is1000Scale || bx > 100 || by > 100 || bw > 100 || bh > 100) ? 10 : 1;
        x = bx / div;
        y = by / div;
        width = bw / div;
        height = bh / div;
      }
    }

    // Clamp to valid percentage range — allow webtoon small heights and tall narration
    width  = Math.max(3,   Math.min(96, Number(width)  || 25));
    height = Math.max(1.2, Math.min(70, Number(height) || 6));
    x      = Math.max(0.2, Math.min(97, Number(x)      || 10));
    y      = Math.max(0.2, Math.min(98, Number(y)      || 10));

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
