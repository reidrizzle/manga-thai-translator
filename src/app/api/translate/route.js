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

    // Demo Mode: Allow testing even without a Gemini API Key
    if (isDemoMode || customApiKey === 'demo') {
      return NextResponse.json({
        success: true,
        data: {
          page_summary: 'ตัวอย่างการแปลโหมดจำลอง (Demo Localization)',
          bubbles: [
            {
              id: 1,
              type: 'speech',
              box: { x: 14.0, y: 14.0, width: 44.0, height: 18.0 },
              original_text: 'It felt a bit excessive, but the operation was essentially a success.',
              thai_translation: 'ถึงจะดูเกินเบอร์ไปหน่อย แต่ปฏิบัติการครั้งนี้ถือว่าสำเร็จลุล่วงด้วยดีล่ะนะ!',
              speaker_tone: 'โล่งอก / สบายใจ',
            },
            {
              id: 2,
              type: 'speech',
              box: { x: 14.0, y: 72.0, width: 44.0, height: 18.0 },
              original_text: "If there was a downside, it was that Dame Noel's guard had gone up.",
              thai_translation: 'แต่ถ้าจะมีจุดเสียอยู่บ้าง... ก็ตรงที่คุณหญิงโนเอลเริ่มระวังตัวแจขึ้นมาเนี่ยสิ!',
              speaker_tone: 'ครุ่นคิด / เป็นกังวล',
            },
          ],
        },
      });
    }

    const result = await translateMangaImage({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      sourceLang: sourceLang || 'auto',
      tonePreset: tonePreset || 'manhwa_natural',
      customApiKey: customApiKey || null,
      modelName: modelName || 'gemini-3.8-flash', // was 'gemini-1.5-flash' — old/wrong model
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
