'use client';

import React, { useState } from 'react';
import { MessageSquare, Edit3, Eye } from 'lucide-react';

export default function BubbleOverlay({
  bubble,
  showOriginal = false,
  bubbleStyle = {
    fontFamily: 'var(--font-prompt)',
    fontSizeScale: 1,
    renderMode: 'lens', // 'lens' (เหมือนแอปแปลภาษา ไม่บังภาพ) | 'patch' (ลบคำเดิมทับเนียน)
    hideSfx: true,      // ซ่อนเสียงประกอบไม่ให้บังหน้าตัวละคร
  },
  onUpdateBubbleText,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bubble.thai_translation || '');
  const [isHovered, setIsHovered] = useState(false);

  const { box } = bubble;
  if (!box) return null;

  // Rule: If it's a sound effect (SFX) and hideSfx is enabled, do not render to avoid covering art/faces
  const isSfx =
    bubble.type === 'sfx' ||
    (bubble.original_text && bubble.original_text.length <= 4 && !bubble.original_text.includes(' '));

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

  const isNarration = bubble.type === 'narration';
  const text = bubble.thai_translation || '';
  const textLen = text.length || 1;

  // Dynamic Font Size Auto-Calculation:
  // Fits proportionally inside the speech bubble just like original comic typesetting
  // width and height are in percentages (e.g. width: 25%, height: 12%)
  const boxArea = box.width * box.height;
  const estimatedCharsPerLine = Math.max(3, Math.floor(box.width / 2.2));
  const estimatedLines = Math.max(1, Math.ceil(textLen / estimatedCharsPerLine));

  // Compute font size in px scaled to container
  let computedFontSize = Math.max(
    11,
    Math.min(22, (box.height / estimatedLines) * 2.1 * (bubbleStyle.fontSizeScale || 1))
  );

  if (textLen < 6) {
    computedFontSize = Math.max(13, Math.min(24, box.width * 0.45 * (bubbleStyle.fontSizeScale || 1)));
  }

  // Styling based on renderMode
  const isLensMode = bubbleStyle.renderMode === 'lens';

  // In Lens mode: Looks like Google Translate / Papago Manga lens (clean, seamless, subtle backdrop)
  // In Patch mode: Soft clean white patch covering the foreign words
  let containerBg = 'bg-white/95 text-slate-900 border border-slate-200/80 shadow-sm';
  let textShadowStyle = {};

  if (isLensMode) {
    containerBg =
      'bg-white/90 backdrop-blur-[1px] text-slate-950 border border-slate-300/60 shadow-md';
  }

  if (isNarration) {
    containerBg = 'bg-amber-50/95 text-amber-950 border border-amber-300 shadow-sm';
  } else if (bubble.speaker_tone && bubble.speaker_tone.includes('evil')) {
    containerBg = 'bg-slate-950/95 text-white border border-purple-500/50 shadow-md';
  }

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
      {/* Speech Bubble / Dialogue Container */}
      <div
        className={`w-full h-full rounded-2xl flex items-center justify-center p-2 text-center transition-all select-none overflow-hidden ${containerBg}`}
        style={{
          borderRadius: isNarration ? '6px' : '18px',
          fontFamily: bubbleStyle.fontFamily || 'var(--font-prompt)',
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
                className="px-2.5 py-0.5 rounded bg-emerald-600 text-[10px] font-bold text-white hover:bg-emerald-500"
              >
                บันทึก
              </button>
            </div>
          </div>
        ) : (
          <p
            className="font-bold leading-tight break-words text-center tracking-tight"
            style={{
              fontSize: `${computedFontSize}px`,
              lineHeight: 1.22,
              color: bubble.speaker_tone && bubble.speaker_tone.includes('evil') ? '#ffffff' : '#0f172a',
            }}
          >
            {bubble.thai_translation}
          </p>
        )}
      </div>

      {/* Hover Info Tooltip (Shows original vs Thai and Tone) */}
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
