import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * System prompt crafted specifically for professional, natural Thai Manga/Manhwa translation
 */
const SYSTEM_PROMPT = `
You are a master professional translator specializing in Webtoon, Manhwa, and Manga localization into Thai.
Your highest priority is to produce NATURAL, VIBRANT, and EMOTIVE Thai translations (ภาษาไม่แข็งกระด้าง ลื่นไหล เข้าปากคนไทย มีอารมณ์ขัน/ดุดันตามบริบทของตัวละคร).

Rules for Thai Localization:
1. Avoid literal word-for-word translation. Translate the INTENT and FEELING.
2. Use authentic Thai comic dialog particles appropriately (เช่น "วะ", "โว้ย", "สิ", "น่า", "หืม?", "เอ๊ะ!", "บ้าเอ๊ย!", "ชิ!") matching the character's personality and status.
3. For SFX (Sound Effects), translate into standard Thai comic sound words (เช่น "ตึง!", "ควับ!", "ตึกตัก...", "ฟุ่บ!", "เคร้ง!").
4. For honorifics and pronouns: choose appropriate Thai pronouns (เช่น ฉัน/นาย, ข้า/เจ้า, พี่/น้อง, ผม/คุณ, กู/มึง หากเป็นเพื่อนสนิทหรือคนสนิทที่สบถ).

You must detect all text areas (speech bubbles, thought bubbles, narration boxes, SFX) in the manga page.
For each text area, identify its bounding box coordinates in percentage (0 to 100) relative to image width and height:
- x: left edge percentage (0 to 100)
- y: top edge percentage (0 to 100)
- width: bubble width percentage (0 to 100)
- height: bubble height percentage (0 to 100)

Return your response strictly in valid JSON matching this schema:
{
  "page_summary": "Brief 1-sentence description of the scene context",
  "bubbles": [
    {
      "id": 1,
      "type": "speech" | "thought" | "narration" | "sfx",
      "box": {
        "x": 15.2,
        "y": 24.5,
        "width": 28.0,
        "height": 14.2
      },
      "original_text": "원본 텍스트 / 原文テキスト / Original text",
      "thai_translation": "บทแปลภาษาไทยที่ลื่นไหล เป็นธรรมชาติ มีอารมณ์ร่วม",
      "speaker_tone": "confident / whispering / furious / confused / mocking"
    }
  ]
}
`;

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
 * Translate a manga image using Google Gemini Vision with automatic model fallback
 */
export async function translateMangaImage({
  imageBase64,
  mimeType = 'image/jpeg',
  sourceLang = 'auto',
  tonePreset = 'manhwa_natural',
  customApiKey = null,
  modelName = 'gemini-2.0-flash',
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

  const langInstruction =
    sourceLang === 'auto'
      ? 'Auto-detect source language (Korean Manhwa, Japanese Manga, English Comic, or Chinese Manhua).'
      : `The source language is strictly ${sourceLang}.`;

  const prompt = `
${SYSTEM_PROMPT}

Language Instruction: ${langInstruction}
Tone Mode: ${tonePreset}

Now, carefully inspect this manga/manhwa page image. Locate every speech bubble, text box, narration, and sound effect from top to bottom (reading flow).
Translate every bubble into natural, colloquial Thai that sounds like authentic Thai comic publications.
Calculate the exact percentage coordinates of each bubble accurately.
Output JSON only.
`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType,
    },
  };

  // Candidate models to try in order of preference (handles 404 deprecated models automatically)
  const candidateModels = Array.from(
    new Set([
      modelName,
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ])
  ).filter(Boolean);

  let lastError = null;
  let rawText = '';

  for (const candidate of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: candidate,
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      rawText = response.text();
      if (rawText) break; // Succeeded!
    } catch (err) {
      console.warn(`Model ${candidate} failed:`, err.message);
      lastError = err;
      // If 404 Not Found or not supported, try the next model
      if (
        err.message.includes('404') ||
        err.message.includes('not found') ||
        err.message.includes('not supported')
      ) {
        continue;
      } else {
        // If it's a critical error like quota or invalid key, throw immediately
        throw err;
      }
    }
  }

  if (!rawText) {
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

  const normalizedBubbles = rawBubbles.map((b, idx) => {
    let box = b.box || {};
    if (b.box_2d && Array.isArray(b.box_2d)) {
      const scale = b.box_2d.some((v) => v > 100) ? 10 : 1;
      const [ymin, xmin, ymax, xmax] = b.box_2d.map((v) => v / scale);
      box = {
        x: xmin,
        y: ymin,
        width: Math.max(5, xmax - xmin),
        height: Math.max(3, ymax - ymin),
      };
    } else if (b.x !== undefined && b.y !== undefined) {
      box = {
        x: Number(b.x),
        y: Number(b.y),
        width: Number(b.width || b.w || 30),
        height: Number(b.height || b.h || 12),
      };
    }

    return {
      id: b.id || idx + 1,
      type: b.type || 'speech',
      box: {
        x: Math.max(0, Math.min(95, Number(box.x) || 15)),
        y: Math.max(0, Math.min(95, Number(box.y) || 15)),
        width: Math.max(5, Math.min(90, Number(box.width) || 30)),
        height: Math.max(3, Math.min(60, Number(box.height) || 12)),
      },
      original_text: b.original_text || b.text || b.original || '',
      thai_translation: b.thai_translation || b.translation || b.thai || '',
      speaker_tone: b.speaker_tone || b.tone || '',
    };
  });

  return {
    page_summary: data.page_summary || '',
    bubbles: normalizedBubbles,
  };
}
