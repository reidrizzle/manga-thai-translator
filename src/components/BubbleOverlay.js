'use client';

import React, { useState } from 'react';
import { MessageSquare, Edit3, Eye, Check } from 'lucide-react';

export default function BubbleOverlay({
  bubble,
  showOriginal = false,
  bubbleStyle = {
    fontFamily: 'var(--font-mitr), var(--font-prompt), sans-serif',
    fontSizeScale: 1,
    renderMode: 'lens', // 'lens' | 'patch'
    hideSfx: true,      // ซ่อนเสียงประกอบไม่ให้บังหน้าตัวละคร
  },
  onUpdateBubbleText,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bubble.thai_translation || '');
  const [isHovered, setIsHovered] = useState(false);

  const { box } = bubble;
  if (!box) return null;

  // Sound effects (SFX) exclusion rule:
  // Never render loose ambient sound effects (e.g. 흠칫, 띠링, 쿵, ฟึ่บ) that block character artwork
  const isSfx =
    bubble.type === 'sfx' ||
    (bubble.speaker_tone && bubble.speaker_tone.toLowerCase().includes('sfx')) ||
    (bubble.original_text && bubble.original_text.length <= 3 && !bubble.original_text.includes(' ') && (bubble.thai_translation || '').length <= 4);

  if (isSfx && bubbleStyle.hideSfx !== false) {
    return null;
  }

  if (showOriginal) {
    return null;
  }

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    if (onUpdateBubbleText) {
      onUpdateBubbleText(bubble.id, editText);
    }
  };

  const text = bubble.thai_translation || '';
  const textLen = text.length || 1;

  // Intelligent Manga Typesetting: Proportional Font Sizing
  const lines = text.split('\n').filter(Boolean);
  const numLines = Math.max(lines.length, Math.ceil(textLen / Math.max(3, box.width * 0.42)));
  const maxLineCharCount = Math.max(...(lines.length > 0 ? lines.map((l) => l.length) : [textLen / numLines]), 1);

  // Proportional scaling fitting both box width and box height
  const sizeFromWidth = (box.width / Math.max(2.5, maxLineCharCount)) * 9.2;
  const sizeFromHeight = (box.height / Math.max(1, numLines)) * 1.85;
  let optimalSize = Math.min(sizeFromWidth, sizeFromHeight);

  const userScale = bubbleStyle.fontSizeScale || 1;
  let computedFontSize = Math.max(11, Math.min(26, optimalSize * userScale));

  // Short punchy expressions (e.g., "...?!", "อะไรกัน?!") get prominent comic lettering
  if (textLen <= 6) {
    computedFontSize = Math.max(15, Math.min(28, box.width * 0.55 * userScale));
  }

  // Detect background and text color (Standard white comic bubble vs dark gaming UI status window)
  const isDark =
    bubble.bg_color === 'dark' ||
    bubble.type === 'system' ||
    (bubble.speaker_tone && (bubble.speaker_tone.includes('evil') || bubble.speaker_tone.includes('system')));

  const isNarration = bubble.type === 'narration';
  const isRect = bubble.shape === 'rect' || isNarration || isDark;

  const fontFam = bubbleStyle.fontFamily || 'var(--font-mitr), var(--font-prompt), sans-serif';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        zIndex: isHovered || isEditing ? 35 : 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="manga-bubble-overlay group pointer-events-auto cursor-pointer flex items-center justify-center"
    >
      {/* Speech Bubble / Dialogue Container - Clean Inpainting without outer borders/shadows */}
      <div
        className={`w-full h-full flex items-center justify-center p-1.5 text-center transition-all select-none overflow-hidden ${
          isHovered ? 'ring-1 ring-indigo-400/50' : ''
        }`}
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : '#ffffff',
          color: isDark ? '#ffffff' : '#0a0a0a',
          borderRadius: isRect ? '8px' : '9999px',
          border: 'none',
          boxShadow: 'none',
          fontFamily: fontFam,
        }}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <div
            className="w-full h-full flex flex-col justify-between p-1 bg-indigo-950 text-white rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full h-full bg-slate-900 text-xs text-white p-1 rounded resize-none outline-none border border-indigo-500 font-sans"
            />
            <div className="flex justify-end gap-1 mt-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-2.5 py-0.5 rounded bg-emerald-600 text-[10px] font-bold text-white hover:bg-emerald-500 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>บันทึก</span>
              </button>
            </div>
          </div>
        ) : (
          <p
            className="font-medium tracking-tight whitespace-pre-line text-center break-words leading-tight"
            style={{
              fontSize: `${computedFontSize}px`,
              lineHeight: 1.25,
              color: isDark ? '#ffffff' : '#0a0a0a',
              textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
            }}
          >
            {bubble.thai_translation}
          </p>
        )}
      </div>

      {/* Hover Info Tooltip (Original text & quick edit button) */}
      {isHovered && !isEditing && (
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 min-w-[220px] max-w-[320px] p-2.5 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-left text-xs pointer-events-auto z-50 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
            <span className="font-semibold text-indigo-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {bubble.type.toUpperCase()}
            </span>
            {bubble.speaker_tone && (
              <span className="text-pink-400 bg-pink-950/60 px-1 rounded">
                {bubble.speaker_tone}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {bubble.original_text && (
              <p className="text-[11px] text-slate-400 italic">
                <span className="text-slate-500 font-bold mr-1">ต้นฉบับ:</span>
                {bubble.original_text}
              </p>
            )}
            <p className="text-[11px] text-slate-100 font-medium">
              <span className="text-emerald-400 font-bold mr-1">แปลไทย:</span>
              {bubble.thai_translation}
            </p>
          </div>

          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
            <span>คลิกเพื่อแก้ไขคำแปล</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              แก้ไข
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
