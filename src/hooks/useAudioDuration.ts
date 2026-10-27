"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, number>();
const pending = new Map<string, Promise<number>>();

/** Loads only the audio file's metadata to read its length (seconds). Results are cached. */
export function loadAudioDuration(src: string): Promise<number> {
  if (cache.has(src)) return Promise.resolve(cache.get(src)!);
  if (pending.has(src)) return pending.get(src)!;
  const p = new Promise<number>((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    const done = (d: number) => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.src = "";
      pending.delete(src);
      if (d > 0 && Number.isFinite(d)) cache.set(src, d);
      resolve(d);
    };
    audio.onloadedmetadata = () => done(audio.duration);
    audio.onerror = () => done(0);
    audio.src = src;
  });
  pending.set(src, p);
  return p;
}

export function useAudioDuration(src: string | undefined) {
  const [duration, setDuration] = useState<number | null>(
    src && cache.has(src) ? cache.get(src)! : null
  );
  useEffect(() => {
    if (!src) return;
    let alive = true;
    loadAudioDuration(src).then((d) => alive && setDuration(d));
    return () => {
      alive = false;
    };
  }, [src]);
  return duration;
}

/** 203 -> "03:23" */
export function formatTime(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds)) return "00:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** 203 -> "3 mins 23 secs" */
export function formatLongTime(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds)) return "";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)} mins ${s % 60} secs`;
}
