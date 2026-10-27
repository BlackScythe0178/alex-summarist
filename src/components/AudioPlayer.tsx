"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { RiReplay10Line, RiForward10Line } from "react-icons/ri";
import type { Book } from "@/types/book";
import { formatTime } from "@/hooks/useAudioDuration";

export default function AudioPlayer({ book, onEnded }: { book: Book; onEnded?: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  // Reset when the book changes
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [book.audioLink]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch (e) {
        console.error(e);
      }
    } else {
      audio.pause();
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = Number.isFinite(audio.duration) ? audio.duration : Infinity;
    audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), max);
    setCurrent(audio.currentTime);
  };

  const onSeek = (value: number) => {
    setCurrent(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className="audio__wrapper">
      <audio
        ref={audioRef}
        src={book.audioLink}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => !seeking && setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />
      <div className="audio__track--wrapper">
        <figure className="audio__track--image-mask">
          <figure className="book__image--wrapper">
            <Image src={book.imageLink} alt={book.title} width={48} height={48} />
          </figure>
        </figure>
        <div className="audio__track--details-wrapper">
          <div className="audio__track--title">{book.title}</div>
          <div className="audio__track--author">{book.author}</div>
        </div>
      </div>

      <div className="audio__controls--wrapper">
        <div className="audio__controls">
          <button className="audio__controls--btn" aria-label="Back 10 seconds" onClick={() => skip(-10)}>
            <RiReplay10Line />
          </button>
          <button
            className="audio__controls--btn audio__controls--btn-play"
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
          >
            {playing ? <BsFillPauseFill /> : <BsFillPlayFill style={{ marginLeft: 3 }} />}
          </button>
          <button className="audio__controls--btn" aria-label="Forward 10 seconds" onClick={() => skip(10)}>
            <RiForward10Line />
          </button>
        </div>
      </div>

      <div className="audio__progress--wrapper">
        <div className="audio__time">{formatTime(current)}</div>
        <input
          type="range"
          className="audio__progress--bar"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(current, duration || 0)}
          style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
          onChange={(e) => onSeek(Number(e.target.value))}
          onPointerDown={() => setSeeking(true)}
          onPointerUp={() => setSeeking(false)}
          aria-label="Seek"
        />
        <div className="audio__time">{formatTime(duration)}</div>
      </div>
    </div>
  );
}
