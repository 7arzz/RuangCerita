import React, { useState, useEffect } from 'react';

export default function StoryReader({ book, onClose }) {
  const [fontSize, setFontSize] = useState('text-lg');
  const [theme, setTheme] = useState('dark'); // 'dark' | 'sepia' | 'light'

  // Scroll to top when book opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Format paragraphs from plain text content
  const formatParagraphs = (content) => {
    if (!content) return null;
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      // Very basic formatting for bold/italics
      let formattedPara = para;
      formattedPara = formattedPara.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedPara = formattedPara.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p 
          key={idx} 
          className="mb-6 leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: formattedPara }} 
        />
      );
    });
  };

  // Convert pages object into an array for easy rendering
  const getPagesContent = () => {
    if (!book || !book.pages) return [];
    
    // Sort pages based on key (page1, page2... insideFront etc)
    // Actually we can just iterate the keys, but need to be careful with insideFront
    const pagesArray = [];
    if (book.pages.insideFront) {
      pagesArray.push({
        type: 'quote',
        content: book.pages.insideFront
      });
    }

    const pageKeys = Object.keys(book.pages)
      .filter(key => key.startsWith('page'))
      .sort((a, b) => parseInt(a.replace('page', '')) - parseInt(b.replace('page', '')));

    let currentChapter = '';

    pageKeys.forEach(key => {
      const page = book.pages[key];
      if (page.chapter !== currentChapter) {
        pagesArray.push({
          type: 'chapter_header',
          chapter: page.chapter,
          title: page.title
        });
        currentChapter = page.chapter;
      }
      pagesArray.push({
        type: 'content',
        content: page.content
      });
    });

    return pagesArray;
  };

  const pagesContent = getPagesContent();

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#5c4b37]';
      case 'light':
        return 'bg-slate-50 text-slate-900';
      case 'dark':
      default:
        return 'bg-[#0a0f18] text-slate-300';
    }
  };

  const getHeaderThemeClasses = () => {
    switch (theme) {
      case 'sepia': return 'bg-[#f4ecd8]/90 border-[#d4c5b0]';
      case 'light': return 'bg-white/90 border-slate-200';
      case 'dark':
      default: return 'bg-[#0a0f18]/90 border-white/5';
    }
  };

  return (
    <div className={`w-full h-screen top-0 left-0 fixed z-50 overflow-y-auto font-serif transition-colors duration-500 ${getThemeClasses()}`}>
      
      {/* Sticky Header / Reader Controls */}
      <div className={`sticky top-0 w-full z-10 backdrop-blur-md border-b px-4 py-3 sm:px-8 flex justify-between items-center transition-colors duration-500 ${getHeaderThemeClasses()}`}>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-sans font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          <i className="fa-solid fa-arrow-left"></i> Kembali
        </button>

        <div className="flex items-center gap-4">
          <div className="flex bg-black/10 rounded-full p-1 gap-1">
            <button onClick={() => setFontSize('text-base')} className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs ${fontSize === 'text-base' ? 'bg-[#c9b183] text-black shadow-sm' : 'opacity-60 hover:opacity-100'}`}>A</button>
            <button onClick={() => setFontSize('text-lg')} className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-sm ${fontSize === 'text-lg' ? 'bg-[#c9b183] text-black shadow-sm' : 'opacity-60 hover:opacity-100'}`}>A</button>
            <button onClick={() => setFontSize('text-xl')} className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-base ${fontSize === 'text-xl' ? 'bg-[#c9b183] text-black shadow-sm' : 'opacity-60 hover:opacity-100'}`}>A</button>
          </div>
          <div className="h-4 w-px bg-current opacity-20"></div>
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full bg-slate-100 border ${theme === 'light' ? 'ring-2 ring-offset-1 ring-[#c9b183] border-slate-300' : 'border-slate-300'}`}></button>
            <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full bg-[#f4ecd8] border ${theme === 'sepia' ? 'ring-2 ring-offset-1 ring-[#c9b183] border-[#d4c5b0]' : 'border-[#d4c5b0]'}`}></button>
            <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full bg-[#1b263b] border ${theme === 'dark' ? 'ring-2 ring-offset-1 ring-[#c9b183] border-[#0a0f18]' : 'border-[#0a0f18]'}`}></button>
          </div>
        </div>
      </div>

      {/* Book Cover/Hero */}
      <div className="w-full flex flex-col items-center justify-center pt-20 pb-16 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-[#c9b183]/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {book.genre && book.genre.split(',').map((g, index) => (
            <span key={index} className="text-xs sm:text-sm font-sans tracking-[0.3em] uppercase opacity-70" style={{ color: book.theme.accentColor || '#c9b183' }}>
              {g.trim()}
            </span>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-center mb-6 leading-tight max-w-4xl">
          {book.title}
        </h1>
        <h2 className="text-lg sm:text-xl md:text-2xl italic opacity-80 text-center mb-8 font-serif">
          {book.subtitle}
        </h2>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-current opacity-30"></div>
          <span className="font-sans text-sm uppercase tracking-widest font-semibold opacity-90">{book.author}</span>
          <div className="h-px w-12 bg-current opacity-30"></div>
        </div>
      </div>

      {/* Reader Content Constraints */}
      <div className={`max-w-3xl mx-auto px-6 sm:px-12 md:px-16 pb-32 transition-all duration-300 ${fontSize}`}>
        {pagesContent.map((item, idx) => {
          if (item.type === 'quote') {
            return (
              <div key={idx} className="my-16 border-y border-current py-10 opacity-80 text-center">
                <div 
                  className="text-xl md:text-2xl leading-relaxed italic mb-4"
                  dangerouslySetInnerHTML={{ __html: item.content.quote.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
                <div className="text-sm font-sans uppercase tracking-widest font-medium"
                   dangerouslySetInnerHTML={{ __html: item.content.author.replace(/\*(.*?)\*/g, '<em>$1</em>') }}
                />
              </div>
            );
          }

          if (item.type === 'chapter_header') {
            return (
              <div key={idx} className="mt-24 mb-12 text-center flex flex-col items-center">
                <span className="text-sm font-sans uppercase tracking-[0.2em] font-bold opacity-60 mb-2">{item.chapter}</span>
                <h3 className="text-3xl md:text-4xl font-display font-bold">{item.title}</h3>
                <div className="w-16 h-1 mt-6 rounded-full" style={{ backgroundColor: book.theme.accentColor || '#c9b183' }}></div>
              </div>
            );
          }

          if (item.type === 'content') {
            return formatParagraphs(item.content);
          }

          return null;
        })}
      </div>

      {/* Footer Navigation */}
      <div className="w-full text-center py-12 border-t border-current border-opacity-10 opacity-70">
        <p className="font-sans text-sm tracking-widest uppercase mb-4">Akhir dari bacaan.</p>
        <button 
          onClick={onClose}
          className="px-8 py-3 rounded-full font-sans text-sm font-bold bg-current text-opacity-100 transition-transform hover:scale-105"
          style={{ color: theme === 'dark' ? '#0a0f18' : 'white', backgroundColor: theme === 'dark' ? 'white' : '#0a0f18' }}
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
