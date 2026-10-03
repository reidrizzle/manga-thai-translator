/**
 * Utility functions for MangaFlow Translator
 */

/**
 * Convert a File object to Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Translation style presets for natural Manga/Manhwa Thai tone
 */
export const TONE_PRESETS = [
  {
    id: 'manhwa_natural',
    name: 'สำนวนมังฮวามาตรฐาน (แนะนำ)',
    desc: 'ภาษาพูดมีชีวิตชีวา อารมณ์การ์ตูนแท้ๆ คำสร้อยเป็นธรรมชาติ ไม่แข็งกระด้าง',
    promptModifier: 'แปลด้วยสำนวนมังฮวาเกาหลี/การ์ตูนไทย มีความกระชับ เป็นภาษาพูดที่คนไทยคุยกันจริงๆ สอดแทรกคำลงท้าย เช่น สิ, ล่ะ, ซะงั้น, วะ, โว้ย ตามสถานการณ์และความสนิท'
  },
  {
    id: 'action_epic',
    name: 'สำนวนแอ็กชันดุดัน (Action / Hunter)',
    desc: 'ทรงพลัง ดุดัน คำราม ฮึกเหิม เหมาะกับมังฮวาระบบ ดันเจี้ยน หรือต่อสู้',
    promptModifier: 'แปลด้วยสำนวนดุดัน หนักแน่น ฮึกเหิม อารมณ์การต่อสู้ในดันเจี้ยนหรือมังฮวาฮันเตอร์/พลังพิเศษ ใช้น้ำเสียงจริงจัง เด็ดขาด'
  },
  {
    id: 'romance_sweet',
    name: 'สำนวนโรแมนซ์ / ดราม่า (Romance / Drama)',
    desc: 'อ่อนหวาน นุ่มนวล มีเสน่ห์ เหมาะกับมังฮวานางร้าย/โรมานซ์แฟนตาซี',
    promptModifier: 'แปลด้วยสำนวนหวานนุ่มนวล สุภาพ หรือหยอกล้ออย่างมีเสน่ห์ เหมาะกับการ์ตูนรัก โรแมนซ์แฟนตาซี ชนชั้นสูง คำราชาศัพท์หรือคำสุภาพตามฐานะ'
  },
  {
    id: 'comedy_fun',
    name: 'สำนวนคอมเมดี้เฮฮา (Comedy / Slice of Life)',
    desc: 'ตลก ฮา กวนประสาท ใช้ศัพท์วัยรุ่นไทยเข้ากับมุกตลก',
    promptModifier: 'แปลด้วยสำนวนตลกขบขัน มุกตลกธรรมชาติ ใช้ภาษาพูดกวนๆ หรือศัพท์วัยรุ่นที่เข้ากับจังหวะคอมเมดี้ได้ดีเยี่ยม'
  },
];

/**
 * Generate a unique ID
 */
export const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
