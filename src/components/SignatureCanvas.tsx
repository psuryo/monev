'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenLine, Sparkles, Upload, Image as ImageIcon, FileCheck } from 'lucide-react';

interface SignatureCanvasProps {
  initialSignature?: string | null;
  signerName?: string;
  onSave: (dataUrl: string | null) => void;
}

export function SignatureCanvas({
  initialSignature,
  signerName = 'Wali Studi',
  onSave
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activeMode, setActiveMode] = useState<'draw' | 'upload' | 'auto'>('draw');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 380;
    canvas.height = 140;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setFileName(null);
    onSave(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateStylizedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'italic 32px "Brush Script MT", "Segoe Script", "Dancing Script", cursive';
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    
    // Clean academic titles for aesthetic signature
    const cleanName = signerName.replace(/^(Dr\.|Ir\.|Prof\.|Dra\.|Drs\.)\s*/i, '').split(',')[0].trim();
    ctx.fillText(cleanName || signerName, canvas.width / 2, 72);

    // Elegant swoosh underline
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.2;
    ctx.moveTo(60, 95);
    ctx.bezierCurveTo(120, 115, 260, 85, 320, 102);
    ctx.stroke();

    setHasDrawn(true);
    setFileName(null);
    onSave(canvas.toDataURL('image/png'));
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, atau WEBP).');
      return;
    }

    // Limit to reasonable image file size (e.g. 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 5 MB.');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate aspect ratio fit inside canvas
        const padding = 12;
        const maxW = canvas.width - padding * 2;
        const maxH = canvas.height - padding * 2;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        setHasDrawn(true);
        onSave(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-blue-600" />
          Tanda Tangan Digital Wali Studi
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
            title="Unggah file foto / scan tanda tangan (PNG/JPG)"
          >
            <Upload className="w-3 h-3 text-blue-600" />
            Upload Gambar
          </button>

          {/* Auto Signature Button */}
          <button
            type="button"
            onClick={generateStylizedSignature}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-900"
            title="Buat paraf otomatis dari nama dosen"
          >
            <Sparkles className="w-3 h-3" />
            Auto TTD
          </button>

          {/* Clear Button */}
          {hasDrawn && (
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] px-2 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1 transition-colors"
              title="Hapus tanda tangan"
            >
              <Eraser className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Canvas Drop / Draw Box */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]' 
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs cursor-crosshair touch-none max-w-full"
        />

        {/* Status footer inside canvas container */}
        <div className="mt-2 text-center flex items-center justify-center gap-2">
          {fileName ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <FileCheck className="w-3.5 h-3.5" /> File terunggah: {fileName}
            </span>
          ) : hasDrawn ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              <Check className="w-3 h-3" /> Tanda tangan terpasang (tersimpan di database)
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Goreskan tanda tangan di atas, atau <strong className="cursor-pointer text-blue-600 hover:underline" onClick={() => fileInputRef.current?.click()}>klik di sini untuk upload file PNG/JPG</strong> / drag & drop.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
