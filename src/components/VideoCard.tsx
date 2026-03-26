"use client";

import Image from "next/image";
import { useState } from "react";
import { getEmbedUrl, getThumbnailUrl } from "@/lib/youtube";

interface VideoCardProps {
  id: number;
  youtubeId: string;
  movieTitle: string;
  sceneTitle: string;
  description: string | null;
  submittedAt: Date;
}

export default function VideoCard({
  youtubeId,
  movieTitle,
  sceneTitle,
  description,
  submittedAt,
}: VideoCardProps) {
  const [playing, setPlaying] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(submittedAt));

  return (
    <article className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-colors group">
      <div className="relative aspect-video bg-neutral-800">
        {playing ? (
          <iframe
            src={`${getEmbedUrl(youtubeId)}?autoplay=1`}
            title={`${movieTitle} — ${sceneTitle}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center group/btn"
            aria-label="Play video"
          >
            <Image
              src={getThumbnailUrl(youtubeId)}
              alt={`${movieTitle} — ${sceneTitle}`}
              fill
              className="object-cover"
            />
            <span className="relative z-10 bg-black/60 group-hover/btn:bg-yellow-400 transition-colors rounded-full w-14 h-14 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white group-hover/btn:text-neutral-950 ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-1">
          {movieTitle}
        </p>
        <h2 className="font-bold text-white text-lg leading-snug mb-2">
          {sceneTitle}
        </h2>
        {description && (
          <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        <p className="text-neutral-600 text-xs mt-3">{formattedDate}</p>
      </div>
    </article>
  );
}
