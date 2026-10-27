"use client";

import { formatLongTime, formatTime, useAudioDuration } from "@/hooks/useAudioDuration";

/** Shows a book's audio length, read from its audioLink metadata. */
export default function Duration({
  src,
  long = false,
}: {
  src: string | undefined;
  long?: boolean;
}) {
  const duration = useAudioDuration(src);
  if (duration === null) return <span className="skeleton skeleton--inline" style={{ width: 40 }} />;
  return <>{long ? formatLongTime(duration) : formatTime(duration)}</>;
}
