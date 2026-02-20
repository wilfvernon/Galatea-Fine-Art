import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import './Bookshelf.css';

const PAGE_CHAR_LIMIT = 1200;

const splitParagraphToChunks = (paragraph, limit) => {
  if (!paragraph || paragraph.length <= limit) return [paragraph];

  const lines = paragraph.split('\n');
  const chunks = [];
  let current = '';

  lines.forEach((line) => {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length <= limit) {
      current = candidate;
      return;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (line.length <= limit) {
      current = line;
      return;
    }

    const words = line.split(/(\s+)/).filter(Boolean);
    let segment = '';

    words.forEach((word) => {
      const next = `${segment}${word}`;
      if (next.length <= limit) {
        segment = next;
      } else {
        if (segment) chunks.push(segment.trimEnd());
        segment = word.trimStart();
      }
    });

    if (segment) {
      current = segment;
    }
  });

  if (current) chunks.push(current);
  return chunks.filter(Boolean);
};

const paginateChapterBody = (body, limit) => {
  const paragraphs = (body ?? '')
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [[]];

  const expanded = paragraphs.flatMap((paragraph) => splitParagraphToChunks(paragraph, limit));

  const pages = [];
  let current = [];
  let used = 0;

  expanded.forEach((paragraph) => {
    const cost = paragraph.length + 40;
    if (current.length > 0 && used + cost > limit) {
      pages.push(current);
      current = [];
      used = 0;
    }

    current.push(paragraph);
    used += cost;
  });

  if (current.length > 0) pages.push(current);
  return pages;
};

const buildReaderPages = (book, chapters) => {
  const pages = [
    {
      type: 'cover',
      id: `cover-${book.id}`,
      title: book.title ?? 'Untitled',
      coverImageUrl: book.cover_image_url ?? '',
    },
  ];

  chapters.forEach((chapter, chapterIndex) => {
    const chunks = paginateChapterBody(chapter.body ?? '', PAGE_CHAR_LIMIT);
    chunks.forEach((paragraphs, pageIndex) => {
      pages.push({
        type: 'chapter',
        id: `${chapter.id}-${pageIndex}`,
        title: chapter.title ?? `Chapter ${chapterIndex + 1}`,
        chapterNumber: chapterIndex + 1,
        showHeading: pageIndex === 0,
        paragraphs,
      });
    });
  });

  return pages;
};

function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [activeBookId, setActiveBookId] = useState('');
  const [chapters, setChapters] = useState([]);

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true);
      setStatus('');

      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, cover_image_url')
        .order('title', { ascending: true });

      if (error) {
        setStatus(`Unable to load books: ${error.message}`);
        setBooks([]);
        setLoadingBooks(false);
        return;
      }

      setBooks(data ?? []);
      setLoadingBooks(false);
    };

    loadBooks();
  }, []);

  useEffect(() => {
    if (!activeBookId) {
      setChapters([]);
      return;
    }

    const loadChapters = async () => {
      setLoadingChapters(true);
      setStatus('');

      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, body, created_at')
        .eq('book_id', activeBookId)
        .order('created_at', { ascending: true });

      if (error) {
        setStatus(`Unable to load chapters: ${error.message}`);
        setChapters([]);
        setLoadingChapters(false);
        return;
      }

      setChapters(data ?? []);
      setLoadingChapters(false);
    };

    loadChapters();
  }, [activeBookId]);

  useEffect(() => {
    if (!activeBookId) return;

    const onEscape = (event) => {
      if (event.key === 'Escape') setActiveBookId('');
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [activeBookId]);

  const activeBook = useMemo(
    () => books.find((book) => book.id === activeBookId) ?? null,
    [books, activeBookId]
  );

  const openBook = (bookId) => {
    setActiveBookId(bookId);
    setCurrentPage(0);
  };

  const closeReader = () => {
    setActiveBookId('');
    setChapters([]);
    setCurrentPage(0);
  };

  const readerPages = useMemo(() => {
    if (!activeBook || chapters.length === 0) return [];
    return buildReaderPages(activeBook, chapters);
  }, [activeBook, chapters]);

  const activePage = readerPages[currentPage] ?? null;

  useEffect(() => {
    setCurrentPage(0);
  }, [readerPages.length]);

  const movePage = (delta) => {
    setCurrentPage((previous) => {
      const next = previous + delta;
      if (next < 0) return 0;
      if (next > readerPages.length - 1) return Math.max(readerPages.length - 1, 0);
      return next;
    });
  };

  return (
    <div className="page-container bookshelf-page">
      <h1>Bookshelf</h1>

      {status && <p className="bookshelf-status">{status}</p>}
      {loadingBooks && <p className="bookshelf-status">Loading books...</p>}

      {!loadingBooks && books.length === 0 && (
        <p className="bookshelf-status">No books available yet.</p>
      )}

      <section className="bookshelf-list" aria-label="Book list">
        {books.map((book) => (
          <button
            key={book.id}
            type="button"
            className="bookshelf-list-item"
            onClick={() => openBook(book.id)}
          >
            <span className="bookshelf-list-title">{book.title}</span>
            <span className="bookshelf-list-author">{book.author}</span>
          </button>
        ))}
      </section>

      {activeBook && (
        <div className="reader-modal-backdrop" onClick={closeReader}>
          <section className="reader-modal" aria-label="Book reader" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="reader-close-btn" onClick={closeReader} aria-label="Close reader">
              ×
            </button>

            {loadingChapters && <p className="bookshelf-status">Loading chapters...</p>}
            {!loadingChapters && chapters.length === 0 && (
              <p className="bookshelf-status">No chapters for this book yet.</p>
            )}

            {!loadingChapters && chapters.length > 0 && (
              <div className="reader-flipbook-wrap">
                {activePage?.type === 'cover' && (
                  <article className="reader-leaf reader-leaf-cover">
                    <div className="reader-cover-image-wrap">
                      {activePage.coverImageUrl ? (
                        <img className="reader-cover-image" src={activePage.coverImageUrl} alt={`${activePage.title} cover`} />
                      ) : (
                        <div className="reader-cover-fallback" />
                      )}
                    </div>
                  </article>
                )}

                {activePage?.type === 'chapter' && (
                  <article className="reader-leaf">
                    <header className="reader-leaf-head">
                      <h3>{activePage.title}</h3>
                      <span>
                        {currentPage + 1} / {readerPages.length}
                      </span>
                    </header>
                    <div className="reader-leaf-body">
                      {activePage.showHeading && (
                        <div className="reader-body-chapter-wrap">
                          <h4 className="reader-body-chapter-heading">
                            {activePage.title
                              .split(':')
                              .map((part) => part.trim())
                              .filter(Boolean)
                              .map((part, index) => (
                                <span key={`${activePage.id}-${part}-${index}`} className="reader-body-chapter-line">
                                  {part}
                                </span>
                              ))}
                          </h4>
                          <div className="reader-body-chapter-divider" />
                        </div>
                      )}

                      {activePage.paragraphs.map((paragraph, index) => (
                        <p key={`${activePage.id}-p-${index}`}>{paragraph}</p>
                      ))}
                    </div>
                  </article>
                )}
              </div>
            )}

            {readerPages.length > 0 && (
              <div className="reader-leaf-actions">
                <button
                  type="button"
                  className="reader-turn-btn"
                  onClick={() => movePage(-1)}
                  disabled={currentPage <= 0}
                  aria-label="Previous page"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="reader-turn-btn"
                  onClick={() => movePage(1)}
                  disabled={currentPage >= readerPages.length - 1}
                  aria-label="Next page"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Bookshelf;
