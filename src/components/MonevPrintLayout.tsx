'use client';

import React from 'react';
import Image from 'next/image';
import { MonevFormData } from '@/types/monev';

interface MonevPrintLayoutProps {
  data: MonevFormData;
}

export function MonevPrintLayout({ data }: MonevPrintLayoutProps) {
  // All standard study programs in FT UKWMS
  const allProdis = [
    { code: 'TE', label: 'Teknik Elektro' },
    { code: 'TK', label: 'Teknik Kimia' },
    { code: 'TI', label: 'Teknik Industri' },
    { code: 'RI', label: 'Rekayasa Industri' },
    { code: 'INF', label: 'Informatika' },
    { code: 'PPI', label: 'Profesi Insinyur' },
    { code: 'MTK', label: 'Magister Teknik Kimia' },
  ];

  // Helper to format struck-through or active Prodi text
  const currentProdiName = (data.prodi_nama || '').toLowerCase();

  // 6 finding rows default (with student tag if connected to specific mahasiswa)
  const findingsRows = Array.from({ length: Math.max(6, data.temuan?.length || 0) }, (_, i) => {
    const found = data.temuan?.find(t => t.nomor === i + 1) || data.temuan?.[i];
    if (!found || !found.hasil_temuan) {
      return { text: '', studentLabel: null };
    }
    const studentLabel = found.mahasiswa_nama 
      ? `[${found.mahasiswa_nama}${found.mahasiswa_nrp ? ` - ${found.mahasiswa_nrp}` : ''}]: ` 
      : null;
    return {
      text: found.hasil_temuan,
      studentLabel
    };
  });

  // Pra-KRS rows (minimum 3 rows for aesthetic layout)
  const praKrsRows = data.pra_krs && data.pra_krs.length > 0 
    ? data.pra_krs 
    : [
        { mahasiswa_id: '1', nama: '', ips_sebelumnya: '', mk_nilai_d: '', total_sks_pilihan: 0, perolehan_pk2: '' },
        { mahasiswa_id: '2', nama: '', ips_sebelumnya: '', mk_nilai_d: '', total_sks_pilihan: 0, perolehan_pk2: '' },
        { mahasiswa_id: '3', nama: '', ips_sebelumnya: '', mk_nilai_d: '', total_sks_pilihan: 0, perolehan_pk2: '' },
      ];

  // Attendees list (minimum 3 rows)
  const attendeeRows = Array.from({ length: Math.max(3, data.attendees?.length || 0) }, (_, i) => {
    return data.attendees?.[i] || { urutan: i + 1, nama: '', nrp: '' };
  });

  return (
    <div className="a4-sheet bg-white text-black font-serif text-[11px] leading-tight select-text">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 12mm 8mm 12mm;
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
          padding: 12mm 15mm;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          color: #000000;
        }

        .monev-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.2px solid #000000;
        }

        .monev-table th, 
        .monev-table td {
          border: 1px solid #000000;
          padding: 3px 6px;
          vertical-align: middle;
        }

        .monev-table th {
          font-weight: bold;
          text-align: center;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. DOCUMENT HEADER WITH EMBLEM & METADATA */}
      {/* ========================================================================= */}
      <table className="monev-table mb-2">
        <tbody>
          <tr>
            {/* Left Header Box: Logo & University Title */}
            <td className="w-[62%] p-2" style={{ verticalAlign: 'middle' }}>
              <div className="flex items-center gap-3">
                <div className="w-[65px] h-[65px] shrink-0 relative flex items-center justify-center">
                  <Image 
                    src="/ukwms-logo.svg" 
                    alt="Logo UKWMS" 
                    width={65} 
                    height={65} 
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="text-center grow">
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    Yayasan Widya Mandala Surabaya
                  </div>
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    Universitas Katolik Widya Mandala Surabaya
                  </div>
                  <div className="font-bold text-[11.5px] uppercase tracking-wide">
                    Fakultas Teknik
                  </div>
                  <div className="font-bold italic text-[10.5px] mt-1 uppercase tracking-tight">
                    Formulir Monev Akademik Mahasiswa Oleh Wali Studi
                  </div>
                </div>
              </div>
            </td>

            {/* Right Header Box: Document Meta */}
            <td className="w-[38%] p-0">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-normal w-[45%] py-1 px-2 text-[10.5px]">No Dokumen</td>
                    <td className="py-1 px-2 font-normal text-[10.5px]">{data.no_dokumen || '051/FORM/PDK/FT/2023'}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-normal py-1 px-2 text-[10.5px]">Tanggal Terbit</td>
                    <td className="py-1 px-2 font-normal text-[10.5px]">{data.tanggal_terbit || '1 Maret 2020'}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-normal py-1 px-2 text-[10.5px]">Revisi Ke</td>
                    <td className="py-1 px-2 font-normal text-[10.5px]">{data.revisi_ke || '02'}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black font-normal py-1 px-2 text-[10.5px]">Halaman</td>
                    <td className="py-1 px-2 font-normal text-[10.5px]">{data.halaman || '1 dari 1'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ========================================================================= */}
      {/* 2. ADVISING & PARTICIPANTS DETAILS TABLE */}
      {/* ========================================================================= */}
      <table className="monev-table mb-1">
        <tbody>
          {/* Row 1: Nama Wali Studi / NIK */}
          <tr>
            <td className="w-[5%] text-center font-normal">1.</td>
            <td className="w-[30%] font-normal">Nama Wali Studi/NIK:</td>
            <td colSpan={2} className="font-normal text-[11px]">
              <span className="font-semibold">{data.dosen_nama || '...................................................'}</span>
              {data.dosen_nik && <span> / NIK. {data.dosen_nik}</span>}
            </td>
          </tr>

          {/* Row 2: Program Studi */}
          <tr>
            <td className="text-center font-normal">2.</td>
            <td className="font-normal">Program Studi: <sup>(*)</sup></td>
            <td colSpan={2} className="text-[10px] leading-relaxed">
              {allProdis.map((p, idx) => {
                const isMatch = currentProdiName.includes(p.label.toLowerCase()) || 
                                (data.prodi_id && data.prodi_id === p.code);
                return (
                  <span key={p.code}>
                    <span className={isMatch ? 'font-bold underline text-black' : 'line-through text-black'}>
                      {p.label}
                    </span>
                    {idx < allProdis.length - 1 ? ' / ' : ''}
                  </span>
                );
              })}
            </td>
          </tr>

          {/* Row 3: Periode Pertemuan */}
          <tr>
            <td className="text-center font-normal align-top">3.</td>
            <td className="font-normal align-top">Periode Pertemuan: <sup>(*)</sup></td>
            <td colSpan={2} className="space-y-1 py-1.5 text-[10.5px]">
              {/* Option 1: Sebelum UTS */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border border-black text-center leading-[12px] text-[10px] font-bold">
                  {data.jenis_pertemuan === 'SEBELUM_UTS' || data.jenis_pertemuan === 'SEBELUM_UTS_UAS' ? '✓' : ''}
                </span>
                <span>
                  Sebelum UTS Semester {data.semester === 'GENAP' ? 'Genap' : 'Gasal'}{' '}
                  {data.jenis_pertemuan === 'SEBELUM_UTS' ? (data.tahun_ajaran || '2026/2027') : '......../........'}
                </span>
              </div>

              {/* Option 2: Sebelum UAS */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border border-black text-center leading-[12px] text-[10px] font-bold">
                  {data.jenis_pertemuan === 'SEBELUM_UAS' ? '✓' : ''}
                </span>
                <span>
                  Sebelum UAS Semester {data.semester === 'GENAP' ? 'Genap' : 'Gasal'}{' '}
                  {data.jenis_pertemuan === 'SEBELUM_UAS' ? (data.tahun_ajaran || '2026/2027') : '......../........'}
                </span>
              </div>

              {/* Option 3: KHS */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border border-black text-center leading-[12px] text-[10px] font-bold">
                  {data.jenis_pertemuan === 'KHS' ? '✓' : ''}
                </span>
                <span>
                  KHS Semester {data.semester === 'GENAP' ? 'Genap' : 'Gasal'}{' '}
                  {data.jenis_pertemuan === 'KHS' ? (data.tahun_ajaran || '2026/2027') : '......../........'}
                </span>
              </div>

              {/* Option 4: Pra KRS */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border border-black text-center leading-[12px] text-[10px] font-bold">
                  {data.jenis_pertemuan === 'PRA_KRS' ? '✓' : ''}
                </span>
                <span>
                  Pra KRS Semester {data.semester === 'GENAP' ? 'Genap' : 'Gasal'}{' '}
                  {data.jenis_pertemuan === 'PRA_KRS' ? (data.tahun_ajaran || '2026/2027') : '......../........'}
                </span>
              </div>
            </td>
          </tr>

          {/* Row 4: Daftar Mahasiswa */}
          <tr>
            <td className="text-center font-normal align-top">4.</td>
            <td className="font-normal align-top">
              Nama/NRP Mahasiswa<br />dibawah perwalian:
            </td>
            <td className="p-0 align-top w-[42%] border-r border-black">
              <div className="px-2 py-1 font-normal border-b border-black">Nama:</div>
              <div className="px-2 py-1 space-y-1">
                {attendeeRows.map((att, idx) => (
                  <div key={idx} className="flex gap-1 text-[10.5px]">
                    <span className="w-4">{idx + 1}.</span>
                    <span className="grow truncate">{att.nama || '...................................................'}</span>
                  </div>
                ))}
              </div>
            </td>
            <td className="p-0 align-top w-[23%]">
              <div className="px-2 py-1 font-normal border-b border-black">NRP:</div>
              <div className="px-2 py-1 space-y-1">
                {attendeeRows.map((att, idx) => (
                  <div key={idx} className="text-[10.5px]">
                    {att.nrp || '........................'}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footnote 1 */}
      <div className="text-[9.5px] italic mb-3">
        (*) coret yang tidak relevan
      </div>

      {/* ========================================================================= */}
      {/* 3. TEMUAN HASIL PERTEMUAN */}
      {/* ========================================================================= */}
      <div className="text-center font-bold text-[11px] mb-1 uppercase tracking-wide">
        Temuan Hasil Pertemuan Mahasiswa-Wali Studi
      </div>

      <table className="monev-table mb-3">
        <thead>
          <tr>
            <th className="w-[6%] py-1 font-normal">No</th>
            <th className="w-[94%] py-1 font-normal">Hasil Temuan</th>
          </tr>
        </thead>
        <tbody>
          {findingsRows.map((item, idx) => (
            <tr key={idx} style={{ height: '26px' }}>
              <td className="text-center font-normal">{idx + 1}.</td>
              <td className="px-2 font-normal text-[10.5px]">
                {item.studentLabel && (
                  <strong className="font-bold text-black">{item.studentLabel}</strong>
                )}
                {item.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ========================================================================= */}
      {/* 4. PRA-KRS EVALUATION TABLE */}
      {/* ========================================================================= */}
      <table className="monev-table mb-1">
        <thead>
          <tr className="bg-[#f2efe9]">
            <th colSpan={6} className="py-1 font-bold italic text-center text-[10.5px] border-b border-black">
              Diisi saat pra-KRS oleh dosen PA
            </th>
          </tr>
          <tr>
            <th className="w-[5%] py-1 font-normal text-[10px]">No</th>
            <th className="w-[28%] py-1 font-normal text-[10px]">Nama Mahasiswa</th>
            <th className="w-[10%] py-1 font-normal text-[10px]">IPS*</th>
            <th className="w-[25%] py-1 font-normal text-[10px]">
              Nama MK<br />dengan nilai D*
            </th>
            <th className="w-[20%] py-1 font-normal text-[9.5px] leading-tight">
              Jumlah SKS MK<br />pilihan yang telah<br />diprogram (hingga<br />saat ini)
            </th>
            <th className="w-[12%] py-1 font-normal text-[10px]">
              Perolehan<br />PK2
            </th>
          </tr>
        </thead>
        <tbody>
          {praKrsRows.map((pk, idx) => (
            <tr key={idx} style={{ height: '28px' }}>
              <td className="text-center font-normal">{idx + 1}.</td>
              <td className="font-normal px-2 text-[10px] truncate">{pk.nama || ''}</td>
              <td className="text-center font-normal text-[10px]">{pk.ips_sebelumnya || ''}</td>
              <td className="font-normal px-2 text-[9.5px]">{pk.mk_nilai_d || ''}</td>
              <td className="text-center font-normal text-[10px]">
                {pk.total_sks_pilihan !== undefined && pk.total_sks_pilihan !== 0 ? pk.total_sks_pilihan : ''}
              </td>
              <td className="text-center font-normal text-[10px]">{pk.perolehan_pk2 || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footnote 2 */}
      <div className="text-[9.5px] italic mb-3">
        * Semester sebelumnya
      </div>

      {/* ========================================================================= */}
      {/* 5. SIGNATURE FOOTER BOX */}
      {/* ========================================================================= */}
      <div className="flex justify-between items-end mt-2">
        <div className="w-[45%] text-[10px]">
          {data.tanggal_pertemuan && (
            <p className="text-slate-700">
              Surabaya, {new Date(data.tanggal_pertemuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Signature Box */}
        <div className="w-[50%] border border-black p-2 text-[10.5px]">
          <div className="font-normal">Dipersiapkan oleh:</div>
          <div className="font-normal">Wali Studi</div>

          {/* Signature area */}
          <div className="h-[55px] flex items-center justify-start py-1">
            {data.signature_url ? (
              <img 
                src={data.signature_url} 
                alt="Tanda Tangan Wali Studi" 
                className="max-h-[50px] object-contain ml-6" 
              />
            ) : (
              <div className="text-slate-300 italic text-[9px] ml-6">(Tanda Tangan)</div>
            )}
          </div>

          <div className="font-normal">
            ({data.dosen_nama || '...................................................'})
          </div>
          <div className="font-normal">
            NIK. {data.dosen_nik || '................................'}
          </div>
        </div>
      </div>

      {/* Page Numbering */}
      <div className="text-right text-[10px] mt-4">
        Page 1 of 1
      </div>
    </div>
  );
}
