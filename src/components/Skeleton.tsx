import type { CSSProperties } from "react";

export default function Skeleton({
  width = "100%",
  height = 16,
  radius,
  style,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}
