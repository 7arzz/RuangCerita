import React from 'react';
import './BookShelf.css'; // Keep import in case there are global styles, but we will use Tailwind

export default function BookShelf({ books, onSelectBook }) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {books.map((book) => (
          <div 
            key={book.id} 
            onClick={() => onSelectBook(book)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectBook(book);
            }}
            className="group relative flex flex-col bg-slate-900/40 border border-[#c9b183]/10 hover:border-[#c9b183]/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 backdrop-blur-sm"
          >
            {/* Top Decoration / Glowing bar */}
            <div 
              className="absolute top-0 left-0 w-full h-1 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundColor: book.theme.accentColor || '#c9b183' }}
            ></div>

            {/* Card Content */}
            <div className="p-6 md:p-8 flex flex-col h-full z-10 relative">
              
              {/* Header: Genre & Icon */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-wrap gap-2">
                  {book.genre && book.genre.split(',').map((g, index) => (
                    <span key={index} className="px-2 py-0.5 rounded-sm bg-[#c9b183]/10 text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.15em] text-[#c9b183] font-bold">
                      {g.trim()}
                    </span>
                  ))}
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-950/50 border border-white/5 text-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500"
                  style={{ color: book.theme.accentColor || '#c9b183' }}
                >
                  {getThemeIcon(book.theme.styleClass)}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6 flex-grow">
                <h3 className="text-xl md:text-2xl font-display font-bold text-slate-100 mb-2 leading-tight group-hover:text-[#c9b183] transition-colors duration-300">
                  {book.title}
                </h3>
                <p className="text-sm md:text-sm text-slate-400 font-serif italic line-clamp-3 leading-relaxed">
                  {book.subtitle}
                </p>
              </div>

              {/* Footer: Author & Read Button */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                    <i className="fa-solid fa-feather-pointed text-xs text-slate-400"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-slate-500 uppercase tracking-wider">Penulis</span>
                    <span className="text-sm font-semibold text-slate-300">{book.author}</span>
                  </div>
                </div>
                
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c9b183]/10 text-[#c9b183] group-hover:bg-[#c9b183] group-hover:text-slate-900 transition-all duration-300">
                  <i className="fa-solid fa-arrow-right text-sm"></i>
                </button>
              </div>
            </div>
            
            {/* Background Glow Effect */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: book.theme.accentColor || '#c9b183' }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
