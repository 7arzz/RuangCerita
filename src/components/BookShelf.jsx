import React, { useState } from 'react';
import './BookShelf.css';

export default function BookShelf({ books, onSelectBook, activeGenre }) {
  const [viewMode, setViewMode] = useState('shelf'); // 'shelf' (Book Jackets) or 'editorial' (Catalog list)

  const getReadingStats = (book) => {
    const pageKeys = Object.keys(book.pages || {}).filter(k => k.startsWith('page'));
    const totalWords = pageKeys.reduce((acc, key) => {
      const content = book.pages[key]?.content || '';
      return acc + content.split(/\s+/).length;
    }, 0);
    const readingMinutes = Math.max(3, Math.ceil(totalWords / 200));
    return {
      chapters: pageKeys.length,
      readingMinutes,
      totalWords
    };
  };

  const getThemeAesthetic = (styleClass) => {
    switch (styleClass) {
      case 'vintage-emerald':
        return {
          bgSurface: 'bg-gradient-to-br from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]/40',
          bgSpine: 'bg-[#6ee7b7]',
          accent: '#059669',
          icon: 'fa-compass',
          label: 'Edisi Sastra Fiksi & Laga'
        };
      case 'vintage-romantic':
        return {
          bgSurface: 'bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3]/40',
          bgSpine: 'bg-[#fda4af]',
          accent: '#e11d48',
          icon: 'fa-heart',
          label: 'Edisi Romansa & Kehidupan'
        };
      case 'vintage-espresso':
        return {
          bgSurface: 'bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fde68a]/40',
          bgSpine: 'bg-[#fcd34d]',
          accent: '#d97706',
          icon: 'fa-hourglass-half',
          label: 'Edisi Nostalgia & Refleksi'
        };
      case 'vintage-cosmic':
      default:
        return {
          bgSurface: 'bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/40',
          bgSpine: 'bg-[#7dd3fc]',
          accent: '#0284c7',
          icon: 'fa-feather-pointed',
          label: 'Edisi Cerita Pilihan'
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toolbar: Results summary & View mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm animate-pulse"></span>
          <h2 className="text-sm font-sans tracking-widest uppercase text-slate-700 font-bold">
            Koleksi Terpilih <span className="text-amber-700 tabular-nums ml-1 font-extrabold">({books.length})</span>
          </h2>
          {activeGenre !== 'Semua' && (
            <span className="clay-pill bg-amber-100 text-amber-800 text-xs px-3 py-1 font-sans font-bold">
              Genre: {activeGenre}
            </span>
          )}
        </div>

        {/* Neumorphic View switcher */}
        <div className="flex items-center gap-1.5 neu-inset-sm p-1.5 rounded-2xl bg-[#e7edf5]">
          <button
            onClick={() => setViewMode('shelf')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-2 cursor-pointer transition-all ${
              viewMode === 'shelf'
                ? 'clay-btn-primary'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
            title="Tampilan Rak Buku 3D"
          >
            <i className="fa-solid fa-book-open text-[0.8rem]"></i>
            <span className="hidden sm:inline">Rak Buku 3D</span>
          </button>
          <button
            onClick={() => setViewMode('editorial')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-2 cursor-pointer transition-all ${
              viewMode === 'editorial'
                ? 'clay-btn-primary'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
            title="Tampilan Katalog Editorial"
          >
            <i className="fa-solid fa-table-list text-[0.8rem]"></i>
            <span className="hidden sm:inline">Katalog Detail</span>
          </button>
        </div>
      </div>

      {/* View 1: 3D Hardcover Book Shelves (Claymorphic) */}
      {viewMode === 'shelf' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {books.map((book) => {
            const stats = getReadingStats(book);
            const style = getThemeAesthetic(book.theme?.styleClass);

            return (
              <div
                key={book.id}
                className="group relative flex flex-col clay-card overflow-hidden bg-white/90 border border-white"
              >
                {/* Book Jacket Cover Simulation */}
                <div
                  className={`relative p-5 sm:p-8 ${style.bgSurface} flex flex-col justify-between min-h-[260px] sm:min-h-[300px] overflow-hidden`}
                >
                  {/* Subtle Spine Emboss & Book Depth Highlight */}
                  <div className={`absolute top-0 left-0 w-3 sm:w-3.5 h-full ${style.bgSpine} pointer-events-none z-20 shadow-inner opacity-90`}></div>

                  {/* Top Header: Category Tag & Clay Icon */}
                  <div className="relative z-10 flex justify-between items-start gap-2 pl-1.5 sm:pl-2">
                    <span
                      className="text-[0.65rem] sm:text-[0.68rem] tracking-[0.18em] sm:tracking-[0.22em] uppercase font-sans font-bold"
                      style={{ color: style.accent }}
                    >
                      {book.year_published || '2026'} • {style.label}
                    </span>
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center bg-white/90 shadow-sm text-xs sm:text-sm shrink-0"
                      style={{ color: style.accent }}
                    >
                      <i className={`fa-solid ${style.icon}`}></i>
                    </div>
                  </div>

                  {/* Center: Title & Subtitle */}
                  <div className="relative z-10 my-3 sm:my-4 text-center pl-1 sm:pl-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-slate-900 group-hover:text-amber-700 tracking-tight leading-tight mb-2 transition-colors">
                      {book.title}
                    </h3>
                    <p className="font-editorial italic text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto line-clamp-2">
                      {book.subtitle}
                    </p>
                  </div>

                  {/* Bottom of Cover: Author Seal & Reading Stats */}
                  <div className="relative z-10 flex items-center justify-between pt-3 sm:pt-4 text-xs text-slate-600 pl-1 sm:pl-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <i className="fa-solid fa-feather-pointed text-amber-600 text-xs"></i>
                      <span className="font-sans font-bold text-slate-800 text-[0.75rem] sm:text-xs truncate max-w-[120px] sm:max-w-none">{book.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 tabular-nums text-[0.68rem] sm:text-[0.72rem] text-slate-500 font-semibold shrink-0">
                      <span>{stats.chapters} Bab</span>
                      <span>•</span>
                      <span>~{stats.readingMinutes} mnt</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Synopsis & Action Triggers */}
                <div className="p-4 sm:p-6 bg-[#f8fafd] flex flex-col flex-grow justify-between gap-4 sm:gap-5 border-t border-slate-100">
                  {/* Genre Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {book.genre &&
                      book.genre.split(',').map((g, idx) => (
                        <span
                          key={idx}
                          className="neu-inset-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-[0.68rem] font-sans font-bold text-slate-600 bg-[#eef2f7]"
                        >
                          {g.trim()}
                        </span>
                      ))}
                  </div>

                  {/* Dedication / Opening Quote Snippet */}
                  {book.pages?.insideFront?.quote && (
                    <div className="text-xs neu-inset-sm p-3.5 sm:p-4 rounded-2xl relative bg-[#eef2f7] border-l-4 border-amber-500">
                      <p className="font-editorial italic text-slate-700 leading-relaxed text-[0.8rem] sm:text-[0.85rem]">
                        {book.pages.insideFront.quote.replace(/\*\*/g, '')}
                      </p>
                      {book.pages.insideFront.author && (
                        <p className="text-right text-[0.68rem] sm:text-[0.72rem] text-amber-700 mt-2 font-sans font-bold">
                          {book.pages.insideFront.author.replace(/[\*—]/g, '').trim()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Dual Clay Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                    <button
                      onClick={() => onSelectBook(book, '3d')}
                      className="clay-btn-primary px-2.5 sm:px-3.5 py-2.5 sm:py-3 text-[0.75rem] sm:text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                      title="Buka dalam mode buku interaktif 3D"
                    >
                      <i className="fa-solid fa-book-open-reader text-[0.75rem]"></i>
                      <span>Buku 3D</span>
                    </button>

                    <button
                      onClick={() => onSelectBook(book, 'zen')}
                      className="clay-btn-secondary px-2.5 sm:px-3.5 py-2.5 sm:py-3 text-[0.75rem] sm:text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                      title="Baca dengan format e-reader imersif tanpa gangguan"
                    >
                      <i className="fa-solid fa-align-left text-amber-600 text-[0.75rem]"></i>
                      <span>Mode Zen</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View 2: Editorial Catalogue List View */
        <div className="flex flex-col gap-4 sm:gap-6">
          {books.map((book, index) => {
            const stats = getReadingStats(book);

            return (
              <div
                key={book.id}
                className="clay-card group relative flex flex-col md:flex-row bg-white/95 rounded-3xl p-5 sm:p-6 md:p-8 transition-all gap-5 md:gap-6 items-start md:items-center justify-between border border-white"
              >
                {/* Left Number & Identification */}
                <div className="flex items-start md:items-center gap-4 sm:gap-6 flex-grow min-w-0">
                  <div className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-amber-500/80 group-hover:text-amber-600 transition-colors tabular-nums shrink-0">
                    0{index + 1}
                  </div>

                  <div className="flex flex-col gap-1.5 max-w-2xl min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <span className="clay-pill bg-amber-50 text-amber-800 text-[0.62rem] sm:text-[0.65rem] tracking-[0.18em] uppercase font-bold px-2 py-0.5">
                        {book.year_published || '2026'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[0.72rem] sm:text-xs text-slate-500 font-sans truncate">
                        Oleh <strong className="text-slate-800 font-bold">{book.author}</strong>
                      </span>
                      <span className="text-slate-300 hidden xs:inline">•</span>
                      <span className="text-[0.72rem] sm:text-xs tabular-nums text-slate-500 font-semibold hidden xs:inline">
                        {stats.chapters} Bab (~{stats.readingMinutes} mnt)
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl md:text-2xl font-display font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {book.title}
                    </h3>

                    <p className="font-editorial italic text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      "{book.subtitle}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {book.genre &&
                        book.genre.split(',').map((g, idx) => (
                          <span
                            key={idx}
                            className="neu-inset-sm px-2.5 py-0.5 rounded-full text-[0.65rem] sm:text-[0.68rem] font-semibold text-slate-600 bg-[#eef2f7]"
                          >
                            {g.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t border-slate-100 md:border-none">
                  <button
                    onClick={() => onSelectBook(book, '3d')}
                    className="clay-btn-primary px-4 sm:px-5 py-2.5 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-book-open-reader text-xs"></i>
                    <span>Buku 3D</span>
                  </button>

                  <button
                    onClick={() => onSelectBook(book, 'zen')}
                    className="clay-btn-secondary px-4 sm:px-5 py-2.5 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-align-left text-amber-600 text-xs"></i>
                    <span>Mode Zen</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
