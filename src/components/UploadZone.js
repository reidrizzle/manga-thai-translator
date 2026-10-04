'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileImage,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  BookOpen,
  AlertCircle,
  HelpCircle,
  Eye,
  Play,
} from 'lucide-react';
import { fileToBase64, formatBytes, uid } from '@/lib/utils';

export default function UploadZone({
  pages,
  setPages,
  onStartTranslateAll,
  onOpenReader,
  isTranslating,
  onLoadSample,
  onFilesAdded,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFiles = async (fileList) => {
    setErrorMsg('');
    const newPages = [];

    // Sort files naturally by filename (e.g. page-1, page-2, page-10)
    const sortedFiles = Array.from(fileList).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)');
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newPages.push({
          id: uid(),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          base64: base64,
          status: 'idle', // 'idle' | 'translating' | 'done' | 'error'
          bubbles: [],
          page_summary: '',
          error: null,
        });
      } catch (err) {
        console.error('File read error:', err);
      }
    }

    if (newPages.length > 0) {
      setPages((prev) => [...prev, ...newPages]);
      if (onFilesAdded) {
        onFilesAdded(newPages);
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePage = (id) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const movePage = (index, direction) => {
    setPages((prev) => {
      const copy = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-indigo-500/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative p-4 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-pink-600/20 border border-indigo-500/30 text-indigo-400">
            <UploadCloud className="w-10 h-10 md:w-12 md:h-12" />
            <Sparkles className="w-4 h-4 text-pink-400 absolute top-2 right-2 animate-bounce" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              ลากรูปภาพมังฮวา / มังงะ มาวางที่นี่
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              หรือคลิกเพื่อเลือกไฟล์จากเครื่อง (รองรับหลายหน้าพร้อมกัน เช่น หน้า 1, 2, 3...)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
              JPG / PNG / WEBP
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
              🇰🇷 Manhwa / 🇯🇵 Manga / 🇺🇸 Comic
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
              อ่านได้ทันทีโดยไม่ต้องโหลด
            </span>
          </div>

          {/* Sample Demo Button */}
          <div className="pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>ทดลองด้วยตัวอย่างมังฮวาฟรี (Demo Sample)</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploaded Pages List */}
      {pages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-slate-200">
                หน้าที่อัปโหลด ({pages.length} หน้า)
              </h3>
            </div>

            {/* Action Buttons: Read Now & Translate */}
            <div className="flex items-center gap-3">
              {/* Read Now Button (Always available!) */}
              <button
                type="button"
                onClick={onOpenReader}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-indigo-400 shadow-md transition-all hover:scale-105"
                title="เข้าสู่หน้าอ่านการ์ตูนทันทีโดยไม่ต้องรอแปล"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>📖 เปิดอ่านทันที</span>
              </button>

              {/* Translate All Action Button */}
              <button
                type="button"
                disabled={isTranslating}
                onClick={onStartTranslateAll}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-xl transition-all ${
                  isTranslating
                    ? 'bg-indigo-700/50 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 hover:scale-105 shadow-indigo-600/30'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
                <span>
                  {isTranslating ? 'กำลังแปลด้วย AI...' : '✨ แปลไทยด้วย AI'}
                </span>
              </button>
            </div>
          </div>

          {/* Grid of Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {pages.map((page, index) => (
              <div
                key={page.id}
                onClick={() => onOpenReader(index)}
                className="group relative flex flex-col bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-2xl overflow-hidden transition-all shadow-md cursor-pointer"
                title="คลิกเพื่อเปิดอ่านหน้านี้"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden">
                  <img
                    src={page.base64}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Page Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[11px] font-bold text-indigo-300 border border-white/10">
                    #{index + 1}
                  </div>

                  {/* Quick Click to Read Overlay */}
                  <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-semibold text-xs backdrop-blur-[2px]">
                    <Eye className="w-4 h-4 text-indigo-300" />
                    <span>คลิกเพื่ออ่าน</span>
                  </div>

                  {/* Status Indicator */}
                  {page.status === 'translating' && (
                    <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-2">
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-indigo-200">
                        กำลังแปล...
                      </span>
                    </div>
                  )}

                  {page.status === 'done' && (
                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-emerald-950/90 backdrop-blur-sm border border-emerald-500/40 text-[10px] font-medium text-emerald-300 text-center">
                      ✓ แปลแล้ว ({page.bubbles?.length || 0} จุด)
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div
                    className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded-lg backdrop-blur-sm z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => movePage(index, -1)}
                        className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {index < pages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => movePage(index, 1)}
                        className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePage(page.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-900/50"
                      title="ลบหน้านี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Page Details */}
                <div className="p-2.5 text-xs bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                  <p className="font-medium text-slate-200 truncate flex-1" title={page.name}>
                    {page.name}
                  </p>
                  <p className="text-[10px] text-slate-400 ml-1">
                    {page.size ? formatBytes(page.size) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
