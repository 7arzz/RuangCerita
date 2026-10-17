import React, { useState, useEffect, useRef } from 'react';
import './ThreeDBook.css';

const renderContent = (text, isFirstPage = false) => {
  if (!text) return null;

  const paragraphs = text.split(/\r?\n\r?\n/);

  return paragraphs.map((para, paraIdx) => {
    const isFirstPara = isFirstPage && paraIdx === 0;
    const className = `page-text-p ${isFirstPara ? 'p-first-chapter' : ''}`;

    // Handle blockquote markers
    if (para.trim().startsWith('>')) {
      const cleaned = para.replace(/^>\s*/gm, '');
      return (
        <blockquote key={paraIdx} className="page-quote-block">
          {cleaned.replace(/\*\*(.*?)\*\*/g, '$1')}
        </blockquote>
      );
    }

    // Parse bold (**text**) and italics (*text*) within each paragraph
    const formatRegex = /(\*\*.*?\*\*|\*.*?\*)/g;
    const parts = para.split(formatRegex);

    const renderedParts = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx}>{part.slice(1, -1)}</em>;
      }
      return part;
    });

    return (
      <p key={paraIdx} className={className}>
        {renderedParts}
      </p>
    );
  });
};

export default function ThreeDBook({ book, onClose, onSwitchToZen }) {
  const [currentLocation, setCurrentLocation] = useState(1);
  const [scale, setScale] = useState(1);
  const [verticalMargin, setVerticalMargin] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const pagesList = Object.keys(book.pages || {})
    .filter(key => key.startsWith('page'))
    .sort((a, b) => parseInt(a.replace('page', ''), 10) - parseInt(b.replace('page', ''), 10));
  const M = pagesList.length;
  const numOfPapers = Math.ceil((M + 1) / 2) + 1;
  const maxLocation = numOfPapers + 1;

  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Gentle audio synthesis for paper rustle flip sound
  const playPageTurnSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Create a filtered white-noise burst resembling paper rustle
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      // Ignore if audio permissions blocked
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        goNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goPrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLocation, maxLocation, soundEnabled]);

  // Handle auto-resizing based on window dimensions to keep the 3D layout fit across all devices
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let bookW = 380;
      let bookH = 530;

      if (width < 480) {
        bookW = 165;
        bookH = 260;
      } else if (width < 640) {
        bookW = 210;
        bookH = 320;
      } else if (width < 960) {
        bookW = 280;
        bookH = 410;
      }

      // In landscape orientation with limited height
      if (height < 500 && width >= 480) {
        bookH = Math.max(220, height - 120);
        bookW = Math.round(bookH * 0.7);
      }

      if (containerRef.current) {
        containerRef.current.style.setProperty('--book-w', `${bookW}px`);
        containerRef.current.style.setProperty('--book-h', `${bookH}px`);
      }

      const targetW = bookW * 2 + 40;
      const targetH = bookH + 160;

      let scaleX = 1;
      let scaleY = 1;

      if (width < targetW) {
        scaleX = (width - 20) / targetW;
      }
      if (height < targetH) {
        scaleY = (height - 30) / targetH;
      }

      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);

      const heightDiff = targetH * (1 - newScale);
      setVerticalMargin(-heightDiff / 2);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [book]);

  // Touch Swipe Event Listeners for mobile & tablet reading
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Detect horizontal swipe if movement is greater than 35px and more horizontal than vertical
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        goNextPage();
      } else {
        goPrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const goNextPage = () => {
    if (currentLocation < maxLocation) {
      playPageTurnSound();
      setCurrentLocation(prev => prev + 1);
    }
  };

  const goPrevPage = () => {
    if (currentLocation > 1) {
      playPageTurnSound();
      setCurrentLocation(prev => prev - 1);
    }
  };

  const restartBook = () => {
    playPageTurnSound();
    setCurrentLocation(1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  let bookTransform = 'translateX(0%)';
  if (currentLocation === 1) {
    bookTransform = 'translateX(0%)';
  } else if (currentLocation === maxLocation) {
    bookTransform = 'translateX(100%)';
  } else {
    bookTransform = 'translateX(50%)';
  }

  const getThemeIcon = (styleClass) => {
    switch (styleClass) {
      case 'vintage-cosmic':
        return <i className="fa-solid fa-moon"></i>;
      case 'vintage-espresso':
        return <i className="fa-solid fa-hourglass-half"></i>;
      case 'vintage-romantic':
        return <i className="fa-solid fa-music"></i>;
      case 'vintage-emerald':
        return <i className="fa-solid fa-compass"></i>;
      default:
        return <i className="fa-solid fa-book-open"></i>;
    }
  };

  const handleBookClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    const bookElem = document.getElementById('book-container');
    if (!bookElem) return;

    const rect = bookElem.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX > rect.width / 2) {
      goNextPage();
    } else {
      goPrevPage();
    }
  };

  return (
    <div
      ref={containerRef}
      data-ui="true"
      className="fixed inset-0 z-[100] bg-gradient-to-br from-[#f8fafd] via-[#eef2f7] to-[#e5ecf5] text-slate-800 flex flex-col justify-between overflow-hidden select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top Header Navigation Bar ── */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-[#eef2f7]/95 backdrop-blur-md border-b border-white neu-flat z-50">
        {/* Left: Back button & Book Info */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            className="clay-btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            title="Tutup dan kembali ke rak (Esc)"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span className="hidden sm:inline">Kembali ke Rak</span>
          </button>

          <div className="flex flex-col ml-1 min-w-0">
            <h2 className="font-display text-xs sm:text-sm font-black text-slate-900 truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h2>
            <span className="text-[0.65rem] sm:text-[0.68rem] text-amber-700 font-sans font-bold truncate">
              {book.author}
            </span>
          </div>
        </div>

        {/* Right: Sound toggle, Fullscreen & Switch to Zen Mode */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center text-xs transition-all cursor-pointer ${
              soundEnabled
                ? 'clay-btn-primary'
                : 'clay-btn-secondary text-slate-400'
            }`}
            title={soundEnabled ? 'Suara Halaman: Aktif' : 'Suara Halaman: Senyap'}
          >
            <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="clay-btn-secondary w-9 h-9 items-center justify-center text-xs transition-all hidden md:flex cursor-pointer"
            title="Layar Penuh"
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>

          {/* Switch to Zen Mode */}
          {onSwitchToZen && (
            <button
              onClick={() => onSwitchToZen(book)}
              className="clay-btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-[0.72rem] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Beralih ke format membaca scroll e-reader vertikal"
            >
              <i className="fa-solid fa-align-left text-[0.7rem]"></i>
              <span className="hidden xs:inline">Mode Zen</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main 3D Book Viewport ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative perspective-[2200px] w-full px-2 overflow-hidden">
        {/* Mobile Swipe Hint Pill */}
        <div className="md:hidden absolute top-2 z-30 clay-pill bg-white/90 text-[0.68rem] text-slate-600 px-3.5 py-1 flex items-center gap-2 pointer-events-none shadow-sm">
          <i className="fa-solid fa-hand-pointer text-amber-600 text-[0.65rem] animate-pulse"></i>
          <span>Usap layar / ketuk kiri-kanan halaman</span>
        </div>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
            marginTop: `${verticalMargin}px`,
            marginBottom: `${verticalMargin}px`,
            transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          <div
            id="book-container"
            className="book-3d"
            style={{ transform: bookTransform }}
            onClick={handleBookClick}
          >
            <div className="book-spine-line"></div>

            {Array.from({ length: numOfPapers }, (_, idx) => {
              const i = idx + 1;
              const isFlipped = currentLocation > i;
              const zIndex = isFlipped ? i : numOfPapers - i + 1;

              if (i === 1) {
                return (
                  <div
                    key={i}
                    className={`paper-3d ${isFlipped ? 'flipped' : ''}`}
                    style={{ zIndex }}
                  >
                    {/* Front: Outer Cover */}
                    <div className={`page-face face-front cover-outer-front theme-${book.theme?.styleClass}`}>
                      <div className="gold-border"></div>
                      <div className="cover-content" style={{ color: book.theme?.accentColor || '#c5a059' }}>
                        <div className="cover-decor-top">Penerbit Ruang Cerita</div>
                        <div className="cover-title-group">
                          <h1 className="cover-title">{book.title}</h1>
                          <div className="cover-divider" style={{ background: book.theme?.accentColor || '#c5a059' }}></div>
                          <div className="cover-subtitle">{book.subtitle}</div>
                        </div>
                        <div
                          className="cover-center-badge"
                          style={{
                            color: book.theme?.accentColor || '#c5a059',
                            borderColor: book.theme?.accentColor || '#c5a059'
                          }}
                        >
                          {getThemeIcon(book.theme?.styleClass)}
                        </div>
                        <div>
                          <div className="cover-author">{book.author}</div>
                          <div className="cover-tagline">Cetakan Pertama • {book.year_published || '2026'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Back: Inside Cover/Dedication page */}
                    <div className="page-face face-back cover-inner-front">
                      <div className="dedication-page">
                        <div className="dedication-ornament">
                          <i className="fa-solid fa-feather-pointed"></i>
                        </div>
                        <div className="dedication-text">
                          {renderContent(book.pages?.insideFront?.quote)}
                        </div>
                        <div className="dedication-author">
                          {renderContent(book.pages?.insideFront?.author)}
                        </div>
                      </div>
                      <div className="page-footer-nav">
                        <span>Prakata</span>
                        <span className="page-num">ii</span>
                      </div>
                    </div>
                  </div>
                );
              } else if (i === numOfPapers) {
                const lastPageIdx = 2 * i - 4;
                const hasLastPage = lastPageIdx < M;
                const lastPage = hasLastPage ? book.pages[pagesList[lastPageIdx]] : null;
                return (
                  <div
                    key={i}
                    className={`paper-3d ${isFlipped ? 'flipped' : ''}`}
                    style={{ zIndex }}
                  >
                    {/* Front: Last Page */}
                    <div className="page-face face-front">
                      {lastPage ? (
                        <>
                          {lastPage.chapter && <span className="page-header-tag">{lastPage.chapter}</span>}
                          <h2 className="page-title-h2">{lastPage.title}</h2>
                          <div className="page-body-content">
                            {renderContent(lastPage.content)}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 my-auto">
                          <div className="text-3xl text-[#c5a059] mb-4">
                            <i className="fa-solid fa-scroll"></i>
                          </div>
                          <h2 className="font-display text-2xl text-[#ffe8b5] mb-2">TAMAT</h2>
                          <p className="text-slate-400 text-sm italic max-w-[280px]">
                            Terima kasih telah membaca hingga lembar terakhir kisah ini.
                          </p>
                        </div>
                      )}

                      <div className="mt-auto flex flex-col gap-2 pt-4">
                        <button
                          className="px-5 py-2.5 bg-[#c5a059]/20 hover:bg-[#c5a059] border border-[#c5a059]/40 hover:border-[#c5a059] text-[#ffe8b5] hover:text-slate-950 rounded-full font-sans cursor-pointer text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            restartBook();
                          }}
                        >
                          <i className="fa-solid fa-arrow-rotate-left"></i> Baca Ulang dari Sampul
                        </button>
                      </div>

                      <div className="page-footer-nav mt-3">
                        <span>Penutup</span>
                        <span className="page-num">{hasLastPage ? M : 'Akhir'}</span>
                      </div>
                    </div>

                    {/* Back: Outer Back Cover */}
                    <div className={`page-face face-back cover-outer-back theme-${book.theme?.styleClass}`}>
                      <div className="gold-border"></div>
                      <div className="back-cover-content" style={{ color: book.theme?.accentColor || '#c5a059' }}>
                        <div className="back-cover-blurb">
                          "{book.subtitle}" — Sebuah persembahan sastra imajinatif dari Ruang Cerita untuk jiwa-jiwa pengembara kata.
                        </div>
                        <div className="back-cover-bottom">
                          <div className="text-xl mb-1">
                            {getThemeIcon(book.theme?.styleClass)}
                          </div>
                          <div className="back-cover-barcode">
                            <div className="barcode-stripes"></div>
                            <div className="barcode-text">ISBN 978-602-{(book.id || 'book').length * 7}-x</div>
                          </div>
                          <div className="text-[0.62rem] tracking-[1px] opacity-60">
                            RUANG CERITA PUBLISHING CO.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const frontPageIdx = 2 * i - 4;
                const backPageIdx = 2 * i - 3;

                const frontPageKey = pagesList[frontPageIdx];
                const backPageKey = pagesList[backPageIdx];

                const frontPage = book.pages[frontPageKey];
                const backPage = book.pages[backPageKey];

                return (
                  <div
                    key={i}
                    className={`paper-3d ${isFlipped ? 'flipped' : ''}`}
                    style={{ zIndex }}
                  >
                    {/* Front page */}
                    <div className="page-face face-front">
                      {frontPage?.chapter && <span className="page-header-tag">{frontPage.chapter}</span>}
                      <h2 className="page-title-h2">{frontPage?.title}</h2>
                      <div className="page-body-content">
                        {renderContent(frontPage?.content, frontPageIdx === 0)}
                      </div>
                      <div className="page-footer-nav">
                        <span>{frontPage?.chapter || book.title}</span>
                        <span className="page-num">{frontPageIdx + 1}</span>
                      </div>
                    </div>

                    {/* Back page */}
                    <div className="page-face face-back">
                      {backPage?.chapter && <span className="page-header-tag">{backPage.chapter}</span>}
                      <h2 className="page-title-h2">{backPage?.title}</h2>
                      <div className="page-body-content">
                        {renderContent(backPage?.content)}
                        {backPage?.quote && (
                          <div className="page-center-quote">
                            {renderContent(backPage.quote)}
                          </div>
                        )}
                      </div>
                      <div className="page-footer-nav">
                        <span className="page-num">{backPageIdx + 1}</span>
                        <span>{backPage?.chapter || book.title}</span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar ── */}
      <footer className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#eef2f7]/95 backdrop-blur-md flex items-center justify-between gap-2 sm:gap-4 z-50 border-t border-white neu-flat">
        <div className="text-[0.72rem] text-slate-500 font-sans hidden lg:block">
          Gunakan tombol <kbd className="px-2 py-0.5 rounded-md neu-inset-sm bg-white/80 text-slate-700 font-bold">←</kbd>{' '}
          <kbd className="px-2 py-0.5 rounded-md neu-inset-sm bg-white/80 text-slate-700 font-bold">→</kbd> atau usap layar
        </div>

        {/* Center Page Navigators */}
        <div className="flex items-center gap-1.5 sm:gap-3 mx-auto lg:mx-0 w-full sm:w-auto justify-center">
          <button
            className="clay-btn-secondary px-3 sm:px-4 py-2 sm:py-2.5 text-[0.72rem] sm:text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            disabled={currentLocation === 1}
            onClick={goPrevPage}
            title="Balik Halaman ke Kiri"
          >
            <i className="fa-solid fa-chevron-left text-[0.7rem]"></i>
            <span className="hidden xs:inline">Sebelumnya</span>
          </button>

          <span className="font-display text-[0.68rem] sm:text-xs text-slate-800 neu-inset-sm bg-[#e7ecf3] px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-center min-w-[90px] sm:min-w-[120px] truncate">
            {currentLocation === 1
              ? 'Sampul'
              : currentLocation === maxLocation
              ? 'Belakang'
              : `${currentLocation - 1} / ${numOfPapers - 1}`}
          </span>

          <button
            className="clay-btn-primary px-3 sm:px-4 py-2 sm:py-2.5 text-[0.72rem] sm:text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            disabled={currentLocation === maxLocation}
            onClick={goNextPage}
            title="Balik Halaman ke Kanan"
          >
            <span className="hidden xs:inline">Selanjutnya</span>
            <i className="fa-solid fa-chevron-right text-[0.7rem]"></i>
          </button>
        </div>

        {/* Right: Progress percentage */}
        <div className="text-[0.7rem] sm:text-xs tabular-nums text-amber-700 font-bold hidden sm:block neu-inset-sm px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#e7ecf3] shrink-0">
          {Math.round(((currentLocation - 1) / (maxLocation - 1)) * 100)}% Selesai
        </div>
      </footer>
    </div>
  );
}
