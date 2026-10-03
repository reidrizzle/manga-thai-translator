import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { apiKey, modelName = 'gemini-2.0-flash' } = await request.json();
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคีย์ กรุณากรอก Gemini API Key' },
        { status: 400 }
      );
    }

    if (key.length < 10) {
      return NextResponse.json(
        { success: false, error: 'คีย์สั้นเกินไป กรุณาระบุ Gemini API Key ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(key);
    const ALLOWED = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-8b',
    ];
    const preferred = ALLOWED.includes(modelName) ? modelName : 'gemini-3.8-flash';
    const candidates = Array.from(new Set([preferred, ...ALLOWED]));

    let lastError = null;
    let success = false;

    for (const cand of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: cand });
        const result = await model.generateContent('ping');
        const response = await result.response;
        if (response.text()) {
          success = true;
          break;
        }
      } catch (err) {
        lastError = err;
        if (
          err.message.includes('API key not valid') ||
          err.message.includes('API_KEY_INVALID')
        ) {
          throw err;
        }
        continue;
      }
    }

    if (!success) {
      throw lastError || new Error('ไม่พบโมเดล Gemini ที่รองรับ');
    }

    return NextResponse.json({
      success: true,
      message: 'API Key ถูกต้องและใช้งานได้ปกติ! ✨',
    });
  } catch (error) {
    console.error('Test Key Error:', error);
    let msg = error.message || 'เกิดข้อผิดพลาดในการตรวจสอบคีย์';
    if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
      msg = 'Gemini API Key นี้ไม่ถูกต้อง หรือถูกปิดใช้งานจาก Google';
    }
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
