'use client';

import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Type,
  HelpCircle,
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  modelName,
  setModelName,
}) {
  const [localKey, setLocalKey] = useState(apiKey || '');
  const [localModel, setLocalModel] = useState(modelName || 'gemini-1.5-flash');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(localKey.trim());
    setModelName(localModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem('manga_gemini_api_key', localKey.trim());
      localStorage.setItem('manga_gemini_model', localModel);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setLocalKey('');
    setApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('manga_gemini_api_key');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">ตั้งค่า Gemini AI & แปลภาษา</h3>
              <p className="text-xs text-slate-400">
                กำหนด API Key สำหรับประมวลผลภาพมังงะ/มังฮวา
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-5 text-sm">
          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-200 flex items-center gap-1.5">
                <span>Google Gemini API Key</span>
                <span className="text-pink-400 text-xs">*</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                ขอรับ API Key ฟรีที่นี่
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
              {localKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ล้างค่า
                </button>
              )}
            </div>

            <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              API Key จะถูกจัดเก็บอย่างปลอดภัยในเบราว์เซอร์ของคุณ (LocalStorage) หรือดึงจาก Server .env
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label className="font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>รุ่นของ AI (Gemini Model)</span>
            </label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="gemini-1.5-flash">
                Gemini 1.5 Flash (แนะนำ - ประมวลผลเร็วที่สุด โควต้าฟรีสูงมาก)
              </option>
              <option value="gemini-2.0-flash">
                Gemini 2.0 Flash (โมเดลเวอร์ชันใหม่ ฉลาด ละเอียด)
              </option>
              <option value="gemini-1.5-pro">
                Gemini 1.5 Pro (แม่นยำสูง สำหรับมังงะตัวหนังสือแน่น/ซับซ้อน)
              </option>
            </select>
          </div>

          {/* Render Deploy Tip */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>เคล็ดลับสำหรับการ Deploy บน Render:</span>
            </div>
            <p>
              เมื่อนำไปขึ้น Render สามารถเพิ่ม Environment Variable ชื่อ{' '}
              <code className="px-1.5 py-0.5 bg-slate-900 text-indigo-300 rounded font-mono">
                GEMINI_API_KEY
              </code>{' '}
              ในแดชบอร์ด Render ได้ทันที ทำให้ผู้ใช้คนอื่นเข้าเว็บแล้วแปลได้ทันทีโดยไม่ต้องใส่คีย์เอง!
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกเรียบร้อย!</span>
              </>
            ) : (
              <span>บันทึกการตั้งค่า</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
