'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenLine, Sparkles } from 'lucide-react';

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 360;
    canvas.height = 140;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new window.Image();
      img.onload = () => {
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
    onSave(null);
  };

  const generateStylizedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'italic 34px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.fillText(signerName.replace(/^(Dr\.|Ir\.|Prof\.|Dra\.|Drs\.)\s*/i, '').trim(), canvas.width / 2, 75);

    // Decorative underline swoop
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.moveTo(70, 95);
    ctx.bezierCurveTo(120, 115, 240, 85, 290, 100);
    ctx.stroke();

    setHasDrawn(true);
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-blue-600" />
          Tanda Tangan Digital Wali Studi
        </label>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={generateStylizedSignature}
            className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1"
            title="Buat paraf otomatis dari nama dosen"
          >
            <Sparkles className="w-3 h-3" /> Auto Signature
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1"
          >
            <Eraser className="w-3 h-3" /> Bersihkan
          </button>
        </div>
      </div>

      <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white rounded border border-slate-200 shadow-2xs cursor-crosshair touch-none"
        />
      </div>
      <p className="text-[11px] text-slate-500 text-center">
        Gunakan mouse, stylus, atau sentuhan jari pada kotak di atas untuk membubuhkan tanda tangan.
      </p>
    </div>
  );
}
