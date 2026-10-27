"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/types/book";
import { getBook } from "@/lib/api";
import { saveToList } from "@/lib/library";
import { useAppSelector } from "@/redux/store";
import LoginPrompt from "@/components/LoginPrompt";
import AudioPlayer from "@/components/AudioPlayer";
import Skeleton from "@/components/Skeleton";

function SummarySkeleton() {
  return (
    <div className="audio__book--summary">
      <Skeleton height={36} width="70%" style={{ marginBottom: 32 }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} height={16} width={i % 4 === 3 ? "60%" : "100%"} style={{ marginBottom: 12 }} />
      ))}
    </div>
  );
}

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, authReady, plan, subscriptionReady } = useAppSelector((s) => s.user);
  const fontSize = useAppSelector((s) => s.ui.fontSize);

  const [book, setBook] = useState<Book | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

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

  // Premium books need an active subscription even when the URL is opened directly
  const locked = !!book?.subscriptionRequired && (!user || plan === "basic");
  const gateResolved = authReady && (!user || subscriptionReady);
  useEffect(() => {
    if (status === "ready" && gateResolved && locked && user) router.replace("/choose-plan");
  }, [status, gateResolved, locked, user, router]);

  const markFinished = () => {
    if (user && book) saveToList(user.uid, "finished", book).catch(console.error);
  };

  if (status === "error") {
    return (
      <div className="row">
        <div className="container">
          <div className="error__message">We couldn&apos;t find that book.</div>
        </div>
      </div>
    );
  }

  if (status === "loading" || !book || !gateResolved || (locked && user)) {
    return (
      <div className="summary">
        <SummarySkeleton />
      </div>
    );
  }

  if (locked && !user) {
    return (
      <div className="row">
        <div className="container">
          <LoginPrompt text="Log in to your account to read and listen to the book" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="summary">
        <div className="audio__book--summary" style={{ fontSize }}>
          <div className="audio__book--summary-title">
            <b>{book.title}</b>
          </div>
          <div className="audio__book--summary-text">{book.summary}</div>
        </div>
      </div>
      <AudioPlayer book={book} onEnded={markFinished} />
    </>
  );
}
