"use client";

import Image from "next/image";
import { useState } from "react";
import { playerInitials } from "@/lib/player-initials";

const sizePx = {
  sm: 32,
  md: 48,
  lg: 96,
} as const;

type Size = keyof typeof sizePx;

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: Size;
  className?: string;
  priority?: boolean;
};

export function PlayerPhoto({
  name,
  photoUrl,
  size = "md",
  className = "",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const px = sizePx[size];
  const initials = playerInitials(name);
  const showImage = photoUrl && !failed;

  const shell = `relative shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 ${className}`;

  if (!showImage) {
    return (
      <span
        className={`${shell} inline-flex items-center justify-center font-semibold text-zinc-600 dark:text-zinc-300`}
        style={{ width: px, height: px, fontSize: px * 0.34 }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <span className={shell} style={{ width: px, height: px }}>
      <Image
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        className="h-full w-full object-cover object-top"
        sizes={`${px}px`}
        priority={priority}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
