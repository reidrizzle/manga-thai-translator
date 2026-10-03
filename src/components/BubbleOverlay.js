'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Check, Move } from 'lucide-react';

/**
 * BubbleOverlay — Manga / Manhwa Speech Bubble Inpainting
 *
 * Design philosophy:
 *   - The overlay must feel like reading the ORIGINAL comic, just in Thai.
 *   - We do NOT create a new visible box / card on top of the artwork.
 *   - Instead, we paint *only the interior of the bubble* with a matching background color
 *     (leaving the original drawn border/outline perfectly visible through the 10–15 % inset
 *     around all four edges).
 *   - Thai text is set at a clean, readable comic-book size and centered in the cleared area.
 *   - SFX drawn on artwork are completely ignored so character faces are never covered.
 */
export default function BubbleOverlay({
  bubble,
  showOriginal = false,
  bubbleStyle = {
    fontFamily: 'var(--font-mitr), var(--font-prompt), sans-serif',
    fontSizeScale: 1,
    renderMode: 'lens',
    hideSfx: true,
  },
  onUpdateBubbleText,
  onUpdateBubbleBox,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bubble.thai_translation || '');
  const [isHovered, setIsHovered] = useState(false);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const overlayRef = useRef(null);

  const { box } = bubble;
  if (!box) return null;

  // === SFX EXCLUSION ===
  // Hard-drawn sound effects (사각, 흠칫, ฟึ่บ, etc.) must never generate an overlay
  const isSfx =
    bubble.type === 'sfx' ||
    (bubble.speaker_tone && bubble.speaker_tone.toLowerCase().includes('sfx')) ||
    (
      bubble.original_text &&
      bubble.original_text.trim().length <= 3 &&
      !bubble.original_text.includes(' ') &&
      (bubble.thai_translation || '').trim().length <= 4
    );

  if (isSfx && bubbleStyle.hideSfx !== false) return null;
  if (showOriginal) return null;

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    if (onUpdateBubbleText) onUpdateBubbleText(bubble.id, editText);
  };

  // === DRAG TO REPOSITION ===
  const handleMouseDown = (e) => {
    if (isEditing || e.button !== 0) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: box.x,
      origY: box.y,
    };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !dragStart.current || !overlayRef.current) return;
      const parent = overlayRef.current.parentElement;
      if (!parent) return;
      const pr = parent.getBoundingClientRect();
      const dx = ((e.clientX - dragStart.current.mouseX) / pr.width) * 100;
      const dy = ((e.clientY - dragStart.current.mouseY) / pr.height) * 100;
      setDragDelta({ x: dx, y: dy });
    };

    const onUp = () => {
      if (!isDragging.current || !dragStart.current) return;
      if (onUpdateBubbleBox) {
        const nx = Math.max(0, Math.min(95, dragStart.current.origX + dragDelta.x));
        const ny = Math.max(0, Math.min(95, dragStart.current.origY + dragDelta.y));
        onUpdateBubbleBox(bubble.id, { ...box, x: +nx.toFixed(2), y: +ny.toFixed(2) });
      }
      isDragging.current = false;
      dragStart.current = null;
      setDragDelta({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragDelta, box, bubble.id, onUpdateBubbleBox]);

  // === COLOUR DETECTION ===
  const isDark =
    bubble.bg_color === 'dark' ||
    bubble.type === 'system' ||
    (bubble.speaker_tone && (
      bubble.speaker_tone.includes('evil') ||
      bubble.speaker_tone.includes('system')
    ));

  const isNarration = bubble.type === 'narration';
  // Rect bubbles (narration / system UI) don't need the inset trick — they're rectangular already
  const isRect = bubble.shape === 'rect' || isNarration || isDark;

  // === FONT SIZING ===
  // Fixed-tier sizes so short exclamations are big and narration blocks stay readable
  const text = bubble.thai_translation || '';
  const textLen = text.length || 1;
  const userScale = bubbleStyle.fontSizeScale || 1;

  let basePx;
  if (textLen <= 5)       basePx = 22;   // "...!!", "หืม?"
  else if (textLen <= 15) basePx = 18;
  else if (textLen <= 40) basePx = 16;
  else if (textLen <= 80) basePx = 14.5;
  else                    basePx = 13;

  const fontSize = Math.round(basePx * userScale);
  const fontFam = bubbleStyle.fontFamily || 'var(--font-mitr), var(--font-prompt), sans-serif';

  // === INPAINTING INSET ===
  // The outer wrapper sits exactly over the bounding-box coordinates returned by Gemini.
  // The inner "painted" area is inset by ~10 % on each side so the original drawn bubble
  // border (the spiky/rounded outline drawn by the artist) remains fully visible.
  // This gives the authentic "text replaced in-place" feel.
  const INSET_SPEECH   = '10%';   // oval/round speech bubbles — leave border visible
  const INSET_THOUGHT  = '8%';    // thought bubbles — slightly less inset
  const INSET_RECT     = '4px';   // narration/system rectangles — almost flush

  const inset = isRect ? INSET_RECT : (bubble.type === 'thought' ? INSET_THOUGHT : INSET_SPEECH);
  const innerBorderRadius = isRect ? '4px' : '50%';   // oval for speech, rectangle for narration

  const bgColor = isDark ? 'rgba(10, 12, 28, 0.97)' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#0a0a0a';

  const liveX = Math.max(0, Math.min(95, box.x + dragDelta.x));
  const liveY = Math.max(0, Math.min(95, box.y + dragDelta.y));

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        left: `${liveX}%`,
        top: `${liveY}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        zIndex: isHovered || isEditing ? 35 : 20,
        // Outer wrapper is FULLY TRANSPARENT — the artist's drawn bubble border shows through
        background: 'transparent',
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      className={`manga-bubble-overlay group ${isDragging.current ? 'cursor-grabbing' : 'cursor-move'}`}
    >
      {/* ====================================================
          INNER PAINT AREA — covers only the interior of the
          speech bubble, leaving the artist's drawn border intact
          ==================================================== */}
      <div
        style={{
          position: 'absolute',
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          background: bgColor,
          borderRadius: innerBorderRadius,
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          outline: isHovered ? '1.5px dashed rgba(99,102,241,0.6)' : 'none',
          outlineOffset: '2px',
          fontFamily: fontFam,
        }}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          /* Edit mode */
          <div
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '4px', background: '#1e1b4b', borderRadius: '6px' }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ flex: 1, background: '#0f172a', color: '#e2e8f0', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #6366f1', resize: 'none', outline: 'none', fontFamily: 'sans-serif' }}
            />
            <button
              type="button"
              onClick={handleSaveEdit}
              style={{ marginTop: '4px', alignSelf: 'flex-end', padding: '2px 10px', borderRadius: '4px', background: '#16a34a', color: '#fff', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Check style={{ width: 11, height: 11 }} />
              บันทึก
            </button>
          </div>
        ) : (
          /* Read mode — Thai text rendered in-place of the original */
          <p
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.28,
              fontWeight: 600,
              color: textColor,
              textAlign: 'center',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              margin: 0,
              padding: '2px 4px',
              textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.9)' : 'none',
            }}
          >
            {bubble.thai_translation}
          </p>
        )}
      </div>

      {/* ====================================================
          HOVER TOOLTIP — shows original text, tone, and hints
          ==================================================== */}
      {isHovered && !isEditing && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '230px',
            maxWidth: '340px',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(2,6,23,0.97)',
            border: '1px solid rgba(100,116,139,0.5)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            color: '#e2e8f0',
            fontSize: '11px',
            textAlign: 'left',
            zIndex: 60,
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(51,65,85,0.8)', paddingBottom: '6px', marginBottom: '6px' }}>
            <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare style={{ width: 11, height: 11 }} />
              {bubble.type?.toUpperCase()}
            </span>
            {bubble.speaker_tone && (
              <span style={{ color: '#f472b6', fontSize: '10px', background: 'rgba(88,28,135,0.4)', padding: '1px 6px', borderRadius: '4px' }}>
                {bubble.speaker_tone}
              </span>
            )}
          </div>

          {bubble.original_text && (
            <p style={{ color: '#94a3b8', fontSize: '10px', fontStyle: 'italic', marginBottom: '4px' }}>
              <strong style={{ color: '#64748b' }}>ต้นฉบับ: </strong>
              {bubble.original_text}
            </p>
          )}
          <p style={{ color: '#f1f5f9', fontSize: '11px' }}>
            <strong style={{ color: '#34d399' }}>แปลไทย: </strong>
            {bubble.thai_translation}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(51,65,85,0.6)', paddingTop: '6px', marginTop: '6px', fontSize: '9px', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Move style={{ width: 9, height: 9, color: '#818cf8' }} />
              ลากเพื่อย้ายตำแหน่ง
            </span>
            <button
              onClick={() => setIsEditing(true)}
              style={{ color: '#818cf8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '9px' }}
            >
              แก้ไขคำแปล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
