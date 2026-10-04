import { NextResponse } from 'next/server';
import { translateMangaImage } from '@/lib/gemini';

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
      isDemoMode,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'กรุณาอัปโหลดรูปภาพมังงะ/มังฮวา' },
        { status: 400 }
      );
    }

    // Resolve effective API Key: prefer custom user key, then server GEMINI_API_KEY
    const hasCustomKey = customApiKey && customApiKey !== 'demo' && customApiKey.length >= 10;
    const effectiveApiKey = hasCustomKey ? customApiKey : (process.env.GEMINI_API_KEY || null);

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'กรุณาระบุ Google Gemini API Key ในหน้าต่างตั้งค่า (คลิกไอคอนฟันเฟือง ⚙️ ด้านบนขวา) เพื่อแปลภาพจริงด้วย AI',
        },
        { status: 400 }
      );
    }

    const result = await translateMangaImage({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      sourceLang: sourceLang || 'auto',
      tonePreset: tonePreset || 'manhwa_natural',
      customApiKey: effectiveApiKey,
      modelName: modelName || 'gemini-3.5-flash',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Translation API Error:', error);
    let errorMessage = error.message || 'เกิดข้อผิดพลาดในการประมวลผลการแปล';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
