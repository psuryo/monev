'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Check, ChevronsUpDown, BookOpen, Filter } from 'lucide-react';
import { MataKuliah } from '@/types/monev';

interface MataKuliahSearchSelectProps {
  mataKuliahList: MataKuliah[];
  selectedId: string | null | undefined;
  onSelect: (mataKuliah: MataKuliah | null) => void;
  disabled?: boolean;
  placeholder?: string;
  fallbackNama?: string;
  fallbackKode?: string;
}

export function MataKuliahSearchSelect({
  mataKuliahList,
  selectedId,
  onSelect,
  disabled = false,
  placeholder = 'Cari dan pilih mata kuliah (ketik kode atau nama)...',
  fallbackNama,
  fallbackKode,
}: MataKuliahSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find currently selected course
  const selectedCourse = useMemo(() => {
    if (!selectedId) {
      if (fallbackNama || fallbackKode) {
        return {
          id: '',
          nama: fallbackNama || '',
          kode: fallbackKode || '',
          sks: 0,
          semester: 0,
          kurikulum: '',
          prodi_id: '',
        } as MataKuliah;
      }
      return null;
    }
    return mataKuliahList.find((m) => m.id === selectedId) || null;
  }, [selectedId, mataKuliahList, fallbackNama, fallbackKode]);

  // Available semesters present in the current mataKuliahList
  const availableSemesters = useMemo(() => {
    const sems = new Set<number>();
    mataKuliahList.forEach((mk) => {
      if (mk.semester) sems.add(mk.semester);
    });
    return Array.from(sems).sort((a, b) => a - b);
  }, [mataKuliahList]);

  // Filtered courses based on search query and semester pill
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return mataKuliahList.filter((mk) => {
      // Semester filter
      if (selectedSemester !== 'ALL' && String(mk.semester) !== selectedSemester) {
        return false;
      }

      // Text query match: kode, nama, kurikulum, or semester
      if (q) {
        const matchKode = (mk.kode || '').toLowerCase().includes(q);
        const matchNama = (mk.nama || '').toLowerCase().includes(q);
        const matchKurikulum = (mk.kurikulum || '').toLowerCase().includes(q);
        const matchSem = `semester ${mk.semester}`.includes(q) || `sem ${mk.semester}`.includes(q);
        return matchKode || matchNama || matchKurikulum || matchSem;
      }

      return true;
    });
  }, [mataKuliahList, searchQuery, selectedSemester]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(-1);
    setSearchQuery('');
    setSelectedSemester('ALL');
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchQuery('');
    setSelectedSemester('ALL');
  };

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleSelect = (mk: MataKuliah) => {
    onSelect(mk);
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-course-item]');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredCourses.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredCourses.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredCourses.length) {
        handleSelect(filteredCourses[activeIndex]);
      }
    }
  };

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={handleToggle}
        className={`w-full text-xs rounded-xl border transition-all text-left flex items-center justify-between p-2.5 sm:py-2.5 sm:px-3 cursor-pointer select-none ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900 shadow-xs'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 text-slate-900 dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <BookOpen className="w-4 h-4 shrink-0 text-slate-400" />
          {selectedCourse && (selectedCourse.nama || selectedCourse.kode) ? (
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {selectedCourse.kode && (
                <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0">
                  {selectedCourse.kode}
                </span>
              )}
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {selectedCourse.nama}
              </span>
              {selectedCourse.semester > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                  • Sem {selectedCourse.semester} ({selectedCourse.sks} SKS)
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedCourse && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Reset pilihan mata kuliah"
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Ketik kode atau nama MK (misal: IF101, Algoritma, Web)..."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-8 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Semester Quick Filter Pills */}
            {availableSemesters.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
                <span className="text-slate-400 text-[10px] font-medium shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Semester:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('ALL')}
                  className={`px-2 py-0.5 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                    selectedSemester === 'ALL'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Semua
                </button>
                {availableSemesters.map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(String(sem))}
                    className={`px-2 py-0.5 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      selectedSemester === String(sem)
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result Count Info */}
          <div className="px-3 py-1.5 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span>
              {searchQuery || selectedSemester !== 'ALL'
                ? `Ditemukan ${filteredCourses.length} dari ${mataKuliahList.length} mata kuliah`
                : `${mataKuliahList.length} mata kuliah kurikulum tersedia`}
            </span>
            <span className="hidden sm:inline text-slate-400">Gunakan ↑↓ enter untuk memilih</span>
          </div>

          {/* List of Courses */}
          <div ref={listRef} className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((mk, idx) => {
                const isSelected = selectedId === mk.id;
                const isHighlighted = activeIndex === idx;

                return (
                  <div
                    key={mk.id}
                    data-course-item
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(mk)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 text-left ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          {mk.kode}
                        </span>
                        <span className="text-xs font-semibold leading-snug">
                          {mk.nama}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Semester {mk.semester}</span>
                        <span>•</span>
                        <span>{mk.sks} SKS</span>
                        {mk.kurikulum && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 dark:text-slate-500">Kurikulum {mk.kurikulum}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Mata kuliah tidak ditemukan
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {mataKuliahList.length === 0
                    ? 'Belum ada mata kuliah untuk program studi yang dipilih.'
                    : `Tidak ada yang cocok dengan "${searchQuery}". Coba kata kunci lain atau pilih "Semua".`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
