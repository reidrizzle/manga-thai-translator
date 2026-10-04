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

    // Only return mock demo data if NO valid API key exists anywhere on server or client
    if (!effectiveApiKey) {
      if (isDemoMode || customApiKey === 'demo') {
        return NextResponse.json({
          success: true,
          data: {
            page_summary: 'โหมดจำลอง (ยังไม่ได้ใส่ API Key) - กรุณาใส่ Gemini API Key ในหน้าต่างตั้งค่าเพื่อแปลภาพจริง',
            bubbles: [
              {
                id: 1,
                type: 'narration',
                box: { x: 39.0, y: 54.4, width: 44.0, height: 8.5 },
                original_text: "A FEW DAYS AFTER THE 'AIDEN BEAM' PIERCED THE SKY.",
                thai_translation: "ไม่กี่วันหลังจากที่ 'ลำแสงของไอเดน' พุ่งทะลวงขึ้นไปบนท้องฟ้า",
                speaker_tone: 'บรรยาย',
              },
              {
                id: 2,
                type: 'narration',
                box: { x: 13.0, y: 71.8, width: 45.0, height: 8.8 },
                original_text: "EXACTLY AS AIDEN INTENDED, THE NOBLES' COMPLAINTS COMPLETELY SUBSIDED.",
                thai_translation: 'เป็นไปตามที่ไอเดนต้องการ ข้อร้องเรียนของพวกขุนนางเงียบลงอย่างสิ้นเชิง',
                speaker_tone: 'บรรยาย',
              },
            ],
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบ Gemini API Key กรุณาระบุในหน้าตั้งค่า (คลิกไอคอนฟันเฟืองด้านบน) หรือตั้งค่า GEMINI_API_KEY ใน Render / .env',
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
