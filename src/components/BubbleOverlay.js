'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Edit3, Eye, Check, Move } from 'lucide-react';

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
  onUpdateBubbleBox,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bubble.thai_translation || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const overlayRef = useRef(null);
  const dragStartRef = useRef(null);

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

  // Drag-and-drop repositioning:
  // Allows user to drag any speech bubble if AI placement needs fine-tuning
  const handleMouseDown = (e) => {
    if (isEditing) return;
    if (e.button !== 0) return; // Only left click

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: box.x,
      initialY: box.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!dragStartRef.current || !overlayRef.current) return;
      const parent = overlayRef.current.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartRef.current.startX) / parentRect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.startY) / parentRect.height) * 100;

      setDragOffset({ x: deltaXPercent, y: deltaYPercent });
    };

    const handleMouseUp = () => {
      if (dragStartRef.current && onUpdateBubbleBox) {
        const finalX = Math.max(0, Math.min(95, dragStartRef.current.initialX + dragOffset.x));
        const finalY = Math.max(0, Math.min(95, dragStartRef.current.initialY + dragOffset.y));
        onUpdateBubbleBox(bubble.id, {
          ...box,
          x: Number(finalX.toFixed(2)),
          y: Number(finalY.toFixed(2)),
        });
      }
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, box, bubble.id, onUpdateBubbleBox]);

  const text = bubble.thai_translation || '';
  const textLen = text.length || 1;

  // Clear, Legible Manga Typography Font Sizing:
  // Short phrases get bold prominent sizing, longer text fits proportionally
  const userScale = bubbleStyle.fontSizeScale || 1;
  let baseFontSize = 17;

  if (textLen <= 5) {
    baseFontSize = 23; // e.g. "...?!", "บ้าเอ๊ย!"
  } else if (textLen <= 14) {
    baseFontSize = 19.5; // e.g. "ก่อนอื่น มาดูสกิลของฉันก่อน"
  } else if (textLen <= 35) {
    baseFontSize = 17; // standard 2-3 lines
  } else if (textLen <= 70) {
    baseFontSize = 15; // longer narration
  } else {
    baseFontSize = 13.5; // dense gaming text
  }

  const computedFontSize = Math.round(baseFontSize * userScale);

  // Detect background and text color (Standard white comic bubble vs dark gaming UI status window)
  const isDark =
    bubble.bg_color === 'dark' ||
    bubble.type === 'system' ||
    (bubble.speaker_tone && (bubble.speaker_tone.includes('evil') || bubble.speaker_tone.includes('system')));

  const isNarration = bubble.type === 'narration';
  const isRect = bubble.shape === 'rect' || isNarration || isDark;

  const fontFam = bubbleStyle.fontFamily || 'var(--font-mitr), var(--font-prompt), sans-serif';
  const isLens = bubbleStyle.renderMode === 'lens';

  const currentX = Math.max(0, Math.min(95, box.x + dragOffset.x));
  const currentY = Math.max(0, Math.min(95, box.y + dragOffset.y));

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        left: `${currentX}%`,
        top: `${currentY}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        zIndex: isHovered || isEditing || isDragging ? 35 : 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      className={`manga-bubble-overlay group pointer-events-auto flex items-center justify-center ${
        isDragging ? 'cursor-grabbing opacity-90' : 'cursor-move'
      }`}
    >
      {/* Speech Bubble / Dialogue Container - Snug inpainting without massive empty cards */}
      <div
        className={`flex items-center justify-center p-2 text-center transition-all select-none overflow-hidden ${
          isHovered ? 'ring-2 ring-indigo-400 shadow-lg' : ''
        } ${isRect ? 'w-full h-full' : 'w-full'}`}
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : '#ffffff',
          color: isDark ? '#ffffff' : '#0a0a0a',
          borderRadius: isRect ? '6px' : '9999px',
          border: 'none',
          boxShadow: 'none',
          fontFamily: fontFam,
          // Lens mode: Fits dialogue height snugly so it never blocks character faces below
          height: isLens && !isRect ? 'fit-content' : '100%',
          maxHeight: '100%',
          minHeight: '28px',
        }}
        onClick={() => !isEditing && !isDragging && setIsEditing(true)}
      >
        {isEditing ? (
          <div
            className="w-full h-full flex flex-col justify-between p-1 bg-indigo-950 text-white rounded-lg min-h-[70px]"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
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

      {/* Hover Info Tooltip (Shows original vs Thai, and instructions to drag / edit) */}
      {isHovered && !isEditing && !isDragging && (
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 min-w-[240px] max-w-[340px] p-2.5 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-left text-xs pointer-events-auto z-50 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
            <span className="font-semibold text-indigo-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {bubble.type.toUpperCase()}
            </span>
            <span className="text-slate-400 flex items-center gap-1 text-[9px]">
              <Move className="w-2.5 h-2.5 text-indigo-400" />
              ลากเพื่อย้ายตำแหน่ง
            </span>
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
            <span>คลิกที่บอลลูนเพื่อแก้ไขคำแปล</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              แก้ไขคำแปล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
