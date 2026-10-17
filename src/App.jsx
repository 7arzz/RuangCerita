import React, { useState, useEffect, useRef } from "react";
import { cerpenData } from "./data/cerpen";
import BookShelf from "./components/BookShelf";
import StoryReader from "./components/StoryReader";
import ThreeDBook from "./components/ThreeDBook";

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingMode, setReadingMode] = useState("3d"); // "3d" or "zen"
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGenre, setActiveGenre] = useState("Semua");
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [copyToast, setCopyToast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef = useRef(null);

  // Literary Quotes Curated from the Stories
  const literaryQuotes = [
    {
      quote: "Rumah bukanlah tempat. Rumah adalah seseorang yang membuatmu ingin kembali, setiap hari.",
      author: "Elvano & Rhea",
      storyTitle: "Dibalik Lampu Studio",
      bookId: "dibalik-lampu-studio-s3"
    },
    {
      quote: "Seorang pilot hebat mungkin memenangkan satu pertempuran. Namun seorang engineer hebat mampu mengubah jalannya sejarah.",
      author: "Leon Veyr",
      storyTitle: "IRON LEGION",
      bookId: "iron-legion-v1-c1"
    },
    {
      quote: "Bahasa bukan sekadar kata yang harus diucapkan dengan sempurna. Bahasa adalah jembatan, dan yang paling berharga adalah bahasa perasaan.",
      author: "Arka & Reyna",
      storyTitle: "Enam Bahasa untuk Satu Kalimat",
      bookId: "enam-bahasa-untuk-satu-kalimat"
    }
  ];

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Copy quote handler
  const handleCopyQuote = (quoteText, author, storyTitle) => {
    const textToCopy = `"${quoteText}" - ${author} (${storyTitle} - Ruang Cerita)`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2400);
    });
  };

  // Extract unique genres with counts
  const allGenres = cerpenData.flatMap((book) =>
    book.genre ? book.genre.split(",").map((g) => g.trim()) : []
  );
  const uniqueGenres = ["Semua", ...new Set(allGenres)];

  const getGenreCount = (genre) => {
    if (genre === "Semua") return cerpenData.length;
    return cerpenData.filter((b) =>
      b.genre ? b.genre.split(",").map((g) => g.trim()).includes(genre) : false
    ).length;
  };

  // Filter books based on search & active genre
  const filteredBooks = cerpenData.filter((book) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.subtitle && book.subtitle.toLowerCase().includes(query));

    const bookGenreList = book.genre
      ? book.genre.split(",").map((g) => g.trim())
      : [];
    const matchesGenre =
      activeGenre === "Semua" || bookGenreList.includes(activeGenre);

    return matchesSearch && matchesGenre;
  });

  const featuredBook = cerpenData[1] || cerpenData[0]; // "Dibalik Lampu Studio" or first

  const handleOpenBook = (book, mode = "3d") => {
    setSelectedBook(book);
    setReadingMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f7] text-slate-800 selection:bg-amber-500/20 selection:text-amber-900 relative overflow-x-hidden">
      {/* Ambient Daylight Aura Gradients */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-10 w-[550px] h-[550px] bg-blue-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Toast Notification for Copied Quote */}
      {copyToast && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 clay-pill bg-white/95 text-slate-800 px-5 py-3 flex items-center gap-3 text-xs font-sans shadow-lg border border-white max-w-sm mx-auto sm:mx-0">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[0.65rem] shadow-sm shrink-0">
            <i className="fa-solid fa-check"></i>
          </div>
          <span className="font-medium">Kutipan berhasil disalin ke papan klip</span>
        </div>
      )}

      {/* Active Reader Views (3D Flipbook or Zen Mode) */}
      {selectedBook && readingMode === "3d" && (
        <ThreeDBook
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSwitchToZen={() => setReadingMode("zen")}
        />
      )}

      {selectedBook && readingMode === "zen" && (
        <StoryReader
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSwitchTo3D={() => setReadingMode("3d")}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
         MAIN LANDING PAGE & LITERARY CATALOG (LIGHT CLAY & NEUMORPHIC)
         ═══════════════════════════════════════════════════════════ */}
      {!selectedBook && (
        <>
          {/* Top Neumorphic Navigation Bar */}
          <nav className="w-full neu-navbar sticky top-0 z-40 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
              {/* Brand Emblem */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 border border-white/60 shrink-0">
                  <i className="fa-solid fa-book-bookmark text-sm sm:text-base"></i>
                </div>
                <div>
                  <span className="font-display font-black tracking-widest text-base sm:text-lg md:text-xl text-slate-900 block leading-tight">
                    RUANG CERITA
                  </span>

                </div>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-8 text-xs font-sans uppercase tracking-[0.16em] text-slate-600 font-semibold">
                <a href="#koleksi" className="hover:text-amber-600 transition-colors">
                  Koleksi Cerita
                </a>
                <a href="#kutipan" className="hover:text-amber-600 transition-colors">
                  Kutipan Pilihan
                </a>
                <a href="#tentang" className="hover:text-amber-600 transition-colors">
                  Tentang Penulis
                </a>
                <a href="#kolaborasi" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Kirim Cerpen / Jasa Web</span>
                </a>
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="neu-inset-sm px-4 py-1.5 rounded-full text-[0.75rem] font-sans text-slate-700 font-semibold hidden lg:flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>{cerpenData.length} Karya Pilihan</span>
                </span>
                <a
                  href="#koleksi"
                  className="clay-btn-primary px-3.5 sm:px-5 py-2 text-xs font-sans font-bold flex items-center gap-1.5 sm:gap-2 cursor-pointer no-underline"
                >
                  <i className="fa-solid fa-book-open text-[0.72rem]"></i>
                  <span>Jelajahi</span>
                </a>

                {/* Direct WhatsApp CTA Button */}
                <a
                  href="https://wa.me/6289502567101?text=Halo%207arzz%2C%20saya%20tertarik%20untuk%20mempublikasikan%20cerpen%20%2F%20membuat%20website%20custom."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-btn-secondary px-3 sm:px-4 py-2 text-xs font-sans font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer no-underline"
                  title="Hubungi 7arzz di WhatsApp (6289502567101)"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-600 text-sm"></i>
                  <span className="hidden sm:inline">Kontak</span>
                </a>

                {/* Mobile Hamburger Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden clay-btn-secondary w-9 h-9 flex items-center justify-center text-slate-700 cursor-pointer text-sm shrink-0"
                  aria-label="Menu Navigasi"
                >
                  <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Dropdown Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden px-4 pt-2 pb-6 bg-[#eef2f7]/95 backdrop-blur-lg border-b border-slate-200/80 flex flex-col gap-3 shadow-lg animate-fadeIn">
                <a
                  href="#koleksi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="clay-card p-3 text-xs font-sans uppercase tracking-wider font-bold text-slate-800 flex items-center gap-3 bg-white/80"
                >
                  <i className="fa-solid fa-book-bookmark text-amber-600 text-sm"></i>
                  <span>Koleksi Cerita ({cerpenData.length})</span>
                </a>
                <a
                  href="#kutipan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="clay-card p-3 text-xs font-sans uppercase tracking-wider font-bold text-slate-800 flex items-center gap-3 bg-white/80"
                >
                  <i className="fa-solid fa-quote-left text-amber-600 text-sm"></i>
                  <span>Kutipan Pilihan</span>
                </a>
                <a
                  href="#tentang"
                  onClick={() => setMobileMenuOpen(false)}
                  className="clay-card p-3 text-xs font-sans uppercase tracking-wider font-bold text-slate-800 flex items-center gap-3 bg-white/80"
                >
                  <i className="fa-solid fa-feather-pointed text-amber-600 text-sm"></i>
                  <span>Tentang Penulis</span>
                </a>
                <a
                  href="#kolaborasi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="clay-card p-3 text-xs font-sans uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-3 bg-emerald-50/80 border border-emerald-200"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
                  <span>Kirim Cerpen / Jasa Web (+62 895-0256-7101)</span>
                </a>
              </div>
            )}
          </nav>

          {/* Hero Section */}
          <section className="relative pt-10 sm:pt-16 pb-10 sm:pb-14 md:pt-24 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center flex flex-col items-center">

            {/* Monument Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-slate-900 max-w-5xl leading-[1.18] sm:leading-[1.1] mb-5 sm:mb-6">
              Rumah Bagi Aksara yang{" "}
              <span className="font-editorial italic font-normal text-amber-600 block sm:inline">
                Menunggumu Pulang.
              </span>
            </h1>

            {/* Supporting Prose */}
            <p className="font-reading text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2">
              Selingkar imaji, romansa, dan fantasi yang diseduh menjadi untaian kisah. Nikmati pengalaman membalik lembar buku 3D interaktif atau membaca hening dalam mode zen tanpa gangguan.
            </p>

            {/* Quick Badges in Claymorphic Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 text-[0.72rem] sm:text-xs font-sans text-slate-700">
              <span className="clay-pill bg-white/90 px-3.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 font-medium">
                <i className="fa-solid fa-cube text-amber-600"></i>
                Flipbook 3D Realistis
              </span>
              <span className="clay-pill bg-white/90 px-3.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 font-medium">
                <i className="fa-solid fa-feather text-amber-600"></i>
                Karya Asli Indonesia
              </span>
              <span className="clay-pill bg-white/90 px-3.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 font-medium">
                <i className="fa-solid fa-mobile-screen text-amber-600"></i>
                Akses Terbuka & Responsif
              </span>
            </div>
          </section>

          {/* Featured Story Spotlight (Claymorphic Showcase Card) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20 w-full">
            <div className="clay-card p-5 sm:p-8 md:p-12 lg:p-14 relative overflow-hidden bg-gradient-to-br from-[#ffffff] via-[#f7fafe] to-[#edf3fb]">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Left: Highlight Meta & Story Pitch */}
                <div className="lg:col-span-7 flex flex-col items-start gap-3.5 sm:gap-4">
                  <div className="clay-pill bg-amber-100 text-amber-800 px-3.5 sm:px-4 py-1.5 text-[0.65rem] sm:text-[0.7rem] tracking-[0.18em] uppercase font-bold inline-flex items-center gap-2">
                    <i className="fa-solid fa-star text-amber-600 text-[0.62rem]"></i>
                    Karya Pilihan Redaksi
                  </div>

                  <h2 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
                    {featuredBook.title}
                  </h2>

                  <p className="font-editorial italic text-slate-600 text-base sm:text-xl leading-relaxed">
                    "{featuredBook.subtitle}"
                  </p>

                  {/* Excerpt quote */}
                  {featuredBook.pages?.insideFront?.quote && (
                    <blockquote className="neu-inset-sm p-3.5 sm:p-4 rounded-2xl my-1 text-slate-700 font-reading italic text-xs sm:text-base leading-relaxed border-l-4 border-amber-500 w-full">
                      {featuredBook.pages.insideFront.quote.replace(/\*\*/g, "")}
                    </blockquote>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[0.72rem] sm:text-xs font-sans text-slate-500 mt-1">
                    <span>
                      Penulis: <strong className="text-slate-800">{featuredBook.author}</strong>
                    </span>
                    <span>•</span>
                    <span>Genre: <strong className="text-slate-800">{featuredBook.genre}</strong></span>
                    <span>•</span>
                    <span>Tahun: <strong className="text-slate-800">{featuredBook.year_published}</strong></span>
                  </div>

                  {/* Dual Clay Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 sm:pt-4 w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenBook(featuredBook, "3d")}
                      className="clay-btn-primary px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto"
                    >
                      <i className="fa-solid fa-book-open-reader"></i>
                      <span>Buka Versi Buku 3D</span>
                    </button>

                    <button
                      onClick={() => handleOpenBook(featuredBook, "zen")}
                      className="clay-btn-secondary px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto"
                    >
                      <i className="fa-solid fa-align-left text-amber-600"></i>
                      <span>Baca Mode Zen</span>
                    </button>
                  </div>
                </div>

                {/* Right: Graphic Book Spine Display (Tactile Clay Card) */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                  <div
                    onClick={() => handleOpenBook(featuredBook, "3d")}
                    className="clay-card group cursor-pointer relative w-full max-w-[270px] sm:max-w-[310px] h-[350px] sm:h-[400px] p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-white via-[#f6f9fc] to-[#e8eef6] hover:scale-[1.02] transition-transform duration-300 mx-auto lg:mx-0"
                  >
                    <div className="flex justify-between items-start text-xs text-amber-600">
                      <span className="clay-pill bg-amber-50 text-amber-800 text-[0.65rem] sm:text-[0.68rem] uppercase tracking-widest font-sans font-bold px-2.5 sm:px-3 py-1">
                        EDISI UTAMA
                      </span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <i className="fa-solid fa-bookmark text-xs sm:text-sm"></i>
                      </div>
                    </div>

                    <div className="text-center my-auto py-4 sm:py-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md shadow-amber-500/20">
                        <i className="fa-solid fa-feather-pointed text-lg sm:text-xl"></i>
                      </div>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 group-hover:text-amber-700 transition-colors leading-tight mb-2">
                        {featuredBook.title}
                      </h3>
                      <p className="font-editorial italic text-xs sm:text-sm text-slate-500 line-clamp-2">
                        {featuredBook.subtitle}
                      </p>
                    </div>

                    <div className="text-center pt-2 sm:pt-4 text-xs font-sans">
                      <span className="clay-pill bg-white text-amber-700 px-4 py-2 flex items-center justify-center gap-2 font-bold group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                        <span>Buka Halaman</span>
                        <i className="fa-solid fa-arrow-right text-[0.7rem]"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Quote Carousel Section ("Untaian Kata Pilihan") */}
          <section id="kutipan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20 w-full">
            <div className="clay-card p-5 sm:p-8 md:p-10 relative bg-gradient-to-br from-[#ffffff] to-[#f2f6fc]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 text-xs sm:text-sm shrink-0">
                    <i className="fa-solid fa-quote-left"></i>
                  </div>
                  <div>
                    <h2 className="text-[0.72rem] sm:text-xs font-sans tracking-[0.18em] uppercase font-bold text-slate-700">
                      Untaian Kata Pilihan
                    </h2>
                    <span className="text-[0.68rem] sm:text-[0.72rem] text-slate-500 font-sans">
                      Kutipan sarat makna dari lembaran cerita
                    </span>
                  </div>
                </div>

                {/* Quote Switcher Controls */}
                <div className="flex items-center gap-2 bg-[#e8edf4] p-1 sm:p-1.5 rounded-full neu-inset-sm">
                  {literaryQuotes.map((_, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => setActiveQuoteIdx(qIdx)}
                      className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        activeQuoteIdx === qIdx
                          ? "w-6 sm:w-8 bg-amber-500 shadow-sm"
                          : "w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                      title={`Kutipan ${qIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Active Quote Content */}
              <div className="min-h-[100px] sm:min-h-[120px] flex flex-col justify-center">
                <p className="font-reading text-base sm:text-xl md:text-2xl text-slate-800 italic leading-relaxed mb-4 sm:mb-6">
                  "{literaryQuotes[activeQuoteIdx].quote}"
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[0.72rem] sm:text-xs font-sans text-slate-600">
                    <span className="text-amber-700 font-bold">
                      - {literaryQuotes[activeQuoteIdx].author}
                    </span>
                    <span>dalam</span>
                    <span className="text-slate-800 font-editorial font-semibold">
                      « {literaryQuotes[activeQuoteIdx].storyTitle} »
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() =>
                        handleCopyQuote(
                          literaryQuotes[activeQuoteIdx].quote,
                          literaryQuotes[activeQuoteIdx].author,
                          literaryQuotes[activeQuoteIdx].storyTitle
                        )
                      }
                      className="clay-btn-secondary px-3.5 sm:px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                      title="Salin kutipan ini"
                    >
                      <i className="fa-regular fa-copy text-xs"></i>
                      <span>Salin</span>
                    </button>

                    <button
                      onClick={() => {
                        const targetBook = cerpenData.find(
                          (b) => b.id === literaryQuotes[activeQuoteIdx].bookId
                        );
                        if (targetBook) handleOpenBook(targetBook, "zen");
                      }}
                      className="clay-btn-primary px-3.5 sm:px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Baca Cerita</span>
                      <i className="fa-solid fa-arrow-right text-[0.7rem]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Catalog Filter & Search Section */}
          <section id="koleksi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14 w-full scroll-mt-24">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Search Bar with Neumorphic Inset Well */}
              <div className="relative w-full max-w-2xl mx-auto neu-inset rounded-2xl p-1 sm:p-1.5 focus-within:ring-2 focus-within:ring-amber-500/40 transition-all">
                <div className="relative flex items-center">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 sm:left-4 text-amber-600 text-xs sm:text-sm pointer-events-none"></i>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari judul cerpen, tokoh, atau sinopsis..."
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 pl-10 sm:pl-11 pr-16 sm:pr-20 py-2.5 sm:py-3 text-xs sm:text-sm outline-none border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-10 sm:right-12 text-slate-400 hover:text-slate-700 text-xs cursor-pointer p-1"
                      title="Hapus pencarian"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                  <span className="absolute right-4 text-[0.68rem] tabular-nums px-2 py-0.5 rounded-lg neu-inset-sm bg-white/70 text-slate-500 font-semibold pointer-events-none hidden md:inline">
                    /
                  </span>
                </div>
              </div>

              {/* Genre Filter Tabs with Counts (Horizontally scrollable on mobile) */}
              <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar gap-2 sm:gap-2.5 pb-2 sm:pb-0 px-1 justify-start sm:justify-center w-full">
                {uniqueGenres.map((genre) => {
                  const count = getGenreCount(genre);
                  const isActive = activeGenre === genre;

                  return (
                    <button
                      key={genre}
                      onClick={() => setActiveGenre(genre)}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-sans cursor-pointer flex items-center gap-2 sm:gap-2.5 transition-all shrink-0 ${
                        isActive
                          ? "clay-btn-primary"
                          : "clay-btn-secondary"
                      }`}
                    >
                      <span>{genre}</span>
                      <span
                        className={`text-[0.65rem] sm:text-[0.68rem] tabular-nums px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? "bg-black/20 text-white"
                            : "neu-inset-sm bg-slate-200/80 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bookshelf Component */}
          <main className="flex-grow pt-6 sm:pt-8 pb-16 sm:pb-24 w-full">
            {filteredBooks.length > 0 ? (
              <BookShelf
                books={filteredBooks}
                onSelectBook={handleOpenBook}
                activeGenre={activeGenre}
              />
            ) : (
              <div className="text-center py-14 sm:py-20 px-4 max-w-md mx-auto clay-card p-6 sm:p-10 bg-white/90">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-amber-500/15 flex items-center justify-center mx-auto mb-4 text-amber-600 text-xl sm:text-2xl shadow-inner">
                  <i className="fa-solid fa-scroll"></i>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-800 mb-2">
                  Tidak Ada Cerita Ditemukan
                </h3>
                <p className="font-reading italic text-xs sm:text-sm text-slate-500 mb-6">
                  Tidak ada kisah yang cocok dengan kata kunci "{searchTerm}". Silakan periksa ejaan atau pilih genre lain.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveGenre("Semua");
                  }}
                  className="clay-btn-primary px-5 py-2.5 text-xs font-sans font-bold cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </main>

          {/* Editorial About Section */}
          <section id="tentang" className="bg-gradient-to-b from-[#eef2f7] to-[#e4eaf2] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 w-full border-t border-slate-200/60">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Side Facts & Metadata */}
              <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
                <div>
                  <span className="text-[0.65rem] sm:text-[0.7rem] tracking-[0.22em] uppercase font-bold text-amber-700 block mb-1.5 font-sans">
                    Arsip & Informasi
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                    Mengenai Ruang Cerita
                  </h3>
                </div>

                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="clay-card p-3.5 sm:p-4 bg-white/80">
                    <span className="text-slate-500 block uppercase tracking-wider text-[0.62rem] sm:text-[0.65rem] mb-1 font-semibold">
                      Karya & Dedikasi
                    </span>
                    <span className="text-slate-800 font-bold text-xs sm:text-sm">
                      Andaru Ilham Amerta (7arzz)
                    </span>
                  </div>

                  <div className="clay-card p-3.5 sm:p-4 bg-white/80">
                    <span className="text-slate-500 block uppercase tracking-wider text-[0.62rem] sm:text-[0.65rem] mb-1 font-semibold">
                      Karakteristik Bacaan
                    </span>
                    <span className="text-slate-800 font-semibold text-xs sm:text-sm">
                      Interaktif 3D Flipbook & E-Reader Imersif
                    </span>
                  </div>

                  <div className="clay-card p-3.5 sm:p-4 bg-white/80">
                    <span className="text-slate-500 block uppercase tracking-wider text-[0.62rem] sm:text-[0.65rem] mb-1 font-semibold">
                      Platform & Akses
                    </span>
                    <span className="text-slate-800 font-semibold text-xs sm:text-sm">
                      Web Terbuka Bebas Iklan & Tanpa Pelacak
                    </span>
                  </div>

                  <div className="clay-card p-3.5 sm:p-4 bg-white/80">
                    <span className="text-slate-500 block uppercase tracking-wider text-[0.62rem] sm:text-[0.65rem] mb-1 font-semibold">
                      Tahun Publikasi
                    </span>
                    <span className="text-slate-800 font-semibold text-xs sm:text-sm">
                      2026 - Edisi Digital Resmi
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Literary Essay / Vision */}
              <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6 justify-center clay-card p-6 sm:p-10 md:p-12 bg-white/90">
                <p className="font-editorial italic text-lg sm:text-2xl text-slate-800 leading-relaxed">
                  "Menulis adalah cara mengabadikan hal-hal yang sering kali luput oleh riuh dunia: hangatnya tatapan di koridor sekolah, keberanian merangkai mimpi di bengkel sepi, hingga satu kalimat cinta yang diucap dalam enam bahasa."
                </p>

                <p className="font-reading text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed sm:leading-loose">
                  Ruang Cerita lahir dari kerinduan akan ruang baca digital yang tenang dan menghargai sastra. Kami menghadirkan dua cara membaca yang saling melengkapi: membalik halaman buku 3D selayaknya membuka buku fisik klasik, atau menyelami barisan paragraf dalam Mode Zen yang nyaman bagi mata di semua perangkat.
                </p>

                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                    <i className="fa-solid fa-signature text-base sm:text-xl"></i>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-sans font-bold text-slate-900 block">
                      Andaru Ilham Amerta
                    </span>
                    <span className="text-[0.68rem] sm:text-[0.72rem] text-slate-500 font-sans block">
                      Penulis & Pengembang Ruang Cerita
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Collaboration & Custom Web Creation Section ("Kirim Cerita & Jasa Pembuatan Web Custom") */}
          <section id="kolaborasi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 w-full scroll-mt-24">
            <div className="clay-card p-6 sm:p-10 md:p-14 relative overflow-hidden bg-gradient-to-br from-[#ffffff] via-[#f7fbf9] to-[#edf7f2] border border-emerald-100">
              {/* Header Badge */}
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                <div className="clay-pill bg-emerald-100/90 text-emerald-800 text-[0.68rem] sm:text-xs font-sans tracking-[0.2em] uppercase font-bold px-4 py-1.5 mb-4 inline-flex items-center gap-2">
                  <i className="fa-solid fa-handshake-angle text-emerald-600 text-xs"></i>
                  <span>Kolaborasi Karya & Jasa Pembuatan Web</span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight mb-4">
                  Ingin Mempublikasikan Cerpen atau Butuh{" "}
                  <span className="font-editorial italic font-normal text-emerald-700 block sm:inline">
                    Website Custom?
                  </span>
                </h2>

                <p className="font-reading text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
                  Ruang Cerita menyambut karya sastra dari para penulis berbakat dan juga menyediakan jasa perancangan website custom dengan sentuhan estetika premium, simulasi 3D interaktif, serta performa maksimal.
                </p>
              </div>

              {/* 2 Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Option 1: Kirim Cerpen */}
                <div className="clay-card p-6 sm:p-8 bg-white/90 flex flex-col justify-between gap-6 border border-white hover:border-emerald-200 transition-all">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
                      <i className="fa-solid fa-book-open"></i>
                    </div>
                    <div>
                      <span className="text-[0.68rem] tracking-widest uppercase font-bold text-amber-700 block mb-1">
                        Untuk Penulis & Kreator Cerita
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-2">
                        Publikasi Cerpen di Ruang Cerita
                      </h3>
                      <p className="font-reading text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Punya naskah cerita pendek, serial fiksi, atau kisah romansa/fantasi? Kirimkan naskahmu untuk dikurasi dan diterbitkan di Ruang Cerita lengkap dengan efek buku 3D interaktif dan mode baca zen.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/6289502567101?text=Halo%207arzz%2C%20saya%20ingin%20mengirimkan%20naskah%20cerpen%2Fcerita%20saya%20untuk%20diterbitkan%20di%20Ruang%20Cerita."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-primary px-5 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer no-underline"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Kirim Cerpen ke 7arzz</span>
                  </a>
                </div>

                {/* Option 2: Jasa Bikin Web Custom */}
                <div className="clay-card p-6 sm:p-8 bg-white/90 flex flex-col justify-between gap-6 border border-white hover:border-emerald-200 transition-all">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                      <i className="fa-solid fa-laptop-code"></i>
                    </div>
                    <div>
                      <span className="text-[0.68rem] tracking-widest uppercase font-bold text-emerald-700 block mb-1">
                        Untuk Individu, Bisnis & Proyek
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-2">
                        Jasa Pembuatan Website Custom
                      </h3>
                      <p className="font-reading text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Ingin website portofolio, landing page personal/perusahaan, atau aplikasi web interaktif dengan desain neumorphic/claymorphism modern, responsif di semua perangkat, dan berkecepatan tinggi? Konsultasikan langsung bersama 7arzz.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/6289502567101?text=Halo%207arzz%2C%20saya%20ingin%20konsultasi%20pembuatan%20website%20custom%20(portofolio%2Flanding%20page%2Fsistem%20web)."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-secondary px-5 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 cursor-pointer no-underline border border-emerald-300"
                  >
                    <i className="fa-solid fa-code text-xs"></i>
                    <span>Konsultasi Web Custom</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Monumental Footer Section */}
          <footer className="w-full bg-[#e6ebf2] pt-12 sm:pt-16 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-white">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              {/* Neumorphic Wordmark Deboss */}
              <div className="font-display font-black text-3xl xs:text-4xl sm:text-6xl md:text-8xl tracking-wider sm:tracking-widest text-slate-300/60 select-none pointer-events-none mb-4 sm:mb-6 truncate max-w-full px-2">
                RUANG CERITA
              </div>

              <div className="max-w-xl mx-auto mb-8 sm:mb-10 text-xs sm:text-sm text-slate-600 font-reading leading-relaxed px-2">
                Koleksi cerpen dan serial fiksi digital. Seluruh karakter, peristiwa, dan semesta dalam karya ini adalah buah imajinasi sastra.
              </div>

              {/* Links & Quick Back to top */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-sans text-slate-600 pb-8 sm:pb-10 w-full">
                <a href="#koleksi" className="hover:text-amber-600 transition-colors font-medium">
                  Katalog Cerita
                </a>
                <a href="#kutipan" className="hover:text-amber-600 transition-colors font-medium">
                  Kutipan Pilihan
                </a>
                <a href="#tentang" className="hover:text-amber-600 transition-colors font-medium">
                  Tentang Penulis
                </a>
                <a href="#kolaborasi" className="hover:text-emerald-600 transition-colors font-medium flex items-center gap-1.5">
                  <i className="fa-brands fa-whatsapp text-emerald-600"></i>
                  <span>Kirim Cerpen / Jasa Web</span>
                </a>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="clay-btn-secondary px-3.5 sm:px-4 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ke Atas</span>
                  <i className="fa-solid fa-arrow-up text-[0.65rem]"></i>
                </button>
              </div>

              {/* Legal Copyright */}
              <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between w-full text-[0.7rem] sm:text-[0.75rem] text-slate-500 font-sans gap-2 sm:gap-3 border-t border-slate-300/50">
                <span>
                  © {new Date().getFullYear()} Ruang Cerita. Seluruh hak cipta karya sastra dilindungi.
                </span>
                <span>
                  Dirancang & diukir digital oleh{" "}
                  <a
                    href="https://wa.me/6289502567101"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-emerald-700 font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    Andaru Ilham Amerta (7arzz)
                    <i className="fa-brands fa-whatsapp text-emerald-600"></i>
                  </a>
                </span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
