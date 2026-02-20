import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

const sortBooks = (items) => [...items].sort((left, right) => left.title.localeCompare(right.title));

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCoverImage, setBookCoverImage] = useState('');
  const [bookStatus, setBookStatus] = useState('');
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookEditSubmitting, setBookEditSubmitting] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterBody, setChapterBody] = useState('');
  const [chapterStatus, setChapterStatus] = useState('');
  const [chapterDiagnostics, setChapterDiagnostics] = useState('');
  const [chapterSubmitting, setChapterSubmitting] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterEditSubmitting, setChapterEditSubmitting] = useState(false);
  const [chapterRefreshing, setChapterRefreshing] = useState(false);

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);

    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, cover_image_url')
      .order('title', { ascending: true });

    if (error) {
      setBookStatus(`Unable to load books: ${error.message}`);
      setBooks([]);
      setBooksLoading(false);
      return;
    }

    const loadedBooks = sortBooks(data ?? []);
    setBooks(loadedBooks);
    setSelectedBookId((currentId) => {
      if (loadedBooks.length === 0) return '';
      if (loadedBooks.some((book) => book.id === currentId)) return currentId;
      return loadedBooks[0].id;
    });
    setBooksLoading(false);
  }, []);

  const loadChapters = async (bookId) => {
    if (!bookId) {
      setChapters([]);
      setChapterDiagnostics('');
      return;
    }

    setChaptersLoading(true);
    setChapterDiagnostics('');
    const { data, error } = await supabase
      .from('chapters')
      .select('id, title, body, created_at')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });

    if (error) {
      setChapterStatus(`Unable to load chapters: ${error.message}`);
      setChapters([]);
      setChaptersLoading(false);
      return;
    }

    const chapterRows = data ?? [];
    setChapters(chapterRows);

    if (chapterRows.length === 0) {
      const { data: visibleChapters, error: visibleError } = await supabase
        .from('chapters')
        .select('id, book_id')
        .limit(25);

      if (visibleError) {
        setChapterDiagnostics(`Diagnostic query failed: ${visibleError.message}`);
      } else if (!visibleChapters || visibleChapters.length === 0) {
        setChapterDiagnostics(
          'App cannot see any chapters rows. This usually means RLS select policy is blocking this user.'
        );
      } else {
        const visibleBookIds = [...new Set(visibleChapters.map((chapter) => chapter.book_id))]
          .filter(Boolean)
          .join(', ');

        setChapterDiagnostics(
          `App can see ${visibleChapters.length} chapter row(s), but none for selected book_id ${bookId}. Visible book_id values: ${visibleBookIds}`
        );
      }
    }

    setChaptersLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    loadChapters(selectedBookId);
  }, [selectedBookId]);

  const selectedBook = books.find((book) => book.id === selectedBookId);

  const handleRefreshChapters = async () => {
    if (!selectedBookId) return;
    setChapterRefreshing(true);
    setChapterStatus('');
    await loadChapters(selectedBookId);
    setChapterRefreshing(false);
  };

  const handleAddBook = async (event) => {
    event.preventDefault();
    setBookStatus('');
    setBookSubmitting(true);

    const payload = {
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
      cover_image_url: bookCoverImage.trim() || null,
    };

    const { data, error } = await supabase
      .from('books')
      .insert(payload)
      .select('id, title, author, cover_image_url')
      .single();

    if (error) {
      setBookStatus(`Failed to add book: ${error.message}`);
      setBookSubmitting(false);
      return;
    }

    setBookStatus(`Added book: ${data.title}`);
    setBookTitle('');
    setBookAuthor('');
    setBookCoverImage('');
    setBooks((currentBooks) => sortBooks([...currentBooks, data]));
    setSelectedBookId((currentId) => currentId || data.id);
    setBookSubmitting(false);
  };

  const startBookEdit = (book) => {
    setEditingBook({
      id: book.id,
      title: book.title,
      author: book.author,
      cover_image_url: book.cover_image_url ?? '',
    });
  };

  const handleSaveBookEdit = async () => {
    if (!editingBook) return;

    setBookEditSubmitting(true);
    setBookStatus('');

    const payload = {
      title: editingBook.title.trim(),
      author: editingBook.author.trim(),
      cover_image_url: editingBook.cover_image_url.trim() || null,
    };

    const { data, error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', editingBook.id)
      .select('id, title, author, cover_image_url')
      .single();

    if (error) {
      setBookStatus(`Failed to update book: ${error.message}`);
      setBookEditSubmitting(false);
      return;
    }

    setBooks((currentBooks) => sortBooks(currentBooks.map((book) => (book.id === data.id ? data : book))));
    setEditingBook(null);
    setBookStatus(`Updated book: ${data.title}`);
    setBookEditSubmitting(false);
  };

  const handleDeleteBook = async (book) => {
    const shouldDelete = window.confirm(`Delete book "${book.title}" and all its chapters?`);
    if (!shouldDelete) return;

    setBookStatus('');

    const { error } = await supabase.from('books').delete().eq('id', book.id);

    if (error) {
      setBookStatus(`Failed to delete book: ${error.message}`);
      return;
    }

    const remainingBooks = books.filter((item) => item.id !== book.id);
    setBooks(remainingBooks);
    setSelectedBookId((currentId) => {
      if (currentId !== book.id) return currentId;
      return remainingBooks[0]?.id ?? '';
    });
    setBookStatus(`Deleted book: ${book.title}`);
  };

  const handleAddChapter = async (event) => {
    event.preventDefault();
    setChapterStatus('');
    setChapterSubmitting(true);

    const payload = {
      book_id: selectedBookId,
      title: chapterTitle.trim(),
      body: chapterBody.trim(),
    };

    const { data, error } = await supabase
      .from('chapters')
      .insert(payload)
      .select('id, title, body, created_at')
      .single();

    if (error) {
      setChapterStatus(`Failed to add chapter: ${error.message}`);
      setChapterSubmitting(false);
      return;
    }

    setChapterStatus('Chapter added successfully.');
    setChapterTitle('');
    setChapterBody('');
    setChapters((currentChapters) => [...currentChapters, data]);
    setChapterSubmitting(false);
  };

  const startChapterEdit = (chapter) => {
    setEditingChapter({
      id: chapter.id,
      title: chapter.title,
      body: chapter.body,
    });
  };

  const handleSaveChapterEdit = async () => {
    if (!editingChapter) return;

    setChapterEditSubmitting(true);
    setChapterStatus('');

    const payload = {
      title: editingChapter.title.trim(),
      body: editingChapter.body.trim(),
    };

    const { data, error } = await supabase
      .from('chapters')
      .update(payload)
      .eq('id', editingChapter.id)
      .select('id, title, body, created_at')
      .single();

    if (error) {
      setChapterStatus(`Failed to update chapter: ${error.message}`);
      setChapterEditSubmitting(false);
      return;
    }

    setChapters((currentChapters) =>
      currentChapters.map((chapter) => (chapter.id === data.id ? data : chapter))
    );
    setEditingChapter(null);
    setChapterStatus('Chapter updated successfully.');
    setChapterEditSubmitting(false);
  };

  const handleDeleteChapter = async (chapter) => {
    const shouldDelete = window.confirm(`Delete chapter "${chapter.title}"?`);
    if (!shouldDelete) return;

    setChapterStatus('');

    const { error } = await supabase.from('chapters').delete().eq('id', chapter.id);

    if (error) {
      setChapterStatus(`Failed to delete chapter: ${error.message}`);
      return;
    }

    setChapters((currentChapters) => currentChapters.filter((item) => item.id !== chapter.id));
    setChapterStatus(`Deleted chapter: ${chapter.title}`);
  };

  return (
    <div className="page-container admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="admin-intro">Create, edit, and delete books and chapters directly in Supabase.</p>

      <div className="admin-grid">
        <section className="admin-card" aria-labelledby="admin-books-title">
          <h2 id="admin-books-title">Books</h2>
          <form className="admin-form" onSubmit={handleAddBook}>
            <label htmlFor="book-title">Title</label>
            <input
              id="book-title"
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
              required
              disabled={bookSubmitting}
            />

            <label htmlFor="book-author">Author</label>
            <input
              id="book-author"
              value={bookAuthor}
              onChange={(event) => setBookAuthor(event.target.value)}
              required
              disabled={bookSubmitting}
            />

            <label htmlFor="book-cover-image">Cover PNG URL</label>
            <input
              id="book-cover-image"
              type="url"
              placeholder="https://.../cover.png"
              value={bookCoverImage}
              onChange={(event) => setBookCoverImage(event.target.value)}
              disabled={bookSubmitting}
            />

            <button type="submit" disabled={bookSubmitting}>
              {bookSubmitting ? 'Adding…' : 'Add Book'}
            </button>
          </form>

          <div className="admin-list">
            {books.map((book) => {
              const isEditing = editingBook?.id === book.id;
              return (
                <div key={book.id} className={`admin-list-item ${selectedBookId === book.id ? 'is-active' : ''}`}>
                  {isEditing ? (
                    <div className="admin-inline-form">
                      <input
                        value={editingBook.title}
                        onChange={(event) =>
                          setEditingBook((current) => ({ ...current, title: event.target.value }))
                        }
                        disabled={bookEditSubmitting}
                      />
                      <input
                        value={editingBook.author}
                        onChange={(event) =>
                          setEditingBook((current) => ({ ...current, author: event.target.value }))
                        }
                        disabled={bookEditSubmitting}
                      />
                      <input
                        type="url"
                        placeholder="https://.../cover.png"
                        value={editingBook.cover_image_url}
                        onChange={(event) =>
                          setEditingBook((current) => ({ ...current, cover_image_url: event.target.value }))
                        }
                        disabled={bookEditSubmitting}
                      />
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={handleSaveBookEdit}
                          disabled={bookEditSubmitting}
                        >
                          {bookEditSubmitting ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn is-muted"
                          onClick={() => setEditingBook(null)}
                          disabled={bookEditSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-list-copy">
                        <strong>{book.title}</strong>
                        <span>{book.author}</span>
                        {book.cover_image_url && <span>Cover: {book.cover_image_url}</span>}
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-action-btn is-muted"
                          onClick={() => setSelectedBookId(book.id)}
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn is-muted"
                          onClick={() => startBookEdit(book)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn is-danger"
                          onClick={() => handleDeleteBook(book)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {!booksLoading && books.length === 0 && (
              <p className="admin-status">No books created yet.</p>
            )}
          </div>

          {bookStatus && <p className="admin-status">{bookStatus}</p>}
        </section>

        <section className="admin-card" aria-labelledby="admin-chapters-title">
          <div className="admin-section-head">
            <h2 id="admin-chapters-title">Chapters</h2>
            <button
              type="button"
              className="admin-action-btn is-muted"
              onClick={handleRefreshChapters}
              disabled={!selectedBookId || chaptersLoading || chapterRefreshing}
            >
              {chapterRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <form className="admin-form" onSubmit={handleAddChapter}>
            <label htmlFor="chapter-book">Book</label>
            <select
              id="chapter-book"
              value={selectedBookId}
              onChange={(event) => setSelectedBookId(event.target.value)}
              required
              disabled={booksLoading || books.length === 0 || chapterSubmitting}
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} — {book.author}
                </option>
              ))}
            </select>

            <label htmlFor="chapter-title">Chapter Title</label>
            <input
              id="chapter-title"
              value={chapterTitle}
              onChange={(event) => setChapterTitle(event.target.value)}
              required
              disabled={chapterSubmitting || books.length === 0}
            />

            <label htmlFor="chapter-body">Chapter Body (Markdown supported)</label>
            <textarea
              id="chapter-body"
              value={chapterBody}
              onChange={(event) => setChapterBody(event.target.value)}
              required
              rows={8}
              disabled={chapterSubmitting || books.length === 0}
            />

            <button type="submit" disabled={chapterSubmitting || books.length === 0}>
              {chapterSubmitting ? 'Adding…' : 'Add Chapter'}
            </button>
          </form>

          {selectedBookId && (
            <p className="admin-status admin-query-meta">
              Viewing chapters for: <strong>{selectedBook?.title ?? 'Selected book'}</strong> ({selectedBookId})
            </p>
          )}

          <p className="admin-status admin-manage-note">
            Manage existing chapters below. Use <strong>Edit</strong> to update title/body and <strong>Delete</strong>
            to remove a chapter.
          </p>

          <div className="admin-list">
            {chaptersLoading && selectedBookId && (
              <p className="admin-status">Loading chapters for selected book...</p>
            )}

            {!selectedBookId && books.length > 0 && !booksLoading && (
              <p className="admin-status">Select a book to view and edit its chapters.</p>
            )}

            {chapters.map((chapter) => {
              const isEditing = editingChapter?.id === chapter.id;
              return (
                <div key={chapter.id} className="admin-list-item">
                  {isEditing ? (
                    <div className="admin-inline-form">
                      <input
                        value={editingChapter.title}
                        onChange={(event) =>
                          setEditingChapter((current) => ({ ...current, title: event.target.value }))
                        }
                        disabled={chapterEditSubmitting}
                      />
                      <textarea
                        value={editingChapter.body}
                        rows={6}
                        onChange={(event) =>
                          setEditingChapter((current) => ({ ...current, body: event.target.value }))
                        }
                        disabled={chapterEditSubmitting}
                      />
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={handleSaveChapterEdit}
                          disabled={chapterEditSubmitting}
                        >
                          {chapterEditSubmitting ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn is-muted"
                          onClick={() => setEditingChapter(null)}
                          disabled={chapterEditSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-list-copy">
                        <strong>{chapter.title}</strong>
                        <span>{chapter.body.slice(0, 120)}{chapter.body.length > 120 ? '…' : ''}</span>
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-action-btn is-muted"
                          onClick={() => startChapterEdit(chapter)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn is-danger"
                          onClick={() => handleDeleteChapter(chapter)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {!chaptersLoading && selectedBookId && chapters.length === 0 && (
              <p className="admin-status">
                No chapters were returned for this selected book. If chapters exist in Supabase, confirm they use
                this exact book ID and that your `chapters` select policy allows your signed-in user.
              </p>
            )}
          </div>

          {books.length === 0 && !booksLoading && (
            <p className="admin-status">Add a book first before creating chapters.</p>
          )}
          {chapterStatus && <p className="admin-status">{chapterStatus}</p>}
          {chapterDiagnostics && <p className="admin-status">{chapterDiagnostics}</p>}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
