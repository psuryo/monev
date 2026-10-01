'use client';

import React from 'react';
import Image from 'next/image';
import { ReviewSoalFormData, DEFAULT_REVIEW_SOAL_POINTS } from '@/types/monev';

interface ReviewSoalPrintLayoutProps {
  data: ReviewSoalFormData;
}

export function ReviewSoalPrintLayout({ data }: ReviewSoalPrintLayoutProps) {
  // Format Indonesian Date: e.g. "24 Oktober 2026"
  const formatIndonesianDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formattedDate = formatIndonesianDate(data.tanggal_peninjauan);

  // Combine course info
  const courseCodeAndSemester = [
    data.nama_mk || '',
    data.kode_mk ? data.kode_mk : '',
    data.semester_mk ? `Semester ${data.semester_mk}` : ''
  ].filter(Boolean).join(' / ');

  const items = data.items && data.items.length > 0 ? data.items : DEFAULT_REVIEW_SOAL_POINTS;

  return (
    <div className="a4-sheet bg-white text-black font-serif text-[11.5px] leading-tight select-text">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm 10mm 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            border: none !important;
          }
        }

        .a4-sheet {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 12mm 16mm;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          color: #000000;
          background-color: #ffffff;
        }

        .rev-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000000;
        }

        .rev-table th, 
        .rev-table td {
          border: 1px solid #000000;
          padding: 5px 7px;
          vertical-align: top;
        }

        .rev-table th {
          font-weight: bold;
          text-align: center;
          background-color: #e5e7eb !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. KOP SURAT FAKULTAS TEKNIK UKWMS */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pb-3 border-b-[2px] border-black">
        <div className="w-[80px] h-[80px] shrink-0 relative flex items-center justify-center">
          <Image 
            src="/ukwms-logo.svg" 
            alt="Logo UKWMS" 
            width={75} 
            height={75} 
            className="object-contain"
            priority
          />
        </div>
        <div className="text-center grow px-2">
          <div className="font-bold text-[14pt] tracking-tight uppercase leading-snug">
            UNIVERSITAS KATOLIK WIDYA MANDALA SURABAYA
          </div>
          <div className="font-bold text-[13pt] tracking-tight uppercase leading-tight">
            FAKULTAS TEKNIK
          </div>
          <div className="text-[9pt] mt-0.5 leading-snug">
            Jl. Kalijudan 37 Surabaya 60114 Jawa Timur – Indonesia
          </div>
          <div className="text-[9pt] leading-snug">
            Telp: +62 31 3891264 psw.: 103, Faks: +62 31 3891267
          </div>
        </div>
        {/* Spacer for symmetry */}
        <div className="w-[80px] shrink-0"></div>
      </div>

      {/* ========================================================================= */}
      {/* 2. JUDUL FORM & METADATA SEMESTER & PRODI */}
      {/* ========================================================================= */}
      <div className="text-center my-4 space-y-1">
        <div className="font-bold text-[11.5pt] uppercase tracking-wide">
          FORM PENINJAUAN KESESUAIAN BAP & SOAL UJIAN DENGAN RPKPS
        </div>
        <div className="font-bold text-[11pt] uppercase tracking-wide">
          SEMESTER {data.semester_tipe || 'GASAL'} TAHUN AJARAN {data.tahun_ajaran || '2026/2027'}
        </div>
        <div className="font-bold text-[11pt] uppercase tracking-wide">
          PROGRAM STUDI {data.prodi_nama || 'Informatika'}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INFORMASI MATA KULIAH & DOSEN PENGAMPU */}
      {/* ========================================================================= */}
      <div className="mb-4 text-[11pt]">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="font-bold py-1 w-[210px] align-top">Nama MK / Kode / Semester</td>
              <td className="w-[15px] py-1 align-top">:</td>
              <td className="py-1 font-semibold align-top">{courseCodeAndSemester || '-'}</td>
            </tr>
            <tr>
              <td className="font-bold py-1 w-[210px] align-top">Dosen Pengampu</td>
              <td className="w-[15px] py-1 align-top">:</td>
              <td className="py-1 align-top">{data.dosen_pengampu || '-'}</td>
            </tr>
            <tr>
              <td className="font-bold py-1 w-[210px] align-top">Waktu Peninjauan</td>
              <td className="w-[15px] py-1 align-top">:</td>
              <td className="py-1 font-semibold align-top uppercase">{data.waktu_peninjauan || 'UJIAN TENGAH SEMESTER (UTS)'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 4. TABEL 8 POIN PENINJAUAN */}
      {/* ========================================================================= */}
      <table className="rev-table mb-6">
        <thead>
          <tr>
            <th className="w-[6%] py-2 text-center">No</th>
            <th className="w-[48%] py-2 text-center">POIN YANG DITINJAU</th>
            <th className="w-[18%] py-2 text-center">YA/TIDAK</th>
            <th className="w-[28%] py-2 text-center">KETERANGAN</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const isNo8 = item.nomor === 8;
            return (
              <tr key={idx}>
                <td className="text-center font-medium py-2">{item.nomor}</td>
                <td className="py-2 px-2.5 font-normal leading-snug">
                  {item.poin_peninjauan}
                </td>
                <td className="text-center font-bold py-2 tracking-wider">
                  {item.is_sesuai ? (
                    item.is_sesuai.toUpperCase()
                  ) : (
                    <span className="text-slate-400 font-normal">-</span>
                  )}
                </td>
                <td className="py-2 px-2.5 text-[10.5pt] leading-snug whitespace-pre-wrap">
                  {item.keterangan || (isNo8 && !item.is_sesuai ? '-' : '')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ========================================================================= */}
      {/* 5. TANDA TANGAN & PENGESAHAN */}
      {/* ========================================================================= */}
      <div className="mt-8 pt-2">
        <div className="grid grid-cols-2 gap-8 text-[11pt]">
          {/* Sisi Kiri: Mengetahui Ketua Program Studi */}
          <div className="text-left flex flex-col justify-between min-h-[140px]">
            <div>
              <div>Mengetahui,</div>
              <div className="font-semibold">Ketua Program Studi</div>
            </div>

            <div className="my-2 h-[65px] flex items-center">
              {data.kaprodi_signature_url ? (
                <img 
                  src={data.kaprodi_signature_url} 
                  alt="Tanda Tangan Kaprodi" 
                  className="max-h-[60px] max-w-[160px] object-contain"
                />
              ) : (
                <div className="h-[55px]"></div>
              )}
            </div>

            <div>
              <div className="font-bold border-b border-black inline-block min-w-[200px] pb-0.5">
                {data.kaprodi_nama && data.kaprodi_nama.trim() !== '-' && data.kaprodi_nama.trim() !== ''
                  ? data.kaprodi_nama
                  : '...................................................'}
              </div>
              <div className="mt-1 text-[10pt]">
                NIK. {data.kaprodi_nik && data.kaprodi_nik.trim() !== '-' && data.kaprodi_nik.trim() !== ''
                  ? data.kaprodi_nik
                  : '...................................'}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Peninjau */}
          <div className="text-left pl-8 flex flex-col justify-between min-h-[140px]">
            <div>
              <div>Surabaya, {formattedDate || '...................................'}</div>
              <div className="font-semibold">Peninjau</div>
            </div>

            <div className="my-2 h-[65px] flex items-center">
              {data.peninjau_signature_url ? (
                <img 
                  src={data.peninjau_signature_url} 
                  alt="Tanda Tangan Peninjau" 
                  className="max-h-[60px] max-w-[160px] object-contain"
                />
              ) : (
                <div className="h-[55px]"></div>
              )}
            </div>

            <div>
              <div className="font-bold border-b border-black inline-block min-w-[200px] pb-0.5">
                {data.peninjau_nama && data.peninjau_nama.trim() !== '-' && data.peninjau_nama.trim() !== ''
                  ? data.peninjau_nama
                  : '...................................................'}
              </div>
              <div className="mt-1 text-[10pt]">
                NIK {data.peninjau_nik && data.peninjau_nik.trim() !== '-' && data.peninjau_nik.trim() !== ''
                  ? data.peninjau_nik
                  : '...................................'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. NOMOR DOKUMEN ISO DI FOOTER */}
      {/* ========================================================================= */}
      <div className="mt-12 pt-4 text-[10pt] font-semibold text-slate-900">
        {data.no_dokumen || 'No. 047/FORM/PDK/FT/2023'}
      </div>
    </div>
  );
}
