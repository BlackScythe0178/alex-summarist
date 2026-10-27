import Image from "next/image";
import Link from "next/link";
import { BsClock, BsStar } from "react-icons/bs";
import type { Book } from "@/types/book";
import Duration from "./Duration";
import Skeleton from "./Skeleton";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} className="for-you__recommended--books-link">
      {book.subscriptionRequired && <div className="book__pill">Premium</div>}
      <figure className="book__image--wrapper recommended__book--img-wrapper">
        <Image src={book.imageLink} alt={book.title} width={172} height={172} />
      </figure>
      <div className="recommended__book--title">{book.title}</div>
      <div className="recommended__book--author">{book.author}</div>
      <div className="recommended__book--sub-title">{book.subTitle}</div>
      <div className="recommended__book--details-wrapper">
        <div className="recommended__book--details">
          <BsClock />
          <div className="recommended__book--details-text">
            <Duration src={book.audioLink} />
          </div>
        </div>
        <div className="recommended__book--details">
          <BsStar />
          <div className="recommended__book--details-text">{book.averageRating}</div>
        </div>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="for-you__recommended--books-link">
      <Skeleton className="recommended__book--img-wrapper" width={172} height={172} />
      <Skeleton height={20} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="40%" />
    </div>
  );
}

export function BookRow({ books, loading }: { books: Book[] | null; loading: boolean }) {
  return (
    <div className="for-you__recommended--books">
      {loading || !books
        ? Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)
        : books.map((b) => <BookCard key={b.id} book={b} />)}
    </div>
  );
}
