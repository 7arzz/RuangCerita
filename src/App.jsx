import React, { useState } from 'react';
import { cerpenData } from './data/cerpen';
import BookShelf from './components/BookShelf';
import StoryReader from './components/StoryReader';

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGenre, setActiveGenre] = useState('Semua');

  // Extract unique individual genres by splitting comma-separated strings
  const allGenres = cerpenData.flatMap(book => 
    book.genre ? book.genre.split(',').map(g => g.trim()) : []
  );
  const genres = ['Semua', ...new Set(allGenres)];

  // Filter books based on search query & active genre tab
  const filteredBooks = cerpenData.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Check if the exact activeGenre is included in the book's genre list
    const bookGenreList = book.genre ? book.genre.split(',').map(g => g.trim()) : [];
    const matchesGenre = activeGenre === 'Semua' || bookGenreList.includes(activeGenre);
    
    return matchesSearch && matchesGenre;
  });

  return (
    <div className={`min-h-screen flex flex-col relative z-[1] transition-all duration-1000 ${
      selectedBook 
        ? 'bg-[radial-gradient(circle_at_center,_#0f1524_0%,_#030406_100%)] justify-center p-4 md:p-10 after:content-[""] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-[900px] after:h-[450px] after:bg-[radial-gradient(ellipse_at_50%_0%,_rgba(201,177,131,0.08)_0%,_transparent_70%)] after:pointer-events-none after:z-[1]' 
        : 'bg-[radial-gradient(circle_at_center,_#1b263b_0%,_#080b11_100%)]'
    }`}>

      {/* Main Display Layout */}
      {!selectedBook ? (
        <>
          {/* Header (Styled with Tailwind) */}
          <header className="pt-12 md:pt-20 pb-6 px-4 text-center relative z-10 flex flex-col items-center">
            <div className="vintage-divider mb-4">
              <i className="fa-solid fa-book-bookmark"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-widest text-[#c9b183] text-glow uppercase mb-3 transition-all duration-300">
              Ruang Cerita
            </h1>
            <p className="font-serif italic text-sm sm:text-base md:text-lg text-slate-400 max-w-xl mx-auto px-4 mt-2 leading-relaxed">
              Selingkar imaji, rasa, dan kenangan yang diseduh menjadi untaian kata dalam perpustakaan cerpen interaktif.
            </p>
          </header>

          {/* Filtering and Search Controls (Tailwind responsive classes) */}
          <section className="flex flex-col items-center gap-5 md:gap-7 max-w-3xl mx-auto px-4 w-full mb-8 relative z-10">
            <div className="relative w-full max-w-md">
              <i className="fa-solid fa-magnifying-glass absolute left-4.5 top-1/2 -translate-y-1/2 text-[#c9b183] text-sm pointer-events-none"></i>
              <input 
                type="text" 
                placeholder="Cari judul cerita, sinopsis, atau penulis..."
                className="w-full bg-slate-900/50 border border-[#c9b183]/20 hover:border-[#c9b183]/40 focus:border-[#c9b183] text-slate-100 pl-11 pr-5 py-3 rounded-full text-xs sm:text-sm outline-none transition-all duration-300 focus:bg-slate-900/85 focus:ring-1 focus:ring-[#c9b183]/15 shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-sans transition-all duration-300 border cursor-pointer ${
                    activeGenre === genre 
                      ? 'bg-[#c9b183]/12 text-[#c9b183] border-[#c9b183] font-medium shadow-[0_0_8px_rgba(201,177,131,0.1)]' 
                      : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-slate-200 hover:border-[#c9b183]/30'
                  }`}
                  onClick={() => setActiveGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </section>

          {/* Instructional helper text */}
          <div className="text-center text-xs text-slate-400 font-sans tracking-wide mb-2 opacity-80 z-10 px-4">
            <i className="fa-solid fa-hand-pointer mr-1.5 text-[#c9b183] animate-pulse"></i> Pilih cerita di bawah untuk mulai membalik halaman
          </div>

          {/* Bookshelf views */}
          <main className="flex-grow pb-16 w-full relative z-10">
            {filteredBooks.length > 0 ? (
              <BookShelf 
                books={filteredBooks} 
                onSelectBook={(book) => setSelectedBook(book)} 
              />
            ) : (
              <div className="text-center mt-16 px-4">
                <i className="fa-regular fa-folder-open text-4xl sm:text-5xl text-[#c9b183]/20 mb-4 block"></i>
                <p className="font-serif italic text-sm sm:text-base text-slate-500 max-w-sm mx-auto">
                  Tidak ada cerita terpilih yang cocok dengan kata pencarian Anda.
                </p>
              </div>
            )}
          </main>
        </>
      ) : (
        /* Immersive scrolling read view mode */
        <main className="w-full relative z-50">
          <StoryReader
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
          />
        </main>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-8 px-4 border-t border-[#c9b183]/10 text-slate-500 text-[0.72rem] sm:text-xs mt-auto relative z-10">
        <div className="flex flex-col gap-2 items-center">
          <span className="font-display tracking-widest text-[#c9b183] font-semibold text-[0.75rem] sm:text-sm">
            © {new Date().getFullYear()} Ruang Cerita.
          </span>
          <span className="tracking-wide">
            Diukir secara digital oleh <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#c9b183] hover:text-[#e6cfa8] underline transition-colors">Aria Wijaya</a> dengan dedikasi sastra.
          </span>
        </div>
      </footer>
    </div>
  );
}
