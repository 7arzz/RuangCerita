import React, { useState, useEffect, useRef } from 'react';

export default function StoryReader({ book, onClose }) {
  const [fontSize, setFontSize] = useState('text-base');
  const [theme, setTheme] = useState('dark'); // 'dark' | 'sepia' | 'light'
  const scrollRef = useRef(null);

  // Lock body scroll when reader is open, unlock on close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = prev;
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  // Scroll reader back to top when book changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [book]);

  // Format rich text content — handles bold, italic, blockquote (>), horizontal rule (---)
  const formatParagraphs = (content) => {
    if (!content) return null;
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();

      // Horizontal rule
      if (trimmed === '---') {
        return (
          <div key={idx} className="flex items-center gap-4 my-8 opacity-30">
            <div className="flex-1 h-px bg-current" />
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <div className="flex-1 h-px bg-current" />
          </div>
        );
      }

      // Blockquote lines starting with >
      if (trimmed.startsWith('>')) {
        const lines = trimmed
          .split('\n')
          .filter(l => l.trim().startsWith('>'))
          .map(l => l.replace(/^>\s?/, '').trim());

        const combined = lines.join('<br/>');
        const withBold = combined
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');

        return (
          <blockquote
            key={idx}
            className="border-l-4 pl-4 my-6 italic opacity-80 leading-relaxed"
            style={{ borderColor: book?.theme?.accentColor || '#c9b183' }}
            dangerouslySetInnerHTML={{ __html: withBold }}
          />
        );
      }

      // Heading lines starting with ## or ###
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '');
        return (
          <h4 key={idx} className="text-lg font-sans font-bold mt-10 mb-3 opacity-90">
            {text}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '');
        return (
          <h3 key={idx} className="text-xl font-sans font-bold mt-12 mb-4 opacity-90">
            {text}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^#\s+/, '');
        return (
          <h2 key={idx} className="text-2xl font-sans font-bold mt-14 mb-5 opacity-95">
            {text}
          </h2>
        );
      }

      // Normal paragraph — handle inline single-line \n as <br/>
      let html = trimmed
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      return (
        <p
          key={idx}
          className="mb-5 leading-[1.9]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  // Build flat array of render items from the pages object
  const getPagesContent = () => {
    if (!book || !book.pages) return [];

    const pagesArray = [];

    if (book.pages.insideFront) {
      pagesArray.push({ type: 'quote', content: book.pages.insideFront });
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
          title: page.title,
        });
        currentChapter = page.chapter;
      }
      pagesArray.push({ type: 'content', content: page.content });
    });

    return pagesArray;
  };

  const pagesContent = getPagesContent();
  const accent = book?.theme?.accentColor || '#c9b183';

  const theme_bg = {
    dark: '#0a0f18',
    sepia: '#f4ecd8',
    light: '#f8fafc',
  };
  const theme_text = {
    dark: '#cbd5e1',
    sepia: '#5c4b37',
    light: '#0f172a',
  };
  const theme_header = {
    dark: 'rgba(10,15,24,0.92)',
    sepia: 'rgba(244,236,216,0.92)',
    light: 'rgba(248,250,252,0.92)',
  };
  const theme_border = {
    dark: 'rgba(255,255,255,0.07)',
    sepia: '#d4c5b0',
    light: '#e2e8f0',
  };

  const fontSizeMap = {
    'text-sm': '15px',
    'text-base': '17px',
    'text-lg': '19px',
    'text-xl': '21px',
  };

  return (
    /*
     * Shell: fixed, covers full viewport. Does NOT scroll.
     * This avoids the iOS Safari bug where fixed+overflow-y:auto
     * breaks content rendering to half-screen on many devices.
     */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: theme_bg[theme],
        color: theme_text[theme],
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.4s, color 0.4s',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      {/* ── Sticky top bar ── */}
      <div
        style={{
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: theme_header[theme],
          borderBottom: `1px solid ${theme_border[theme]}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
        }}
      >
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 500,
            opacity: 0.75,
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          ← Kembali
        </button>

        {/* Controls: font size + theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Font size */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(128,128,128,0.15)',
              borderRadius: '999px',
              padding: '3px',
            }}
          >
            {[
              { key: 'text-sm', label: 'A', style: { fontSize: '11px' } },
              { key: 'text-base', label: 'A', style: { fontSize: '14px' } },
              { key: 'text-lg', label: 'A', style: { fontSize: '17px' } },
            ].map(({ key, label, style }) => (
              <button
                key={key}
                onClick={() => setFontSize(key)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontFamily: 'system-ui, sans-serif',
                  backgroundColor: fontSize === key ? accent : 'transparent',
                  color: fontSize === key ? '#000' : 'inherit',
                  opacity: fontSize === key ? 1 : 0.55,
                  transition: 'all 0.2s',
                  ...style,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'currentColor', opacity: 0.2 }} />

          {/* Theme swatches */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'light', bg: '#f8fafc', border: '#cbd5e1' },
              { key: 'sepia', bg: '#f4ecd8', border: '#d4c5b0' },
              { key: 'dark', bg: '#1b263b', border: '#0a0f18' },
            ].map(({ key, bg, border }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                  outline: theme === key ? `2.5px solid ${accent}` : 'none',
                  outlineOffset: '2px',
                  transition: 'outline 0.2s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable content area ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch', // smooth momentum scroll on iOS
        }}
      >
        {/* Book hero / cover block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '64px 20px 48px',
            position: 'relative',
          }}
        >
          {/* Gradient accent */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, ${accent}18, transparent 60%)`,
              pointerEvents: 'none',
            }}
          />
          {/* Genres */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
            {book.genre && book.genre.split(',').map((g, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: accent,
                  fontFamily: 'system-ui, sans-serif',
                  opacity: 0.9,
                }}
              >
                {g.trim()}
              </span>
            ))}
          </div>
          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(28px, 8vw, 52px)',
              fontWeight: 900,
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: '12px',
              maxWidth: '700px',
            }}
          >
            {book.title}
          </h1>
          {/* Subtitle */}
          {book.subtitle && (
            <h2
              style={{
                fontSize: 'clamp(14px, 4vw, 20px)',
                fontStyle: 'italic',
                opacity: 0.75,
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              {book.subtitle}
            </h2>
          )}
          {/* Author separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 1, background: 'currentColor', opacity: 0.3 }} />
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.85 }}>
              {book.author}
            </span>
            <div style={{ width: 40, height: 1, background: 'currentColor', opacity: 0.3 }} />
          </div>
        </div>

        {/* Story content */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            padding: `0 20px 80px`,
            fontSize: fontSizeMap[fontSize] || '17px',
            lineHeight: 1.85,
          }}
        >
          {pagesContent.map((item, idx) => {
            if (item.type === 'quote') {
              return (
                <div
                  key={idx}
                  style={{
                    margin: '48px 0',
                    padding: '32px 24px',
                    borderTop: `1px solid currentColor`,
                    borderBottom: `1px solid currentColor`,
                    opacity: 0.8,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{ fontSize: '1.15em', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '12px' }}
                    dangerouslySetInnerHTML={{
                      __html: item.content.quote.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                  <div
                    style={{ fontSize: '0.8em', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase' }}
                    dangerouslySetInnerHTML={{
                      __html: item.content.author.replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                  />
                </div>
              );
            }

            if (item.type === 'chapter_header') {
              return (
                <div key={idx} style={{ marginTop: '72px', marginBottom: '40px', textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'system-ui, sans-serif',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      opacity: 0.55,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {item.chapter}
                  </span>
                  <h3 style={{ fontSize: 'clamp(22px, 6vw, 34px)', fontWeight: 700, lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  <div
                    style={{
                      width: 56,
                      height: 4,
                      borderRadius: 4,
                      backgroundColor: accent,
                      margin: '20px auto 0',
                    }}
                  />
                </div>
              );
            }

            if (item.type === 'content') {
              return (
                <div key={idx}>
                  {formatParagraphs(item.content)}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px 60px',
            borderTop: '1px solid',
            borderColor: 'rgba(128,128,128,0.2)',
            opacity: 0.7,
          }}
        >
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Akhir dari bacaan.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              borderRadius: '999px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
              color: theme === 'dark' ? '#0f172a' : '#f8fafc',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
