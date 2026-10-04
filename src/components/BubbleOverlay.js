'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Check, Move } from 'lucide-react';

/**
 * BubbleOverlay — True "paint-over" approach
 *
 * Goal: make it feel like reading the original comic but in Thai.
 *
 * How it works:
 *   1. The outer div sits EXACTLY over the bubble's bounding box (100% coverage).
 *   2. Background fills the full area with the matching bubble color (white/dark) —
 *      this "erases" the original text underneath completely.
 *   3. Thai text is centered inside with font sizing that mirrors the original.
 *   4. For speech bubbles with a drawn border: a subtle 2px inset keeps the
 *      original drawn outline visible so it looks native, not pasted-on.
 *   5. For rect narration/system boxes: full-flush fill with zero inset.
 *   6. No shadows, no borders, no external card styles.
 */
export default function BubbleOverlay({
  bubble,
  showOriginal = false,
  bubbleStyle = {},
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
  if (showOriginal) return null;
  if (!bubble.thai_translation) return null;

  // === SAVE EDIT ===
  const handleSaveEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    if (onUpdateBubbleText) onUpdateBubbleText(bubble.id, editText);
  };

  // === DRAG REPOSITION ===
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

  // === STYLE DETECTION ===
  const isRect =
    bubble.shape === 'rect' ||
    bubble.type === 'narration' ||
    bubble.type === 'system';

  const isDark =
    bubble.bg_color === 'dark' ||
    bubble.type === 'system';

  const renderMode = bubbleStyle.renderMode || 'patch';

  // In 'patch' mode (default): seamlessly paint over the original text with matching comic bubble white/dark
  // In 'lens' mode: soft frosted glass
  const isLens = renderMode === 'lens';
  const bgFill = isLens
    ? (isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)')
    : (isDark ? '#0f172a' : '#ffffff');

  const textFill = isDark ? '#ffffff' : '#000000';

  const textShadow = isDark
    ? '0 1px 2px rgba(0,0,0,0.8)'
    : (isLens ? '0 0 2px #fff' : 'none');

  // Pill / oval shape for speech bubbles to blend into native bubble curves; rect for narration
  const borderRadius = isRect ? '2px' : '9999px';
  const borderStyle = isLens
    ? (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)')
    : (isRect ? (isDark ? '1.5px solid #334155' : '1.5px solid #09090b') : 'none');

  // === FONT SIZING — authentic, bold, readable comic book lettering ===
  const hint = bubble.font_size_hint || 'medium';
  const userScale = bubbleStyle.fontSizeScale || 1;
  const text = bubble.thai_translation || '';
  const charCount = text.replace(/\n/g, '').length || 1;

  let baseSize = 18; // standard comic dialog size
  if (hint === 'large') baseSize = 23;
  else if (hint === 'small') baseSize = 15;
  else if (bubble.type === 'narration' || bubble.type === 'system') baseSize = 16.5;

  if (charCount > 70) baseSize -= 2;
  else if (charCount < 14 && hint !== 'small') baseSize += 2;

  const fontSize = Math.round(Math.max(15, Math.min(28, baseSize)) * userScale);

  const fontFam =
    bubbleStyle.fontFamily ||
    'var(--font-mitr), var(--font-prompt), "Mitr", "Prompt", sans-serif';

  // Bold comic dialogue lettering
  const fontWeight = 700;
  const lineHeight = 1.35;

  const liveX = Math.max(0, Math.min(95, box.x + dragDelta.x));
  const liveY = Math.max(0, Math.min(96, box.y + dragDelta.y));

  return (
    <div
      ref={overlayRef}
      style={{
        position:   'absolute',
        left:       `${liveX}%`,
        top:        `${liveY}%`,
        width:      `${box.width}%`,
        minHeight:  `${box.height}%`,
        height:     'auto',
        zIndex:     isHovered || isEditing ? 35 : 20,
        background: bgFill,
        border:     borderStyle,
        borderRadius,
        boxSizing:  'border-box',
        padding:    isRect ? '4px 6px' : '3px 8px',
        outline:    isHovered ? '1.5px dashed rgba(99,102,241,0.7)' : 'none',
        outlineOffset: '2px',
        cursor:     isDragging.current ? 'grabbing' : 'move',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow:   'visible',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={() => !isDragging.current && !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        /* ── EDIT MODE ── */
        <div
          style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            padding: '4px', background: '#1e1b4b', borderRadius: '4px',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              flex: 1, background: '#0f172a', color: '#e2e8f0',
              fontSize: '11px', padding: '4px', borderRadius: '4px',
              border: '1px solid #6366f1', resize: 'none', outline: 'none',
              fontFamily: fontFam,
            }}
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            style={{
              marginTop: '4px', alignSelf: 'flex-end',
              padding: '2px 10px', borderRadius: '4px',
              background: '#16a34a', color: '#fff', fontSize: '10px',
              fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}
          >
            <Check style={{ width: 11, height: 11 }} />
            บันทึก
          </button>
        </div>
      ) : (
        /* ── READ MODE — Thai text exactly where the original was ── */
        <p
          style={{
            fontSize: `${fontSize}px`,
            lineHeight,
            fontWeight,
            color: textFill,
            fontFamily: fontFam,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            margin: 0,
            padding: '2px 6px',
            width: '100%',
            textShadow,
            userSelect: 'none',
          }}
        >
          {bubble.thai_translation}
        </p>
      )}

      {/* ── HOVER TOOLTIP ── */}
      {isHovered && !isEditing && (
        <div
          style={{
            position: 'absolute',
            bottom: '108%',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '220px',
            maxWidth: '320px',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(2,6,23,0.97)',
            border: '1px solid rgba(100,116,139,0.4)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
            color: '#e2e8f0',
            fontSize: '11px',
            textAlign: 'left',
            zIndex: 60,
            backdropFilter: 'blur(12px)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '10px' }}>
              <MessageSquare style={{ width: 10, height: 10, display: 'inline', marginRight: 3 }} />
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
              <strong style={{ color: '#64748b' }}>ต้นฉบับ: </strong>{bubble.original_text}
            </p>
          )}
          <p style={{ color: '#f1f5f9', fontSize: '11px', margin: 0 }}>
            <strong style={{ color: '#34d399' }}>แปลไทย: </strong>{bubble.thai_translation}
          </p>
          <p style={{ color: '#475569', fontSize: '9px', marginTop: '6px', borderTop: '1px solid rgba(51,65,85,0.6)', paddingTop: '5px' }}>
            <Move style={{ width: 9, height: 9, display: 'inline', marginRight: 3 }} />
            ลากเพื่อย้าย · คลิกเพื่อแก้ไขคำแปล
          </p>
        </div>
      )}
    </div>
  );
}
