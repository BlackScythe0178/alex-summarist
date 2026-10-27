"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsFillPlayFill } from "react-icons/bs";
import type { Book } from "@/types/book";
import { getRecommendedBooks, getSelectedBook, getSuggestedBooks } from "@/lib/api";
import { BookRow } from "@/components/BookCard";
import Duration from "@/components/Duration";
import Skeleton from "@/components/Skeleton";

function useFetch<T>(fn: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fn(controller.signal)
      .then(setData)
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setError(true);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, error, loading: data === null && !error };
}

function SelectedBook({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} className="selected__book">
      <div className="selected__book--sub-title">{book.subTitle}</div>
      <div className="selected__book--line" />
      <div className="selected__book--content">
        <figure className="book__image--wrapper selected__book--image">
          <Image src={book.imageLink} alt={book.title} width={140} height={140} priority />
        </figure>
        <div className="selected__book--text">
          <div className="selected__book--title">{book.title}</div>
          <div className="selected__book--author">{book.author}</div>
          <div className="selected__book--duration-wrapper">
            <div className="selected__book--icon">
              <BsFillPlayFill />
            </div>
            <div className="selected__book--duration">
              <Duration src={book.audioLink} long />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SelectedBookSkeleton() {
  return <Skeleton className="selected__book" height={188} style={{ marginBottom: 24 }} />;
}

export default function ForYouPage() {
  const selected = useFetch(getSelectedBook);
  const recommended = useFetch(getRecommendedBooks);
  const suggested = useFetch(getSuggestedBooks);

  return (
    <div className="row">
      <div className="container">
        <div className="for-you__wrapper">
          <div className="for-you__title">Selected just for you</div>
          {selected.error ? (
            <div className="error__message">Couldn&apos;t load the selected book.</div>
          ) : selected.loading || !selected.data ? (
            <SelectedBookSkeleton />
          ) : (
            <SelectedBook book={selected.data} />
          )}

          <div>
            <div className="for-you__title">Recommended For You</div>
            <div className="for-you__sub--title">We think you&apos;ll like these</div>
            {recommended.error ? (
              <div className="error__message">Couldn&apos;t load recommended books.</div>
            ) : (
              <BookRow books={recommended.data} loading={recommended.loading} />
            )}
          </div>

          <div>
            <div className="for-you__title">Suggested Books</div>
            <div className="for-you__sub--title">Browse those books</div>
            {suggested.error ? (
              <div className="error__message">Couldn&apos;t load suggested books.</div>
            ) : (
              <BookRow books={suggested.data} loading={suggested.loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
