# 📖 MangaFlow Thai - เว็บแปลมังฮวา & มังงะด้วย AI อ่านได้ทันที

เว็บแอปพลิเคชันสำหรับแปลการ์ตูน มังฮวา (Manhwa เกาหลี), มังงะ (Manga ญี่ปุ่น), คอมมิค (Comic อังกฤษ) หรือมังฮัว (Manhua จีน) แปลออกมาเป็นภาษาไทยด้วย **Google Gemini Vision AI** โดยเน้น **สำนวนภาษาไทยที่เป็นธรรมชาติ ไม่แข็งกระด้าง มีอารมณ์ขัน/ดุดันตามบริบทตัวละคร** และ **สามารถเปิดอ่านออนไลน์ได้ทันทีในเว็บในโหมด Webtoon Scroll หรือเปิดทีละหน้า โดยไม่ต้องดาวน์โหลดไฟล์**

---

## ✨ ฟีเจอร์เด่น (Key Features)

1. **AI Vision Localization (ตรวจจับแม่นยำระดับพิกเซลด้วย Google box_2d)**
   - ใช้ Gemini Multimodal Vision ตรวจจับพิกัด `box_2d: [ymin, xmin, ymax, xmax]` วางตำแหน่งข้อความทับกรอบเดิมได้อย่างแม่นยำ ไม่เลื่อนไม่ลอย
   - **ระบบ Two-Phase Pipeline**: สแกนอ่านข้อความต้นฉบับและบันทึกพิกัดตำแหน่ง (OCR) ทั้งหมดก่อน จากนั้นจึงแปลไทยและนำไปแทนที่ข้อความเดิมทีละจุดอย่างเป็นธรรมชาติ
   - ปรับสำนวนได้ 4 รูปแบบ:
     - 🌟 **สำนวนมังฮวามาตรฐาน**: ภาษาพูดลื่นไหล มีคำสร้อยเป็นธรรมชาติ (สิ, ล่ะ, ซะงั้น, วะ, โว้ย)
     - ⚔️ **สำนวนแอ็กชันดุดัน**: ฮึกเหิม ทรงพลัง เหมาะกับมังฮวาดันเจี้ยน / ฮันเตอร์ / ต่อสู้
     - 🌸 **สำนวนโรแมนซ์ / ดราม่า**: อ่อนหวาน นุ่มนวล เหมาะกับการ์ตูนรัก โรแมนซ์แฟนตาซี
     - 🤣 **สำนวนคอมเมดี้เฮฮา**: ตลก กวนประสาท จังหวะโบ๊ะบ๊ะ เข้าปากคนไทย
2. **โปรแกรมอ่านในตัว (In-Browser Reader - ไม่ต้องดาวน์โหลด)**
   - 📜 **Webtoon Scroll Mode**: เลื่อนอ่านยาวๆ แบบต่อเนื่อง สไตล์ Kakao / Line Webtoon พร้อมหลอดเปอร์เซ็นต์การอ่าน
   - 📖 **Manga Page Flip Mode**: เปิดอ่านทีละหน้า พร้อมปุ่มลัดคีย์บอร์ด (ลูกศรซ้าย/ขวา หรือ A / D), แถบ Thumbnail ด้านล่าง และระบบซูมภาพ
3. **Smart Bubble Overlay (3 รูปแบบการแสดงผลตามใจชอบ)**
   - ✨ **โปร่งใส (Clear - ค่าเริ่มต้น)**: พื้นหลังใส 0% ไม่มีกล่องหรือขอบดำมาบดบังหน้าตัวละคร มี Halo Stroke สีขาวอ่านชัดบนทุกฉาก
   - 🪟 **กล่องใส (Lens)**: กล่องโปร่งแสง Frosted Glass ละมุนตา ไม่บังลายเส้น
   - 🛡️ **กล่องเนียน (Patch)**: พื้นหลังสีขาว/ดำกลืนไปกับบอลลูนเดิม ลบคำเก่าอย่างแนบเนียน
   - กดปุ่ม **`O`** หรือคลิกสลับดูภาพต้นฉบับกับภาพแปลไทยได้ทันที
   - เลื่อนเมาส์ชี้บอลลูนเพื่อดูบทพูดภาษาต้นฉบับเทียบกับภาษาไทย และคลิกเพื่อแก้ไขคำแปลได้แบบเรียลไทม์
4. **Script & Dialogue Panel**
   - แถบด้านข้างรวบรวมบทสนทนาทุกประโยค พร้อมปุ่มคลิกเดียวเพื่อคัดลอกบทแปลทั้งหมด (Copy Script)
5. **รองรับ Multi-page & Drag-and-Drop**
   - อัปโหลดพร้อมกันได้หลายหน้า (หน้า 1, 2, 3...) จัดลำดับหน้าได้อิสระ
   - แปลทีเดียวครบทุกหน้าพร้อมแถบความคืบหน้าแบบ Real-time
6. **Bring Your Own Key (BYOK) & Server Config**
   - มีช่องให้ใส่ Gemini API Key ในหน้าตั้งค่าของเว็บ (บันทึกลง LocalStorage ปลอดภัย)
   - หรือตั้งค่าผ่าน Environment Variable `GEMINI_API_KEY` สำหรับ Server (Render)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: Next.js 14 (App Router, Standalone Deploy Ready)
- **UI & Styling**: React 18, Tailwind CSS, Lucide Icons, Glassmorphism Dark Theme
- **Fonts**: Kanit & Sarabun (Google Fonts)
- **AI Engine**: Google Generative AI (`@google/generative-ai` - Gemini 1.5 Flash / 2.0 Flash)

---

## 🚀 วิธีการรันในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์นี้ แล้วรัน:
```bash
npm install
```

### 2. กำหนด API Key (ทำได้ 2 วิธี)
- **วิธีที่ 1 (ใส่ในไฟล์ .env.local)**:
  ก๊อปปี้ไฟล์ `.env.example` เป็น `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
  จากนั้นเปิดไฟล์ `.env.local` แล้วใส่ API Key ของคุณ:
  ```env
  GEMINI_API_KEY=AIzaSy...
  ```
  *(สามารถขอรับ Google Gemini API Key ได้ฟรีที่ [Google AI Studio](https://aistudio.google.com/app/apikey))*

- **วิธีที่ 2 (ใส่ในหน้าเว็บ)**:
  เปิดเว็บขึ้นมาแล้วกดปุ่ม **"ตั้งค่า API"** ที่มุมขวาบน แล้วนำ API Key มาวางได้เลย

### 3. รัน Development Server
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 📦 วิธีนำขึ้น GitHub (Push to GitHub)

หากคุณยังไม่ได้สร้าง Git Repository ในเครื่อง ให้ทำตามขั้นตอนดังนี้:

```bash
# 1. เริ่มต้น Git
git init

# 2. เพิ่มไฟล์ทั้งหมด
git add .

# 3. Commit ไฟล์
git commit -m "Initial commit: MangaFlow Thai translator and reader"

# 4. เปลี่ยนชื่อ Branch หลักเป็น main
git branch -M main

# 5. เชื่อมต่อกับ GitHub Repo ของคุณ (แทนที่ URL ด้วยของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push ขึ้น GitHub
git push -u origin main
```

---

## 🌐 วิธีนำไป Deploy บน Render (Deploy to Render)

เว็บแอปพลิเคชันนี้ถูกเตรียมไฟล์ `render.yaml` ไว้ให้แล้ว สามารถ Deploy บน Render ได้อย่างง่ายดาย:

### ขั้นตอนการ Deploy:
1. เข้าไปที่ [Render.com](https://render.com) และลงชื่อเข้าใช้ (Login ด้วย GitHub)
2. คลิกที่ปุ่ม **New +** ที่มุมขวาบน แล้วเลือก **Web Service**
3. เลือก Repository บน GitHub ของคุณที่เพิ่ง Push ขึ้นไป (เช่น `manga-thai-translator`)
4. ตั้งค่าดังนี้:
   - **Name**: `manga-thai-translator` (หรือชื่อตามใจชอบ)
   - **Region**: `Singapore` (ใกล้ไทย ตอบสนองไวที่สุด)
   - **Branch**: `main`
   - **Root Directory**: ปล่อยว่างไว้
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`
5. **การตั้งค่า Environment Variables (สำคัญ)**:
   - เลื่อนลงมาที่หัวข้อ **Environment Variables**
   - เพิ่ม Key: `GEMINI_API_KEY`
   - Value: ใส่ Gemini API Key ของคุณ (จาก Google AI Studio)
   - เพิ่ม Key: `NODE_ENV`
   - Value: `production`
6. คลิก **Deploy Web Service**
7. รอประมาณ 2-3 นาที เมื่อสถานะขึ้นเป็น **Live** คุณจะได้ URL เช่น `https://manga-thai-translator.onrender.com` นำไปใช้งานหรือแชร์ให้ผู้อื่นอ่านได้ทันที!

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
Next_Justforfun/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── translate/route.js    # API Endpoint สำหรับเรียกใช้ Gemini Vision
│   │   ├── layout.js                 # Layout หลัก โหลดฟอนต์ Kanit, Sarabun และ SEO
│   │   ├── page.js                   # หน้าแดชบอร์ดหลัก และตัวควบคุมการอ่าน
│   │   └── globals.css               # สไตล์ธีมมืด กลัสมอร์ฟิซึม แอนิเมชัน
│   ├── components/
│   │   ├── Navbar.js                 # แถบเมนูด้านบน เลือกระดับภาษา สำนวน และ API
│   │   ├── UploadZone.js             # กล่อง Drag-and-Drop รองรับอัปโหลดหลายหน้า
│   │   ├── WebtoonReader.js          # โปรแกรมอ่านสไตล์ Webtoon สกรอลล์ยาวต่อเนื่อง
│   │   ├── MangaPageReader.js        # โปรแกรมอ่านมังงะแบบเปิดทีละหน้า พร้อมปุ่มลัด
│   │   ├── BubbleOverlay.js          # วางข้อความภาษาไทยทับบอลลูน แก้ไขได้แบบสดๆ
│   │   ├── ScriptPanel.js            # แผงสคริปต์บทสนทนา คัดลอกได้ในคลิกเดียว
│   │   ├── SettingsModal.js          # ป๊อปอัปตั้งค่า Gemini API Key และโมเดล
│   │   └── TranslationProgress.js    # แถบแสดงความคืบหน้าการแปลแบบเรียลไทม์
│   └── lib/
│       ├── gemini.js                 # โมดูลคุยกับ Gemini Vision และ Prompt แปลไทย
│       ├── utils.js                  # ตัวช่วยแปลงรูปภาพและ Presets สำนวน
│       └── sampleData.js             # ข้อมูลตัวอย่างมังฮวาสำหรับการทดสอบทันที
├── render.yaml                       # Blueprint คอนฟิกสำหรับการ Deploy บน Render
├── package.json                      # รายการ Dependencies และ Scripts
├── tailwind.config.js                # การตั้งค่าชุดสีธีมมังงะ
├── next.config.js                    # การตั้งค่า Next.js
└── README.md                         # คู่มือการใช้งานฉบับสมบูรณ์
```

---

## 💡 สรุปการใช้งานปุ่มลัด (Keyboard Shortcuts)
- **`O`**: สลับดูภาพต้นฉบับ / ภาพแปลไทย
- **`ArrowRight` / `D`**: หน้าถัดไป (ในโหมดเปิดทีละหน้า)
- **`ArrowLeft` / `A`**: หน้าย้อนกลับ (ในโหมดเปิดทีละหน้า)
- **`ดับเบิลคลิก หรือคลิกที่บอลลูน`**: แก้ไขข้อความแปลไทยได้ทันที
