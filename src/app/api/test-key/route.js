import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { apiKey, modelName = 'gemini-1.5-flash' } = await request.json();
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคีย์ กรุณากรอก Gemini API Key' },
        { status: 400 }
      );
    }

    if (!key.startsWith('AIzaSy')) {
      return NextResponse.json(
        {
          success: false,
          error: `คีย์นี้ขึ้นต้นด้วย "${key.substring(0, 5)}..." ซึ่งไม่ใช่รูปแบบของ Google Gemini API Key (คีย์ที่ถูกต้องจาก Google AI Studio จะต้องขึ้นต้นด้วย "AIzaSy...")`,
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(key);
    const targetModel = modelName.includes('gemini') ? modelName : 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: targetModel });

    const result = await model.generateContent('ping');
    const response = await result.response;
    const text = response.text();

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
