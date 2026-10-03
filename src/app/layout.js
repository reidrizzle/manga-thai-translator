import { Kanit, Sarabun } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
});

const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
});

export const metadata = {
  title: 'MangaFlow Thai | แปลมังฮวา มังงะ แปลไทยธรรมชาติ อ่านได้ทันที',
  description:
    'เว็บแอปพลิเคชันแปลมังฮวาและมังงะจากภาษาเกาหลี ญี่ปุ่น อังกฤษ แปลไทยด้วย AI สำนวนเป็นธรรมชาติ อ่านออนไลน์ได้ทันทีโดยไม่ต้องโหลดไฟล์',
  keywords: [
    'แปลมังฮวา',
    'แปลมังงะ',
    'manhwa translator',
    'manga translator',
    'แปลไทยธรรมชาติ',
    'อ่านมังฮวาออนไลน์',
    'webtoon reader',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${kanit.variable} ${sarabun.variable} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-manga-bg text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
