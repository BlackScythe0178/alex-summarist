"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { BiMenu } from "react-icons/bi";
import { BsClock } from "react-icons/bs";
import { useAppDispatch } from "@/redux/store";
import { toggleSidebar } from "@/redux/uiSlice";
import { searchBooks } from "@/lib/api";
import type { Book } from "@/types/book";
import Duration from "@/components/Duration";
import Skeleton from "@/components/Skeleton";

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 300ms debounce, cancelling stale requests
  useEffect(() => {
    const q = term.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setResults(await searchBooks(q, controller.signal));
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [term]);

  // Clear on navigation
  useEffect(() => {
    setTerm("");
    setOpen(false);
  }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const showDropdown = open && term.trim().length > 0;

  return (
    <div className="search__background">
      <div className="search__wrapper">
        <div className="search__content" ref={wrapperRef}>
          <div className="search">
            <div className="search__input--wrapper">
              <input
                className="search__input"
                placeholder="Search for books"
                type="text"
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
              />
              <div className="search__icon">
                {term ? (
                  <button aria-label="Clear search" onClick={() => setTerm("")}>
                    <AiOutlineClose />
                  </button>
                ) : (
                  <AiOutlineSearch />
                )}
              </div>
            </div>
          </div>
          <button
            className="sidebar__toggle--btn"
            aria-label="Open menu"
            onClick={() => dispatch(toggleSidebar())}
          >
            <BiMenu />
          </button>

          {showDropdown && (
            <div className="search__books--wrapper">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={120} style={{ marginBottom: 8 }} />
                ))
              ) : results.length === 0 ? (
                <div className="search__empty">No books found</div>
              ) : (
                results.map((book) => (
                  <Link
                    href={`/book/${book.id}`}
                    className="search__book--link"
                    key={book.id}
                    onClick={() => setOpen(false)}
                  >
                    <figure className="book__image--wrapper search__book--image">
                      <Image src={book.imageLink} alt={book.title} width={80} height={80} />
                    </figure>
                    <div>
                      <div className="search__book--title">{book.title}</div>
                      <div className="search__book--author">{book.author}</div>
                      <div className="search__book--duration">
                        <div className="recommended__book--details">
                          <BsClock />
                          <div className="recommended__book--details-text">
                            <Duration src={book.audioLink} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
