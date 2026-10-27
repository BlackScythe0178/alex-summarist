"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { AiOutlineStar, AiOutlineClockCircle, AiOutlineRead } from "react-icons/ai";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { HiOutlineLightBulb, HiOutlineMicrophone } from "react-icons/hi";
import type { Book } from "@/types/book";
import { getBook } from "@/lib/api";
import { listenToInList, removeFromList, saveToList } from "@/lib/library";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openAuthModal } from "@/redux/modalSlice";
import { useBookAccess } from "@/hooks/useBookAccess";
import Duration from "@/components/Duration";
import Skeleton from "@/components/Skeleton";

function BookSkeleton() {
  return (
    <div className="inner__wrapper">
      <div className="inner__book">
        <Skeleton height={40} width="70%" style={{ marginBottom: 16 }} />
        <Skeleton height={20} width="30%" style={{ marginBottom: 16 }} />
        <Skeleton height={24} width="85%" style={{ marginBottom: 24 }} />
        <Skeleton height={90} style={{ marginBottom: 24 }} />
        <div className="inner-book__read--btn-wrapper">
          <Skeleton width={144} height={48} />
          <Skeleton width={144} height={48} />
        </div>
        <Skeleton height={24} width={240} style={{ marginBottom: 40 }} />
        <Skeleton height={18} width={160} style={{ marginBottom: 16 }} />
        <Skeleton height={160} />
      </div>
      <div className="inner-book--img-wrapper">
        <Skeleton className="book__image--wrapper" width={300} height={300} />
      </div>
    </div>
  );
}

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.user);
  const openBook = useBookAccess();

  const [book, setBook] = useState<Book | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getBook(id, controller.signal)
      .then((b) => {
        setBook(b);
        setStatus(b ? "ready" : "error");
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    return listenToInList(user.uid, "library", id, setSaved);
  }, [user, id]);

  const toggleLibrary = async () => {
    if (!user) {
      dispatch(openAuthModal("login"));
      return;
    }
    if (!book || saving) return;
    setSaving(true);
    try {
      if (saved) await removeFromList(user.uid, "library", book.id);
      else await saveToList(user.uid, "library", book);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="row">
      <div className="container">
        {status === "loading" ? (
          <BookSkeleton />
        ) : status === "error" || !book ? (
          <div className="error__message">We couldn&apos;t find that book.</div>
        ) : (
          <div className="inner__wrapper">
            <div className="inner__book">
              <div className="inner-book__title">
                {book.title}
              </div>
              <div className="inner-book__author">{book.author}</div>
              <div className="inner-book__sub--title">{book.subTitle}</div>
              <div className="inner-book__wrapper">
                <div className="inner-book__description--wrapper">
                  <div className="inner-book__description">
                    <div className="inner-book__icon">
                      <AiOutlineStar />
                    </div>
                    <div className="inner-book__overall--rating">{book.averageRating}</div>
                    <div className="inner-book__total--rating">({book.totalRating} ratings)</div>
                  </div>
                  <div className="inner-book__description">
                    <div className="inner-book__icon">
                      <AiOutlineClockCircle />
                    </div>
                    <div className="inner-book__duration">
                      <Duration src={book.audioLink} />
                    </div>
                  </div>
                  <div className="inner-book__description">
                    <div className="inner-book__icon">
                      <HiOutlineMicrophone />
                    </div>
                    <div className="inner-book__type">{book.type}</div>
                  </div>
                  <div className="inner-book__description">
                    <div className="inner-book__icon">
                      <HiOutlineLightBulb />
                    </div>
                    <div className="inner-book__key--ideas">{book.keyIdeas} Key ideas</div>
                  </div>
                </div>
              </div>

              <div className="inner-book__read--btn-wrapper">
                <button className="inner-book__read--btn" onClick={() => openBook(book)}>
                  <div className="inner-book__read--icon">
                    <AiOutlineRead />
                  </div>
                  <div className="inner-book__read--text">Read</div>
                </button>
                <button className="inner-book__read--btn" onClick={() => openBook(book)}>
                  <div className="inner-book__read--icon">
                    <HiOutlineMicrophone />
                  </div>
                  <div className="inner-book__read--text">Listen</div>
                </button>
              </div>

              <button className="inner-book__bookmark" onClick={toggleLibrary} disabled={saving}>
                <div className="inner-book__bookmark--icon">
                  {saved ? <BsBookmarkFill /> : <BsBookmark />}
                </div>
                <div className="inner-book__bookmark--text">
                  {saved ? "Saved in My Library" : "Add title to My Library"}
                </div>
              </button>

              <div className="inner-book__secondary--title">What&apos;s it about?</div>
              <div className="inner-book__tags--wrapper">
                {book.tags?.map((tag) => (
                  <div className="inner-book__tag" key={tag}>
                    {tag}
                  </div>
                ))}
              </div>
              <div className="inner-book__book--description">{book.bookDescription}</div>
              <h2 className="inner-book__secondary--title">About the author</h2>
              <div className="inner-book__author--description">{book.authorDescription}</div>
            </div>
            <div className="inner-book--img-wrapper">
              <figure className="book__image--wrapper">
                <Image src={book.imageLink} alt={book.title} width={300} height={300} priority />
              </figure>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
