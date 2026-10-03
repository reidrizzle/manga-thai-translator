'use client';

import React, { useState, useEffect, useRef } from 'react';
import BubbleOverlay from './BubbleOverlay';
import {
  Eye,
  EyeOff,
  Sliders,
  Maximize2,
  Minimize2,
  ListOrdered,
  ChevronUp,
  Sparkles,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Type,
} from 'lucide-react';

export default function WebtoonReader({
  pages,
  onUpdateBubble,
  onToggleScript,
  isScriptOpen,
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [containerWidth, setContainerWidth] = useState(720); // default webtoon width
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [fontFamily, setFontFamily] = useState('var(--font-sarabun)');
  const [bubbleBg, setBubbleBg] = useState('white'); // 'white' | 'dark' | 'transparent'
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef(null);

  // Track scroll percentage
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(Math.round(progress));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut: Hold Space or Press O to peek original
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'o' || e.key === 'O') {
        setShowOriginal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const bubbleStyle = {
    fontFamily,
    fontSizeScale,
    bubbleBg,
  };

  return (
    <div ref={readerRef} className="relative w-full min-h-screen pb-32">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Reader Toolbar (Sticky at bottom or top) */}
      <aside aria-label="Reader Controls" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] sm:w-auto glass-panel px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between sm:justify-center gap-3 backdrop-blur-xl">
        {/* Toggle Translated vs Original */}
        <button
          type="button"
          onClick={() => setShowOriginal(!showOriginal)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${showOriginal
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            }`}
          title="กดคีย์ 'O' เพื่อสลับดูภาพต้นฉบับ"
        >
          {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showOriginal ? 'ภาพต้นฉบับ' : 'แปลไทย (AI)'}</span>
        </button>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        {/* Width adjustment buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setContainerWidth(600)}
            className={`px-2 py-1 rounded-lg ${containerWidth === 600 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            แคบ
          </button>
          <button
            type="button"
            onClick={() => setContainerWidth(720)}
            className={`px-2 py-1 rounded-lg ${containerWidth === 720 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            ปกติ
          </button>
          <button
            type="button"
            onClick={() => setContainerWidth(900)}
            className={`px-2 py-1 rounded-lg ${containerWidth === 900 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            กว้าง
          </button>
        </div>

        {/* Font Size Scaling */}
        <div className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <button
            type="button"
            onClick={() => setFontSizeScale((s) => Math.max(0.7, s - 0.1))}
            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
            title="ลดขนาดตัวหนังสือ"
          >
            -
          </button>
          <span className="text-[11px] font-mono">{Math.round(fontSizeScale * 100)}%</span>
          <button
            type="button"
            onClick={() => setFontSizeScale((s) => Math.min(1.5, s + 0.1))}
            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
            title="เพิ่มขนาดตัวหนังสือ"
          >
            +
          </button>
        </div>

        {/* Script Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleScript}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${isScriptOpen
              ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          title="เปิด/ปิด แผงสคริปต์บทแปล"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span className="hidden md:inline">บทแปล</span>
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="เต็มจอ"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Scroll percentage */}
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {scrollProgress}%
        </span>
      </aside>

      {/* Pages Vertical Strip */}
      <div
        className="mx-auto flex flex-col items-center gap-0 pt-4"
        style={{ maxWidth: `${containerWidth}px` }}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={page.id}
            id={`webtoon-page-${pageIndex}`}
            className="relative w-full select-none bg-slate-950 shadow-2xl transition-all"
          >
            {/* Page Image */}
            <img
              src={page.base64}
              alt={page.name || `Page ${pageIndex + 1}`}
              className="w-full h-auto block select-none pointer-events-none"
              loading={pageIndex < 3 ? 'eager' : 'lazy'}
            />

            {/* In-Image Speech Bubble Overlays */}
            {page.bubbles &&
              page.bubbles.map((bubble) => (
                <BubbleOverlay
                  key={bubble.id}
                  bubble={bubble}
                  showOriginal={showOriginal}
                  bubbleStyle={bubbleStyle}
                  onUpdateBubbleText={(bubbleId, newText) =>
                    onUpdateBubble(page.id, bubbleId, newText)
                  }
                />
              ))}

            {/* Page number floating watermark */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-slate-400 pointer-events-none font-mono">
              {pageIndex + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll to Top floating button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-6 p-3 rounded-2xl glass-panel text-slate-300 hover:text-white hover:border-indigo-500 shadow-xl transition-all"
        title="กลับไปบนสุด"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}
