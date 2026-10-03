import { NextResponse } from 'next/server';
import { translateMangaImage } from '@/lib/gemini';

// Set max duration for long AI OCR processing if on Vercel/Render (up to 60s)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      imageBase64,
      mimeType,
      sourceLang,
      tonePreset,
      customApiKey,
      modelName,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'กรุณาอัปโหลดรูปภาพมังงะ/มังฮวา' },
        { status: 400 }
      );
    }

    const result = await translateMangaImage({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      sourceLang: sourceLang || 'auto',
      tonePreset: tonePreset || 'manhwa_natural',
      customApiKey: customApiKey || null,
      modelName: modelName || 'gemini-1.5-flash',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Translation API Error:', error);
    let errorMessage = error.message || 'เกิดข้อผิดพลาดในการประมวลผลการแปล';

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid')) {
      errorMessage = 'Gemini API Key ไม่ถูกต้อง กรุณาตรวจสอบ API Key ในหน้าตั้งค่า';
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota exceeded')) {
      errorMessage = 'โควต้าการใช้งาน Gemini API เต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่';
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
