'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  BookOpen,
  Volume2,
} from 'lucide-react';

export default function ScriptPanel({
  isOpen,
  onClose,
  pages,
  onUpdateBubble,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Flatten all bubbles with page info
  const allDialogues = [];
  pages.forEach((page, pageIdx) => {
    if (page.bubbles && page.bubbles.length > 0) {
      page.bubbles.forEach((bubble) => {
        allDialogues.push({
          pageId: page.id,
          pageNumber: pageIdx + 1,
          bubbleId: bubble.id,
          type: bubble.type || 'speech',
          original: bubble.original_text || '',
          thai: bubble.thai_translation || '',
          tone: bubble.speaker_tone || '',
        });
      });
    }
  });

  const handleCopyAll = () => {
    let scriptText = '=== บทแปลมังฮวา / มังงะ (MangaFlow Thai) ===\n\n';
    let lastPage = 0;

    allDialogues.forEach((d) => {
      if (d.pageNumber !== lastPage) {
        scriptText += `\n--- [หน้า ${d.pageNumber}] ---\n`;
        lastPage = d.pageNumber;
      }
      scriptText += `[${d.type.toUpperCase()}] ${d.tone ? `(${d.tone}) ` : ''}${d.thai}\n`;
      if (d.original) {
        scriptText += `  (ต้นฉบับ: ${d.original})\n`;
      }
    });

    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-dropdown border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 transition-all duration-300">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-pink-400" />
          <div>
            <h3 className="font-bold text-sm">บทพูด & สคริปต์คำแปล</h3>
            <p className="text-[11px] text-slate-400">
              รวม {allDialogues.length} บทสนทนา จาก {pages.length} หน้า
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={allDialogues.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="คัดลอกบทแปลทั้งหมด"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dialogues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allDialogues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <MessageSquare className="w-10 h-10 stroke-1 opacity-50" />
            <p className="text-xs">ยังไม่มีบทแปลในขณะนี้</p>
            <p className="text-[11px] text-slate-600">
              เมื่อกดเริ่มแปล AI จะสกัดบทพูดและแสดงผลที่นี่
            </p>
          </div>
        ) : (
          allDialogues.map((d, index) => (
            <div
              key={`${d.pageId}-${d.bubbleId}-${index}`}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-colors text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-indigo-400">
                  หน้า {d.pageNumber} • บอลลูน #{d.bubbleId}
                </span>
                {d.tone && (
                  <span className="px-1.5 py-0.5 rounded bg-pink-950/60 text-pink-300 border border-pink-800/40">
                    {d.tone}
                  </span>
                )}
              </div>

              {/* Thai Translation */}
              <div className="text-slate-100 font-medium text-sm leading-relaxed">
                {d.thai}
              </div>

              {/* Source Original Text */}
              {d.original && (
                <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500 font-semibold mr-1">ต้นฉบับ:</span>
                  {d.original}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
