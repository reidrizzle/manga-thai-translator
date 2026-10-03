'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UploadZone from '@/components/UploadZone';
import WebtoonReader from '@/components/WebtoonReader';
import MangaPageReader from '@/components/MangaPageReader';
import ScriptPanel from '@/components/ScriptPanel';
import SettingsModal from '@/components/SettingsModal';
import TranslationProgress from '@/components/TranslationProgress';
import { getSamplePages } from '@/lib/sampleData';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ScrollText,
} from 'lucide-react';

export default function HomePage() {
  const [pages, setPages] = useState([]);
  const [readerMode, setReaderMode] = useState('webtoon'); // 'webtoon' | 'manga'
  const [sourceLang, setSourceLang] = useState('auto');
  const [tonePreset, setTonePreset] = useState('manhwa_natural');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentTranslateIndex, setCurrentTranslateIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [activeView, setActiveView] = useState('upload'); // 'upload' | 'reader'
  const [globalError, setGlobalError] = useState('');

  // Load saved API key & preferences from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('manga_gemini_api_key');
      const savedModel = localStorage.getItem('manga_gemini_model');
      if (savedKey) setApiKey(savedKey);
      if (savedModel) setModelName(savedModel);
    }
  }, []);

  // Update a single bubble's Thai text in state
  const handleUpdateBubble = (pageId, bubbleId, newText) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== pageId) return page;
        const updatedBubbles = page.bubbles.map((b) =>
          b.id === bubbleId ? { ...b, thai_translation: newText } : b
        );
        return { ...page, bubbles: updatedBubbles };
      })
    );
  };

  // Load sample manhwa page
  const handleLoadSample = () => {
    const sample = getSamplePages();
    setPages(sample);
    setActiveView('reader');
  };

  // Start Batch Translation
  const handleStartTranslateAll = async () => {
    setGlobalError('');
    setIsTranslating(true);
    let hasTranslatedAtLeastOne = false;

    for (let i = 0; i < pages.length; i++) {
      setCurrentTranslateIndex(i);
      const currentPage = pages[i];

      // Mark current page as translating
      setPages((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: 'translating' } : p))
      );

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentPage.base64,
            mimeType: currentPage.mimeType || 'image/jpeg',
            sourceLang,
            tonePreset,
            customApiKey: apiKey || null,
            modelName,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'การแปลล้มเหลว');
        }

        // Update page with translation results
        setPages((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: 'done',
                  bubbles: data.data.bubbles || [],
                  page_summary: data.data.page_summary || '',
                }
              : p
          )
        );

        hasTranslatedAtLeastOne = true;
      } catch (err) {
        console.error(`Page ${i + 1} translation failed:`, err);
        setPages((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', error: err.message } : p
          )
        );

        // If API key is missing or invalid, open settings modal automatically
        if (
          err.message.includes('API Key') ||
          err.message.includes('API_KEY_INVALID')
        ) {
          setGlobalError(err.message);
          setIsSettingsOpen(true);
          break;
        } else {
          setGlobalError(`หน้า ${i + 1} เกิดข้อผิดพลาด: ${err.message}`);
        }
      }
    }

    setIsTranslating(false);

    // Switch to Reader view once translation finishes
    if (hasTranslatedAtLeastOne) {
      setActiveView('reader');
    }
  };

  const handleReset = () => {
    setPages([]);
    setActiveView('upload');
    setGlobalError('');
  };

  return (
    <div className="min-h-screen bg-manga-bg text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        readerMode={readerMode}
        setReaderMode={setReaderMode}
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        tonePreset={tonePreset}
        setTonePreset={setTonePreset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(apiKey)}
        hasPages={pages.length > 0}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Global Error Banner if any */}
        {globalError && (
          <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm shadow-xl">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 bg-rose-900/80 hover:bg-rose-800 text-xs font-semibold rounded-lg text-white transition-colors"
            >
              เปิดหน้าตั้งค่า
            </button>
          </div>
        )}

        {/* View Switcher: Upload Zone vs Reader */}
        {activeView === 'upload' ? (
          <div className="space-y-10">
            {/* Hero Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>AI Manga & Manhwa Localization Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
                แปลมังฮวาและมังงะ <br className="hidden sm:inline" />
                แปลไทยเป็นธรรมชาติ อ่านได้ทันที
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                อัปโหลดรูปภาพมังฮวาเกาหลี มังงะญี่ปุ่น หรือคอมมิคอังกฤษ ระบบจะสกัดตำแหน่งบอลลูน
                และแปลด้วยสำนวนไทยแท้ๆ ไม่แข็งกระด้าง พร้อมโปรแกรมอ่าน Webtoon ในตัวโดยไม่ต้องดาวน์โหลด
              </p>
            </div>

            {/* Upload Zone */}
            <UploadZone
              pages={pages}
              setPages={setPages}
              onStartTranslateAll={handleStartTranslateAll}
              isTranslating={isTranslating}
              onLoadSample={handleLoadSample}
            />

            {/* Quick Switch to Reader if pages already translated */}
            {pages.some((p) => p.status === 'done') && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveView('reader')}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>เข้าสู่โหมดอ่านมังฮวา (Reader)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reader Sub-Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('upload')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                >
                  ← กลับไปหน้าอัปโหลด
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span>โหมด:</span>
                  <span className="font-semibold text-indigo-400">
                    {readerMode === 'webtoon' ? 'Webtoon Scroll' : 'Manga Page Flip'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {pages.length} หน้าทั้งหมด
                </span>
              </div>
            </div>

            {/* Reader Modes */}
            {readerMode === 'webtoon' ? (
              <WebtoonReader
                pages={pages}
                onUpdateBubble={handleUpdateBubble}
                onToggleScript={() => setIsScriptOpen(!isScriptOpen)}
                isScriptOpen={isScriptOpen}
              />
            ) : (
              <MangaPageReader
                pages={pages}
                onUpdateBubble={handleUpdateBubble}
                onToggleScript={() => setIsScriptOpen(!isScriptOpen)}
                isScriptOpen={isScriptOpen}
              />
            )}
          </div>
        )}
      </main>

      {/* Live Translation Progress Popup */}
      <TranslationProgress
        isTranslating={isTranslating}
        currentPageIndex={currentTranslateIndex}
        totalPages={pages.length}
      />

      {/* Script Sidebar Drawer */}
      <ScriptPanel
        isOpen={isScriptOpen}
        onClose={() => setIsScriptOpen(false)}
        pages={pages}
        onUpdateBubble={handleUpdateBubble}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        modelName={modelName}
        setModelName={setModelName}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} MangaFlow Thai • แปลมังฮวา & มังงะด้วย AI ไม่แข็งกระด้าง</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 14</span>
            <span>•</span>
            <span>Google Gemini AI</span>
            <span>•</span>
            <span>Ready for Render & GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
