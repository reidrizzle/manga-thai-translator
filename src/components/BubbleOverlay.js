'use client';

import React, { useState } from 'react';
import { Edit3, Check, Eye, EyeOff, MessageSquare, Sparkles } from 'lucide-react';

export default function BubbleOverlay({
  bubble,
  scale = 1,
  showOriginal = false,
  bubbleStyle = {
    fontFamily: 'var(--font-sarabun)',
    fontSizeScale: 1,
    bubbleBg: 'white',
    textColor: 'black',
  },
  onUpdateBubbleText,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bubble.thai_translation || '');
  const [isHovered, setIsHovered] = useState(false);

  const { box } = bubble;
  if (!box) return null;

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    if (onUpdateBubbleText) {
      onUpdateBubbleText(bubble.id, editText);
    }
  };

  // Determine bubble colors based on type or style
  const isSfx = bubble.type === 'sfx';
  const isThought = bubble.type === 'thought';
  const isNarration = bubble.type === 'narration';

  // Base background
  let bgClass = 'bg-white text-black shadow-md border border-slate-300';
  if (bubbleStyle.bubbleBg === 'dark' || (bubble.speaker_tone && bubble.speaker_tone.includes('evil'))) {
    bgClass = 'bg-slate-900 text-white shadow-lg border border-slate-700';
  } else if (bubbleStyle.bubbleBg === 'transparent') {
    bgClass = 'bg-white/90 text-black backdrop-blur-[2px] border border-slate-300/80';
  } else if (isNarration) {
    bgClass = 'bg-amber-50 text-slate-900 border-2 border-slate-800 rounded-sm';
  }

  // Calculate dynamic font size based on bubble dimensions
  const baseFontSize = Math.max(10, Math.min(18, (box.width * 0.45) * bubbleStyle.fontSizeScale));

  if (showOriginal) {
    // When user holds toggle to see original image without any masks
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        zIndex: isHovered || isEditing ? 30 : 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="manga-bubble-overlay group pointer-events-auto cursor-pointer"
    >
      {/* Bubble Container with clean cover */}
      <div
        className={`w-full h-full rounded-2xl flex items-center justify-center p-1.5 overflow-hidden transition-all text-center select-none ${bgClass}`}
        style={{
          borderRadius: isNarration ? '4px' : '48%',
          fontFamily: bubbleStyle.fontFamily || 'var(--font-sarabun)',
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
              className="w-full h-full bg-slate-900 text-xs text-white p-1 rounded resize-none outline-none border border-indigo-500"
            />
            <div className="flex justify-end gap-1 mt-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-2 py-0.5 rounded bg-emerald-600 text-[10px] font-bold text-white hover:bg-emerald-500"
              >
                บันทึก
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`font-semibold leading-tight break-words line-clamp-6 text-center ${
              isSfx ? 'italic font-black text-rose-600 tracking-wider' : ''
            }`}
            style={{
              fontSize: `${baseFontSize}px`,
              lineHeight: 1.25,
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
            <span>คลิกเพื่อแก้ไขข้อความ</span>
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
