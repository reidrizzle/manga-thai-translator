'use client';

import React from 'react';
import {
  Sparkles,
  Settings,
  BookOpen,
  ScrollText,
  KeyRound,
  Languages,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { TONE_PRESETS } from '@/lib/utils';

export default function Navbar({
  readerMode,
  setReaderMode,
  sourceLang,
  setSourceLang,
  tonePreset,
  setTonePreset,
  onOpenSettings,
  hasApiKey,
  hasPages,
  onReset,
}) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lg:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                MangaFlow
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                THAI AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              แปลมังฮวา & มังงะ แปลไทยธรรมชาติ อ่านได้ทันที
            </p>
          </div>
        </div>

        {/* Center Controls (Tone & Source Lang) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {/* Source Language Picker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 font-medium">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>ภาษาต้นทาง:</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 outline-none border border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="auto">🌐 ตรวจจับอัตโนมัติ</option>
              <option value="Korean">🇰🇷 เกาหลี (Manhwa)</option>
              <option value="Japanese">🇯🇵 ญี่ปุ่น (Manga)</option>
              <option value="English">🇺🇸 อังกฤษ (Comic)</option>
              <option value="Chinese">🇨🇳 จีน (Manhua)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Tone Preset Picker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span>สำนวน:</span>
            <select
              value={tonePreset}
              onChange={(e) => setTonePreset(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 outline-none border border-slate-700 hover:border-pink-500 transition-colors cursor-pointer"
            >
              {TONE_PRESETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Reader View Switcher (when pages exist) */}
          {hasPages && (
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setReaderMode('webtoon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  readerMode === 'webtoon'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="โหมด Webtoon (เลื่อนอ่านยาวๆ)"
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Webtoon Scroll</span>
              </button>

              <button
                type="button"
                onClick={() => setReaderMode('manga')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  readerMode === 'manga'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="โหมด Manga (เปิดทีละหน้า)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">เปิดทีละหน้า</span>
              </button>
            </div>
          )}

          {/* Reset / New Upload Button */}
          {hasPages && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all"
              title="อัปโหลดตอนใหม่"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">เพิ่มตอนใหม่</span>
            </button>
          )}

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              hasApiKey
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            }`}
            title="ตั้งค่า Gemini API Key & ตัวเลือกการแปล"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'ตั้งค่า API' : 'ใส่ API Key'}
            </span>
            {!hasApiKey && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
