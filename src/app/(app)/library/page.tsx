"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { listenToList } from "@/lib/library";
import type { Book } from "@/types/book";
import BookCard, { BookCardSkeleton } from "@/components/BookCard";
import LoginPrompt from "@/components/LoginPrompt";
import Skeleton from "@/components/Skeleton";

function useList(uid: string | undefined, list: "library" | "finished") {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setBooks(null);
    setError(false);
    if (!uid) return;
    return listenToList(uid, list, setBooks, () => setError(true));
  }, [uid, list]);
  return { books, error };
}

function Section({
  title,
  books,
  error,
  emptyTitle,
  emptyText,
}: {
  title: string;
  books: Book[] | null;
  error: boolean;
  emptyTitle: string;
  emptyText: string;
}) {
  return (
    <div>
      <div className="for-you__title">{title}</div>
      <div className="for-you__sub--title">
        {books ? `${books.length} item${books.length === 1 ? "" : "s"}` : <Skeleton width={60} height={16} />}
      </div>
      {error ? (
        <div className="error__message" style={{ marginBottom: 32 }}>
          Couldn&apos;t load this list.
        </div>
      ) : !books ? (
        <div className="for-you__recommended--books library__books">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="library__empty">
          <div className="library__empty--title">{emptyTitle}</div>
          <div className="library__empty--text">{emptyText}</div>
        </div>
      ) : (
        <div className="for-you__recommended--books library__books">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  const { user, authReady } = useAppSelector((s) => s.user);
  const saved = useList(user?.uid, "library");
  const finished = useList(user?.uid, "finished");

  return (
    <div className="row">
      <div className="container">
        {!authReady ? (
          <div className="for-you__recommended--books library__books">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : !user ? (
          <LoginPrompt text="Log in to your account to see your library." />
        ) : (
          <>
            <Section
              title="Saved Books"
              books={saved.books}
              error={saved.error}
              emptyTitle="Save your favorite books!"
              emptyText="When you save a book, it will appear here."
            />
            <Section
              title="Finished"
              books={finished.books}
              error={finished.error}
              emptyTitle="Done and dusted!"
              emptyText="When you finish a book, you can find it here later."
            />
          </>
        )}
      </div>
    </div>
  );
}
