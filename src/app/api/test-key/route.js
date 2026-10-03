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
    const candidates = Array.from(
      new Set([
        modelName,
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
      ])
    ).filter(Boolean);

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
        if (err.message.includes('404') || err.message.includes('not found')) {
          continue;
        }
        throw err;
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
