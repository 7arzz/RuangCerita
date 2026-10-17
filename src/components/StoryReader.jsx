import React, { useState, useEffect, useRef } from "react";

export default function StoryReader({ book, onClose, onSwitchTo3D }) {
  const [fontSize, setFontSize] = useState("text-base"); // 'text-sm', 'text-base', 'text-lg', 'text-xl'
  const [fontFamily, setFontFamily] = useState("serif"); // 'serif' or 'sans'
  const [theme, setTheme] = useState("light"); // 'dark', 'sepia', 'light'
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  const scrollRef = useRef(null);

  // Prevent background document scrolling when reader is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Reset scroll on book change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [book]);

  // Handle scroll progress
  const handleScroll = (e) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      const progress = Math.min(100, Math.max(0, (target.scrollTop / totalHeight) * 100));
      setScrollProgress(progress);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (tocOpen) setTocOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tocOpen, onClose]);

  const formatParagraphs = (content) => {
    if (!content) return null;
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();

      if (trimmed === "---") {
        return (
          <div key={idx} className="flex items-center justify-center gap-3 my-12 opacity-30">
            <div className="w-16 h-[2px] bg-current" />
            <i className="fa-solid fa-diamond text-[0.45rem]" />
            <div className="w-16 h-[2px] bg-current" />
          </div>
        );
      }

      if (trimmed.startsWith(">")) {
        const lines = trimmed
          .split("\n")
          .filter((l) => l.trim().startsWith(">"))
          .map((l) => l.replace(/^>\s?/, "").trim());

        const combined = lines.join("<br/>");
        const withFormatting = combined
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>");

        return (
          <blockquote
            key={idx}
            className="border-l-2 pl-5 my-8 italic text-lg leading-relaxed opacity-90 rounded-r-lg py-2"
            style={{
              borderColor: accent,
              backgroundColor: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
            }}
            dangerouslySetInnerHTML={{ __html: withFormatting }}
          />
        );
      }

      if (trimmed.startsWith("### ")) {
        const text = trimmed.replace(/^###\s+/, "");
        return (
          <h4
            key={idx}
            className="text-lg font-bold mt-10 mb-3 tracking-wide"
            style={{ fontFamily: "var(--font-sans, system-ui)" }}
          >
            {text}
          </h4>
        );
      }

      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace(/^##\s+/, "");
        return (
          <h3
            key={idx}
            className="text-xl font-bold mt-12 mb-4 tracking-wide"
            style={{ fontFamily: "var(--font-editorial, serif)" }}
          >
            {text}
          </h3>
        );
      }

      if (trimmed.startsWith("# ")) {
        const text = trimmed.replace(/^#\s+/, "");
        return (
          <h2
            key={idx}
            className="text-2xl font-bold mt-14 mb-5"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            {text}
          </h2>
        );
      }

      let html = trimmed
        .replace(/\n/g, "<br/>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return (
        <p
          key={idx}
          className="mb-6 leading-[2] tracking-[0.01em]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  const getPagesContent = () => {
    if (!book || !book.pages) return [];

    const pagesArray = [];

    if (book.pages.insideFront) {
      pagesArray.push({ type: "quote", content: book.pages.insideFront });
    }

    const pageKeys = Object.keys(book.pages)
      .filter((key) => key.startsWith("page"))
      .sort(
        (a, b) =>
          parseInt(a.replace("page", ""), 10) - parseInt(b.replace("page", ""), 10)
      );

    let currentChapter = "";

    pageKeys.forEach((key, index) => {
      const page = book.pages[key];
      if (page.chapter && page.chapter !== currentChapter) {
        pagesArray.push({
          type: "chapter_header",
          chapter: page.chapter,
          title: page.title,
          id: `chapter-${index}`
        });
        currentChapter = page.chapter;
      }
      pagesArray.push({ type: "content", content: page.content });
    });

    return pagesArray;
  };

  const pagesContent = getPagesContent();
  const chaptersList = pagesContent.filter((p) => p.type === "chapter_header");
  const accent = book?.theme?.accentColor || "#c5a059";

  // Themes Color Palettes
  const themeStyles = {
    dark: {
      bg: "#080b11",
      surface: "rgba(14, 19, 29, 0.94)",
      text: "#f0eae1",
      textMuted: "#9da4b2",
      border: "rgba(255, 255, 255, 0.08)",
      accent: "#c5a059",
      btnActive: "#c5a059",
      btnActiveText: "#080b11"
    },
    sepia: {
      bg: "#f4ece1",
      surface: "rgba(244, 236, 225, 0.94)",
      text: "#3e3124",
      textMuted: "#796652",
      border: "rgba(139, 115, 85, 0.2)",
      accent: "#9c6b32",
      btnActive: "#9c6b32",
      btnActiveText: "#ffffff"
    },
    light: {
      bg: "#eef2f7",
      surface: "rgba(238, 242, 247, 0.94)",
      text: "#1e293b",
      textMuted: "#64748b",
      border: "rgba(255, 255, 255, 0.9)",
      accent: "#d97706",
      btnActive: "#d97706",
      btnActiveText: "#ffffff"
    }
  };

  const currentTheme = themeStyles[theme];

  const fontSizeMap = {
    "text-sm": { size: "15px", line: "1.9" },
    "text-base": { size: "17.5px", line: "2.0" },
    "text-lg": { size: "20px", line: "2.05" },
    "text-xl": { size: "23px", line: "2.1" }
  };

  const fontConfig = fontFamily === "serif"
    ? 'Newsreader, Playfair Display, Georgia, serif'
    : 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif';

  const scrollToChapter = (chapterId) => {
    const el = document.getElementById(chapterId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTocOpen(false);
    }
  };

  return (
    <div
      data-ui="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.35s ease, color 0.35s ease",
        fontFamily: fontConfig
      }}
    >
      {/* ── Scroll Progress Bar ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          backgroundColor: "rgba(0,0,0,0.1)",
          zIndex: 100
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${scrollProgress}%`,
            backgroundColor: currentTheme.accent,
            transition: "width 0.1s linear"
          }}
        />
      </div>

      {/* ── Sticky Top Bar ── */}
      <header
        style={{
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 90,
          backgroundColor: currentTheme.surface,
          borderBottom: `1px solid ${currentTheme.border}`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          gap: "12px",
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
        }}
      >
        {/* Left: Back & Table of contents */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: "rgba(128,128,128,0.1)",
              border: `1px solid ${currentTheme.border}`,
              color: "inherit",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            title="Kembali ke Beranda (Esc)"
          >
            ← <span className="hidden sm:inline">Kembali</span>
          </button>

          {chaptersList.length > 0 && (
            <button
              onClick={() => setTocOpen(!tocOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "9999px",
                backgroundColor: tocOpen ? currentTheme.accent : "rgba(128,128,128,0.1)",
                color: tocOpen ? currentTheme.btnActiveText : "inherit",
                border: `1px solid ${currentTheme.border}`,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              title="Daftar Bab"
            >
              <i className="fa-solid fa-list-ul text-xs"></i>
              <span className="hidden sm:inline">Daftar Bab</span>
            </button>
          )}

          {/* Switch to 3D Book */}
          {onSwitchTo3D && (
            <button
              onClick={() => onSwitchTo3D(book)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12.5px",
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: "9999px",
                backgroundColor: "rgba(197, 160, 89, 0.15)",
                color: currentTheme.accent,
                border: `1px solid ${currentTheme.accent}`,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              title="Beralih ke format buku 3D interaktif"
            >
              <i className="fa-solid fa-book-open text-xs"></i>
              <span className="hidden md:inline">Mode 3D</span>
            </button>
          )}
        </div>

        {/* Center: Title snippet (hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center max-w-xs text-center">
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", opacity: 0.9 }}>
            {book.title}
          </span>
          <span style={{ fontSize: "10.5px", color: currentTheme.textMuted }}>
            {Math.round(scrollProgress)}% Selesai
          </span>
        </div>

        {/* Right: Controls (Font style, Font size, Theme) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Font Serif vs Sans Toggle */}
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(128,128,128,0.12)",
              borderRadius: "9999px",
              padding: "2px"
            }}
          >
            <button
              onClick={() => setFontFamily("serif")}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                backgroundColor: fontFamily === "serif" ? currentTheme.btnActive : "transparent",
                color: fontFamily === "serif" ? currentTheme.btnActiveText : "inherit",
                transition: "all 0.2s"
              }}
              title="Font Serif Sastra (Newsreader)"
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily("sans")}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                backgroundColor: fontFamily === "sans" ? currentTheme.btnActive : "transparent",
                color: fontFamily === "sans" ? currentTheme.btnActiveText : "inherit",
                transition: "all 0.2s"
              }}
              title="Font Sans Modern"
            >
              Sans
            </button>
          </div>

          {/* Font Sizes */}
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(128,128,128,0.12)",
              borderRadius: "9999px",
              padding: "2px"
            }}
          >
            {[
              { key: "text-sm", label: "A-", title: "Kecil (15px)" },
              { key: "text-base", label: "A", title: "Normal (17.5px)" },
              { key: "text-lg", label: "A+", title: "Besar (20px)" }
            ].map(({ key, label, title }) => (
              <button
                key={key}
                onClick={() => setFontSize(key)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: fontSize === key ? currentTheme.btnActive : "transparent",
                  color: fontSize === key ? currentTheme.btnActiveText : "inherit",
                  transition: "all 0.2s"
                }}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Theme Swatches */}
          <div style={{ display: "flex", gap: "6px", marginLeft: "4px" }}>
            {[
              { key: "dark", bg: "#080b11", border: "#334155", title: "Malam Obsidian" },
              { key: "sepia", bg: "#f4ece1", border: "#8b7355", title: "Kertas Sepia" },
              { key: "light", bg: "#faf8f5", border: "#94a3b8", title: "Parchment Bersih" }
            ].map(({ key, bg, border, title }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: bg,
                  border: `2px solid ${theme === key ? currentTheme.accent : border}`,
                  cursor: "pointer",
                  transform: theme === key ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.2s"
                }}
                title={title}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ── Table of Contents Dropdown Drawer ── */}
      {tocOpen && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 16,
            zIndex: 95,
            width: "300px",
            maxHeight: "75vh",
            overflowY: "auto",
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            padding: "16px",
            backdropFilter: "blur(20px)"
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: currentTheme.accent,
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: `1px solid ${currentTheme.border}`
            }}
          >
            Daftar Bab & Isi
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {chaptersList.map((chap, i) => (
              <button
                key={i}
                onClick={() => scrollToChapter(chap.id)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(128,128,128,0.06)",
                  border: "none",
                  color: "inherit",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(128,128,128,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(128,128,128,0.06)";
                }}
              >
                <span style={{ fontSize: "10.5px", color: currentTheme.accent, fontWeight: 700 }}>
                  {chap.chapter}
                </span>
                <span style={{ fontWeight: 600 }}>{chap.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Scrollable Story Text Container ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {/* Cover Hero Block */}
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "80px 24px 60px",
            textAlign: "center",
            position: "relative"
          }}
        >
          {/* Genre Badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "16px"
            }}
          >
            {book.genre &&
              book.genre.split(",").map((g, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: currentTheme.accent,
                    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                    fontWeight: 700,
                    opacity: 0.95
                  }}
                >
                  {g.trim()}
                </span>
              ))}
          </div>

          {/* Book Title */}
          <h1
            style={{
              fontSize: "clamp(34px, 7vw, 56px)",
              fontFamily: "Cinzel, Playfair Display, serif",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "16px",
              letterSpacing: "-0.01em"
            }}
          >
            {book.title}
          </h1>

          {/* Subtitle */}
          {book.subtitle && (
            <p
              style={{
                fontSize: "clamp(16px, 3.5vw, 21px)",
                fontFamily: "Newsreader, Playfair Display, Georgia, serif",
                fontStyle: "italic",
                opacity: 0.82,
                lineHeight: 1.5,
                maxWidth: "600px",
                margin: "0 auto 28px"
              }}
            >
              {book.subtitle}
            </p>
          )}

          {/* Author Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "6px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(128,128,128,0.08)",
              border: `1px solid ${currentTheme.border}`,
              fontSize: "13px",
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
            }}
          >
            <i className="fa-solid fa-feather-pointed" style={{ color: currentTheme.accent }}></i>
            <span>
              Ditulis oleh <strong>{book.author}</strong>
            </span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: currentTheme.textMuted }}>Edisi {book.year_published || "2026"}</span>
          </div>

          <div
            style={{
              width: "60px",
              height: "2px",
              backgroundColor: currentTheme.accent,
              margin: "40px auto 0",
              opacity: 0.6
            }}
          />
        </div>

        {/* Main Prose Text Area */}
        <main
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: "0 24px 100px",
            fontSize: fontSizeMap[fontSize].size,
            lineHeight: fontSizeMap[fontSize].line
          }}
        >
          {pagesContent.map((item, idx) => {
            if (item.type === "quote") {
              return (
                <div
                  key={idx}
                  style={{
                    margin: "40px 0 60px",
                    padding: "36px 28px",
                    borderTop: `1px solid ${currentTheme.border}`,
                    borderBottom: `1px solid ${currentTheme.border}`,
                    textAlign: "center",
                    backgroundColor: "rgba(128,128,128,0.03)",
                    borderRadius: "8px"
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.2em",
                      fontStyle: "italic",
                      lineHeight: 1.7,
                      marginBottom: "14px"
                    }}
                    dangerouslySetInnerHTML={{
                      __html: item.content.quote.replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>"
                      )
                    }}
                  />
                  <div
                    style={{
                      fontSize: "0.85em",
                      fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: currentTheme.accent,
                      fontWeight: 600
                    }}
                    dangerouslySetInnerHTML={{
                      __html: item.content.author.replace(
                        /\*(.*?)\*/g,
                        "<em>$1</em>"
                      )
                    }}
                  />
                </div>
              );
            }

            if (item.type === "chapter_header") {
              return (
                <div
                  key={idx}
                  id={item.id}
                  style={{
                    marginTop: "84px",
                    marginBottom: "44px",
                    textAlign: "center",
                    scrollMarginTop: "90px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: currentTheme.accent,
                      display: "block",
                      marginBottom: "8px"
                    }}
                  >
                    {item.chapter}
                  </span>
                  <h3
                    style={{
                      fontSize: "clamp(24px, 5.5vw, 36px)",
                      fontFamily: "Cinzel, Playfair Display, serif",
                      fontWeight: 700,
                      lineHeight: 1.25
                    }}
                  >
                    {item.title}
                  </h3>
                  <div
                    style={{
                      width: "48px",
                      height: "1px",
                      backgroundColor: currentTheme.border,
                      margin: "24px auto 0"
                    }}
                  />
                </div>
              );
            }

            if (item.type === "content") {
              return <div key={idx}>{formatParagraphs(item.content)}</div>;
            }

            return null;
          })}
        </main>

        {/* ── Finished Reading Footer ── */}
        <footer
          style={{
            textAlign: "center",
            padding: "50px 24px 80px",
            borderTop: `1px solid ${currentTheme.border}`,
            maxWidth: "680px",
            margin: "0 auto",
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
          }}
        >
          <div style={{ color: currentTheme.accent, marginBottom: "16px" }}>
            <i className="fa-solid fa-feather-pointed" style={{ fontSize: "1.5rem" }} />
          </div>
          <h4
            style={{
              fontSize: "18px",
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              marginBottom: "8px"
            }}
          >
            Akhir dari Lembaran Kisah Ini
          </h4>
          <p
            style={{
              fontSize: "13px",
              color: currentTheme.textMuted,
              marginBottom: "28px",
              maxWidth: "400px",
              margin: "0 auto 28px"
            }}
          >
            Terima kasih telah membaca. Setiap kata yang selesai dibaca adalah kenangan yang hidup di ingatan.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 28px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor: currentTheme.btnActive,
                color: currentTheme.btnActiveText,
                border: "none",
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Kembali ke Rak Buku
            </button>

            {onSwitchTo3D && (
              <button
                onClick={() => onSwitchTo3D(book)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: "rgba(128,128,128,0.1)",
                  border: `1px solid ${currentTheme.border}`,
                  color: "inherit",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Buka Versi 3D
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
