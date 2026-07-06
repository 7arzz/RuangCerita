import React, { useState, useEffect } from 'react';
import './ThreeDBook.css';

const renderContent = (text, isFirstPage = false) => {
  if (!text) return null;
  
  // Split by double newlines to render paragraphs
  const paragraphs = text.split(/\r?\n\r?\n/);
  
  return paragraphs.map((para, paraIdx) => {
    const isFirstPara = isFirstPage && paraIdx === 0;
    const className = `page-text-p ${isFirstPara ? 'p-first-chapter' : ''}`;
    
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

export default function ThreeDBook({ book, onClose }) {
  const [currentLocation, setCurrentLocation] = useState(1);
  const [scale, setScale] = useState(1);
  const [verticalMargin, setVerticalMargin] = useState(0);

  const pagesList = Object.keys(book.pages)
    .filter(key => key.startsWith('page'))
    .sort((a, b) => parseInt(a.replace('page', ''), 10) - parseInt(b.replace('page', ''), 10));
  const M = pagesList.length;
  const numOfPapers = Math.ceil((M + 1) / 2) + 1;
  const maxLocation = numOfPapers + 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goNextPage();
      } else if (e.key === 'ArrowLeft') {
        goPrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLocation, maxLocation]);

  // Handle auto-resizing based on window dimensions to keep the 3D layout fit
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine what base sizes the CSS is using
      let bookW = 380;
      let bookH = 530;
      
      if (width < 850) {
        bookW = 300;
        bookH = 430;
      }
      
      // Define total bounding box required for book + footer controls + header back-button
      const targetW = bookW * 2 + 60; // 2 pages wide + padding
      const targetH = bookH + 200;    // height + controls padding
      
      let scaleX = 1;
      let scaleY = 1;
      
      if (width < targetW) {
        scaleX = (width - 16) / targetW;
      }
      if (height < targetH) {
        scaleY = (height - 30) / targetH;
      }
      
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);

      // Compensate spacing collapses
      const heightDiff = targetH * (1 - newScale);
      setVerticalMargin(-heightDiff / 2);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [book]);

  const goNextPage = () => {
    if (currentLocation < maxLocation) {
      setCurrentLocation(prev => prev + 1);
    }
  };

  const goPrevPage = () => {
    if (currentLocation > 1) {
      setCurrentLocation(prev => prev - 1);
    }
  };

  const restartBook = () => {
    setCurrentLocation(1);
  };

  // Determine translation positioning for the overall book container
  let bookTransform = 'translateX(0%)';
  if (currentLocation === 1) {
    bookTransform = 'translateX(0%)';
  } else if (currentLocation === maxLocation) {
    bookTransform = 'translateX(100%)';
  } else {
    bookTransform = 'translateX(50%)';
  }

  // Helper to check cover icon based on theme
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

  // Click handler on book spine/page zones to flip
  const handleBookClick = (e) => {
    // Avoid double trigger if clicking buttons inside the book page
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    
    // Check if clicked left or right half
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
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6 md:gap-8 perspective-[2000px] relative z-10 p-4 w-full">
      {/* Back button and breadcrumb (Tailwind Classes) */}
      <div className="flex w-full max-w-[800px] justify-between items-center z-20 px-2 sm:px-4">
        <button 
          className="px-4 py-2 bg-red-950/20 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-300 hover:text-white rounded-full cursor-pointer text-xs md:text-sm font-medium font-sans flex items-center gap-2.5 transition-all duration-300 shadow-[0_4px_12px_rgba(235,77,75,0.1)] hover:shadow-[0_4px_12px_rgba(235,77,75,0.3)]" 
          onClick={onClose}
        >
          <i className="fa-solid fa-arrow-left-long"></i> Kembali ke Rak
        </button>
        <div className="text-[0.68rem] sm:text-xs md:text-sm text-slate-400 font-display tracking-widest uppercase pl-4 border-l border-white/10 hidden sm:block">
          {book.genre} &nbsp;|&nbsp; {book.author}
        </div>
      </div>

      {/* Scaler Wrapper to fit the 3D book on small / narrow mobile screens */}
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
            const i = idx + 1; // 1-indexed paper number
            const isFlipped = currentLocation > i;
            const zIndex = isFlipped ? i : (numOfPapers - i + 1);
            
            if (i === 1) {
              return (
                <div 
                  key={i}
                  className={`paper-3d ${isFlipped ? 'flipped' : ''}`}
                  style={{ zIndex }}
                >
                  {/* Front: Outer Cover */}
                  <div className={`page-face face-front cover-outer-front theme-${book.theme.styleClass}`}>
                    <div className="gold-border"></div>
                    <div className="cover-content" style={{ color: book.theme.accentColor }}>
                      <div className="cover-decor-top">Penerbit Ruang Cerita</div>
                      <div className="cover-title-group">
                        <h1 className="cover-title">{book.title}</h1>
                        <div className="cover-divider" style={{ background: book.theme.accentColor }}></div>
                        <div className="cover-subtitle">{book.subtitle}</div>
                      </div>
                      <div className="cover-center-badge" style={{ color: book.theme.accentColor, borderColor: book.theme.accentColor }}>
                        {getThemeIcon(book.theme.styleClass)}
                      </div>
                      <div>
                        <div className="cover-author">{book.author}</div>
                        <div className="cover-tagline">Cetakan Pertama • {book.year_published}</div>
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
                        {renderContent(book.pages.insideFront.quote)}
                      </div>
                      <div className="dedication-author">
                        {renderContent(book.pages.insideFront.author)}
                      </div>
                    </div>
                    <div className="page-footer-nav">
                      <span>Halaman Judul Inner</span>
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
                  {/* Front: Last Page (Ending info) */}
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
                        <div className="text-3xl text-[#c9b183] mb-4">
                          <i className="fa-solid fa-scroll"></i>
                        </div>
                        <h2 className="font-display text-2xl text-[#ffe8b5] mb-2">TAMAT</h2>
                        <p className="text-slate-400 text-sm italic max-w-[280px]">
                          Terima kasih telah membaca hingga lembar terakhir kisah ini.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-auto flex flex-col gap-2">
                      <button 
                        className="px-5 py-2.5 bg-[#c9b183]/15 hover:bg-[#c9b183] border border-[#c9b183]/30 hover:border-[#c9b183] text-[#ffe8b5] hover:text-slate-950 rounded-full font-sans cursor-pointer text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          restartBook();
                        }}
                      >
                        <i className="fa-solid fa-arrow-rotate-left"></i> Baca Ulang Buku
                      </button>
                    </div>
                    
                    <div className="page-footer-nav mt-4">
                      <span>Tamat</span>
                      <span className="page-num">{hasLastPage ? M : 'Akhir'}</span>
                    </div>
                  </div>
                  
                  {/* Back: Outer Back Cover */}
                  <div className={`page-face face-back cover-outer-back theme-${book.theme.styleClass}`}>
                    <div className="gold-border"></div>
                    <div className="back-cover-content" style={{ color: book.theme.accentColor }}>
                      <div className="back-cover-blurb">
                        "{book.subtitle}" — Sebuah persembahan sastra imajinatif dari Ruang Cerita untuk jiwa-jiwa pengembara kata.
                      </div>
                      <div className="back-cover-bottom">
                        <div className="text-xl mb-1">
                          {getThemeIcon(book.theme.styleClass)}
                        </div>
                        <div className="back-cover-barcode">
                          <div className="barcode-stripes"></div>
                          <div className="barcode-text">ISBN 978-602-{book.id.length * 7}-x</div>
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
                    {frontPage.chapter && <span className="page-header-tag">{frontPage.chapter}</span>}
                    <h2 className="page-title-h2">{frontPage.title}</h2>
                    <div className="page-body-content">
                      {renderContent(frontPage.content, frontPageIdx === 0)}
                    </div>
                    <div className="page-footer-nav">
                      <span>{frontPage.chapter || book.title}</span>
                      <span className="page-num">{frontPageIdx + 1}</span>
                    </div>
                  </div>
                  
                  {/* Back page */}
                  <div className="page-face face-back">
                    {backPage.chapter && <span className="page-header-tag">{backPage.chapter}</span>}
                    <h2 className="page-title-h2">{backPage.title}</h2>
                    <div className="page-body-content">
                      {renderContent(backPage.content)}
                      {backPage.quote && (
                        <div className="page-center-quote">
                          {renderContent(backPage.quote)}
                        </div>
                      )}
                    </div>
                    <div className="page-footer-nav">
                      <span className="page-num">{backPageIdx + 1}</span>
                      <span>{backPage.chapter || book.title}</span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Manual reading controls (Tailwind responsive styling) */}
        <div className="flex items-center justify-center gap-4 w-full max-w-[420px] px-4">
          <button 
            className="px-4.5 py-2 bg-white/5 hover:bg-[#c9b183] border border-white/10 hover:border-[#c9b183] text-slate-350 hover:text-slate-950 rounded-full cursor-pointer text-xs md:text-sm font-medium font-sans flex items-center gap-2 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-slate-350 disabled:hover:border-white/10"
            disabled={currentLocation === 1}
            onClick={goPrevPage}
            title="Halaman Sebelumnya (←)"
          >
            <i className="fa-solid fa-chevron-left text-[0.8rem]"></i> Hub. Kiri
          </button>
          
          <span className="font-display text-xs md:text-sm color-[#ffeed3] bg-black/45 px-4.5 py-2 rounded-full min-w-[90px] text-center border border-white/5 shadow-inner">
            {currentLocation === 1 ? 'Sampul' : (currentLocation === maxLocation ? 'Akhir' : `Lembar ${currentLocation - 1}`)}
          </span>

          <button 
            className="px-4.5 py-2 bg-white/5 hover:bg-[#c9b183] border border-white/10 hover:border-[#c9b183] text-slate-350 hover:text-slate-950 rounded-full cursor-pointer text-xs md:text-sm font-medium font-sans flex items-center gap-2 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-slate-350 disabled:hover:border-white/10"
            disabled={currentLocation === maxLocation}
            onClick={goNextPage}
            title="Halaman Selanjutnya (→)"
          >
            Hub. Kanan <i className="fa-solid fa-chevron-right text-[0.8rem]"></i>
          </button>
        </div>
      </div>

      <div className="text-[0.7rem] sm:text-xs text-slate-500/80 mt-1 text-center z-10 px-4 leading-normal">
        <p>Tip: Klik bagian kiri / kanan buku, atau gunakan tombol <strong>← →</strong> di keyboard.</p>
      </div>
    </div>
  );
}
