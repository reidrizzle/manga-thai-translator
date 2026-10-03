'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function TranslationProgress({
  isTranslating,
  currentPageIndex,
  totalPages,
}) {
  if (!isTranslating) return null;

  const percentage = Math.round(((currentPageIndex + 1) / totalPages) * 100);

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full glass-panel p-4 rounded-2xl shadow-2xl border border-indigo-500/50 bg-slate-950/90 backdrop-blur-xl animate-bounce-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-spin text-pink-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">
                AI กำลังแปลมังฮวา / มังงะ...
              </h4>
              <p className="text-[11px] text-slate-400">
                กำลังแปลหน้า {currentPageIndex + 1} จาก {totalPages} หน้า
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">
            {percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2 text-center">
          ✨ Gemini Vision กำลังสกัดตำแหน่งบอลลูนและแปลด้วยสำนวนไทยธรรมชาติ
        </p>
      </div>
    </div>
  );
}
