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
  const [modelName, setModelName] = useState('gemini-3.5-flash');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentTranslateIndex, setCurrentTranslateIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [activeView, setActiveView] = useState('upload'); // 'upload' | 'reader'
  const [globalError, setGlobalError] = useState('');

  // Load saved API key & preferences from LocalStorage and sanitize model
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('manga_gemini_api_key');
      const savedModel = localStorage.getItem('manga_gemini_model');

      const ALLOWED_MODELS = [
        'gemini-3.5-flash',
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
      ];
      if (savedModel && ALLOWED_MODELS.includes(savedModel)) {
        setModelName(savedModel);
      } else {
        setModelName('gemini-3.5-flash');
        localStorage.setItem('manga_gemini_model', 'gemini-3.5-flash');
      }

      // Purge any legacy 'demo' flag so user is never trapped in mock mode
      if (savedKey === 'demo') {
        localStorage.removeItem('manga_gemini_api_key');
        setApiKey('');
      } else if (savedKey) {
        setApiKey(savedKey);
      }
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

  // Update a single bubble's position box in state (drag-to-reposition)
  const handleUpdateBubbleBox = (pageId, bubbleId, newBox) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== pageId) return page;
        const updatedBubbles = page.bubbles.map((b) =>
          b.id === bubbleId ? { ...b, box: newBox } : b
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

  // Translate a single page
  const handleTranslateSinglePage = async (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= pages.length) return;
    setGlobalError('');
    setIsTranslating(true);
    setCurrentTranslateIndex(pageIndex);

    setPages((prev) =>
      prev.map((p, idx) =>
        idx === pageIndex
          ? { ...p, status: 'translating', bubbles: [], error: null }
          : p
      )
    );

    try {
      const currentPage = pages[pageIndex];
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentPage.base64,
          mimeType: currentPage.mimeType || 'image/jpeg',
          sourceLang,
          tonePreset,
          customApiKey: apiKey && apiKey !== 'demo' ? apiKey : null,
          modelName,
          isDemoMode: apiKey === 'demo',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'การแปลล้มเหลว');
      }

      setPages((prev) =>
        prev.map((p, idx) =>
          idx === pageIndex
            ? {
                ...p,
                status: 'done',
                bubbles: data.data.bubbles || [],
                page_summary: data.data.page_summary || '',
              }
            : p
        )
      );
    } catch (err) {
      console.error(`Page ${pageIndex + 1} translation failed:`, err);
      setGlobalError(err.message);
      setPages((prev) =>
        prev.map((p, idx) =>
          idx === pageIndex ? { ...p, status: 'error', error: err.message } : p
        )
      );
    } finally {
      setIsTranslating(false);
    }
  };

  // Start Batch Translation (supports real Gemini API key or 'demo' mode)
  const handleStartTranslateAll = async (overrideKey = null) => {
    const activeKey = overrideKey || apiKey;
    setGlobalError('');
    setIsTranslating(true);
    let hasTranslatedAtLeastOne = false;

    for (let i = 0; i < pages.length; i++) {
      setCurrentTranslateIndex(i);
      const currentPage = pages[i];

      // Delay 2 seconds between pages to respect Free Tier Rate Limits (15 RPM)
      if (i > 0 && activeKey !== 'demo') {
        await new Promise((r) => setTimeout(r, 2000));
      }

      // Mark current page as translating and clear any old bubbles
      setPages((prev) =>
        prev.map((p, idx) =>
          idx === i
            ? { ...p, status: 'translating', bubbles: [], error: null }
            : p
        )
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
            customApiKey: activeKey && activeKey !== 'demo' ? activeKey : null,
            modelName,
            isDemoMode: activeKey === 'demo',
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

        setGlobalError(err.message);

        // If error is about API key, open settings modal so user sees the message
        if (
          err.message.includes('API Key') ||
          err.message.includes('API_KEY_INVALID') ||
          err.message.includes('ไม่พบ Gemini API Key')
        ) {
          setIsSettingsOpen(true);
        }
        break; // Stop translating subsequent pages if there's a fatal key error
      }
    }

    setIsTranslating(false);

    // Switch to Reader view if at least one page succeeded
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
        hasApiKey={Boolean(apiKey) && apiKey !== 'demo'}
        hasPages={pages.length > 0}
        onReset={handleReset}
        onOpenReader={() => setActiveView('reader')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Global Error Banner if any */}
        {globalError && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-sm shadow-xl">
            <div className="flex items-start sm:items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">{globalError}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                onClick={() => handleStartTranslateAll('demo')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white transition-colors"
                title="ทดลองแปลในโหมดจำลองโดยไม่ต้องใช้ API Key"
              >
                ⚡ แปลโหมดจำลอง (ไม่ต้องใช้คีย์)
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 bg-rose-900/90 hover:bg-rose-800 text-xs font-semibold rounded-xl text-white border border-rose-700 transition-colors"
              >
                ใส่ API Key ใหม่
              </button>
            </div>
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
              onStartTranslateAll={() => handleStartTranslateAll()}
              onOpenReader={() => setActiveView('reader')}
              isTranslating={isTranslating}
              onLoadSample={handleLoadSample}
            />

            {/* Quick Switch to Reader - Always visible when pages are uploaded */}
            {pages.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView('reader')}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>เข้าสู่โหมดอ่านการ์ตูน (เปิดอ่านทันที)</span>
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
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 shadow-md transition-all hover:scale-105"
                >
                  ← กลับไปหน้าอัปโหลด
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span>โหมดการอ่าน:</span>
                  <span className="font-semibold text-indigo-400">
                    {readerMode === 'webtoon' ? 'Webtoon Scroll (เลื่อนยาว)' : 'Manga Flip (เปิดทีละหน้า)'}
                  </span>
                </div>
              </div>

              {/* Quick Translate Button from inside the reader */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isTranslating}
                  onClick={() => handleStartTranslateAll()}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isTranslating
                      ? 'bg-indigo-900 text-indigo-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white hover:scale-105'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                  <span>{isTranslating ? 'กำลังแปล...' : 'แปลทุกหน้าด้วย AI'}</span>
                </button>

                <span className="text-xs text-slate-400 hidden sm:inline ml-1 font-mono">
                  {pages.length} หน้า
                </span>
              </div>
            </div>

            {/* Reader Modes */}
            {readerMode === 'webtoon' ? (
              <WebtoonReader
                pages={pages}
                onUpdateBubble={handleUpdateBubble}
                onUpdateBubbleBox={handleUpdateBubbleBox}
                onToggleScript={() => setIsScriptOpen(!isScriptOpen)}
                isScriptOpen={isScriptOpen}
                onStartTranslateAll={() => handleStartTranslateAll()}
                isTranslating={isTranslating}
                onTranslateSinglePage={handleTranslateSinglePage}
              />
            ) : (
              <MangaPageReader
                pages={pages}
                onUpdateBubble={handleUpdateBubble}
                onUpdateBubbleBox={handleUpdateBubbleBox}
                onToggleScript={() => setIsScriptOpen(!isScriptOpen)}
                isScriptOpen={isScriptOpen}
                onStartTranslateAll={() => handleStartTranslateAll()}
                isTranslating={isTranslating}
                onTranslateSinglePage={handleTranslateSinglePage}
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
        globalError={globalError}
        onStartDemoTranslate={() => handleStartTranslateAll('demo')}
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
