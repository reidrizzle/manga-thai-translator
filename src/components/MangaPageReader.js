'use client';

import React, { useState, useEffect, useRef } from 'react';
import BubbleOverlay from './BubbleOverlay';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ListOrdered,
  Type,
  Grid,
} from 'lucide-react';

export default function MangaPageReader({
  pages,
  onUpdateBubble,
  onToggleScript,
  isScriptOpen,
}) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [fontFamily, setFontFamily] = useState('var(--font-sarabun)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const currentPage = pages[currentPageIndex] || pages[0];

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        goToPrev();
      } else if (e.key === 'o' || e.key === 'O') {
        setShowOriginal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, pages.length]);

  const goToNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const [renderMode, setRenderMode] = useState('lens');
  const [hideSfx, setHideSfx] = useState(true);

  const bubbleStyle = {
    fontFamily: 'var(--font-prompt)',
    fontSizeScale,
    renderMode,
    hideSfx,
  };

  if (!currentPage) return null;

  return (
    <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-between pb-24">
      {/* Top Floating Controls */}
      <div className="sticky top-16 z-30 max-w-2xl w-full px-4 py-2 flex items-center justify-between glass-panel rounded-2xl shadow-xl mt-2 border border-slate-700/80">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentPageIndex === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentPageIndex === 0
                ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                : 'text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </button>

          {/* Page Counter & Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span>หน้า</span>
            <select
              value={currentPageIndex}
              onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
              className="bg-slate-800 text-indigo-400 border border-slate-700 rounded-lg px-2 py-1 outline-none font-mono cursor-pointer"
            >
              {pages.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {idx + 1}
                </option>
              ))}
            </select>
            <span className="text-slate-500">/ {pages.length}</span>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={goToNext}
            disabled={currentPageIndex === pages.length - 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentPageIndex === pages.length - 1
                ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                : 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
            }`}
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Tools */}
        <div className="flex items-center gap-2">
          {/* Original Toggle */}
          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              showOriginal
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="กด 'O' เพื่อดูภาพต้นฉบับ"
          >
            {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">
              {showOriginal ? 'ภาพเดิม' : 'แปลไทย'}
            </span>
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl text-xs text-slate-300 border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-0.5 hover:text-white"
              title="ซูมออก"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-9 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
              className="p-0.5 hover:text-white"
              title="ซูมเข้า"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-0.5 text-indigo-400 hover:text-indigo-300 ml-1"
                title="รีเซ็ตซูม"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Toggle Script */}
          <button
            type="button"
            onClick={onToggleScript}
            className={`p-1.5 rounded-xl border text-xs transition-all ${
              isScriptOpen
                ? 'bg-pink-600 text-white border-pink-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="แผงบทแปล"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            title="เต็มจอ"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Manga Page Viewport */}
      <div className="relative mt-4 flex items-center justify-center w-full px-4 overflow-auto">
        <div
          className="relative max-w-3xl bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden select-none transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Main Image */}
          <img
            src={currentPage.base64}
            alt={currentPage.name || `Page ${currentPageIndex + 1}`}
            className="w-full h-auto block select-none pointer-events-none"
          />

          {/* Overlaid Thai Speech Bubbles */}
          {currentPage.bubbles &&
            currentPage.bubbles.map((bubble) => (
              <BubbleOverlay
                key={bubble.id}
                bubble={bubble}
                showOriginal={showOriginal}
                bubbleStyle={bubbleStyle}
                onUpdateBubbleText={(bubbleId, newText) =>
                  onUpdateBubble(currentPage.id, bubbleId, newText)
                }
              />
            ))}
        </div>
      </div>

      {/* Floating Bottom Quick Thumbnail Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-2 bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-x-auto max-w-full">
        {pages.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setCurrentPageIndex(idx)}
            className={`relative flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              currentPageIndex === idx
                ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/40'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={p.base64} alt={`p${idx + 1}`} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-center font-bold text-slate-200">
              {idx + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
