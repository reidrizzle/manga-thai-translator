'use client';

import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  HelpCircle,
  Sparkles,
  Loader2,
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
  const [testStatus, setTestStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'loading' | 'success' | 'error'

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!localKey.trim()) {
      setTestStatus({
        state: 'error',
        message: 'กรุณากรอก API Key ก่อนทำการทดสอบ',
      });
      return;
    }

    if (!localKey.trim().startsWith('AIzaSy')) {
      setTestStatus({
        state: 'error',
        message: `คีย์นี้ขึ้นต้นด้วย "${localKey.substring(0, 5)}..." ไม่ใช่ Google Gemini API Key จริง (คีย์จาก Google AI Studio จะต้องขึ้นต้นด้วย "AIzaSy...")`,
      });
      return;
    }

    setTestStatus({ state: 'loading', message: 'กำลังทดสอบเชื่อมต่อกับ Google Gemini...' });

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: localKey.trim(), modelName: localModel }),
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus({
          state: 'success',
          message: '✓ ยอดเยี่ยม! API Key ใช้งานได้ปกติ พร้อมแปลมังฮวาแล้ว',
        });
      } else {
        setTestStatus({
          state: 'error',
          message: data.error || 'API Key ไม่ถูกต้อง',
        });
      }
    } catch (err) {
      setTestStatus({
        state: 'error',
        message: 'การเชื่อมต่อล้มเหลว: ' + err.message,
      });
    }
  };

  const handleSave = () => {
    const trimmed = localKey.trim();
    setApiKey(trimmed);
    setModelName(localModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem('manga_gemini_api_key', trimmed);
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
    setTestStatus({ state: 'idle', message: '' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('manga_gemini_api_key');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all">
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
                กำหนด Google Gemini API Key เพื่อแปลภาพมังฮวา
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
        <div className="mt-5 space-y-4 text-sm">
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
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold"
              >
                ขอรับ API Key ฟรี (Google AI Studio)
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="text"
                value={localKey}
                onChange={(e) => {
                  setLocalKey(e.target.value);
                  setTestStatus({ state: 'idle', message: '' });
                }}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
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

            {/* Hint about AIzaSy format */}
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                💡 คีย์ของแท้จะขึ้นต้นด้วย <code className="text-emerald-400 font-mono">AIzaSy...</code> (39 ตัวอักษร)
              </span>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testStatus.state === 'loading'}
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
              >
                {testStatus.state === 'loading' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-pink-400" />
                )}
                <span>ทดสอบคีย์</span>
              </button>
            </div>

            {/* Test Status Banner */}
            {testStatus.message && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                  testStatus.state === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : testStatus.state === 'loading'
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                {testStatus.state === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : testStatus.state === 'loading' ? (
                  <Loader2 className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="gemini-1.5-flash">
                Gemini 1.5 Flash (แนะนำ - ประมวลผลเร็วที่สุด แม่นยำ และฟรี)
              </option>
              <option value="gemini-2.0-flash">
                Gemini 2.0 Flash (โมเดลรุ่นใหม่ล่าสุด ฉลาด ละเอียด)
              </option>
              <option value="gemini-1.5-pro">
                Gemini 1.5 Pro (แม่นยำสูง สำหรับมังงะตัวหนังสือแน่น/ซับซ้อน)
              </option>
            </select>
          </div>

          {/* How to get key guidance */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-slate-200">วิธีขอรับ Gemini API Key ฟรีใน 1 นาที:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[11px]">
              <li>เข้าเว็บ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 underline">aistudio.google.com</a> ล็อกอินด้วย Google</li>
              <li>คลิกปุ่มสีฟ้า <strong>"Create API key"</strong></li>
              <li>คัดลอกคีย์ที่ขึ้นต้นด้วย <strong>AIzaSy...</strong> มาวางในช่องนี้ แล้วกดบันทึก</li>
            </ol>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ปิด
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
