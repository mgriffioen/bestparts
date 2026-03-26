"use client";

import { useEffect } from "react";
import { getEmbedUrl } from "@/lib/youtube";

interface VideoModalProps {
  youtubeId: string;
  movieTitle: string;
  sceneTitle: string;
  onClose: () => void;
}

export default function VideoModal({
  youtubeId,
  movieTitle,
  sceneTitle,
  onClose,
}: VideoModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
              {movieTitle}
            </p>
            <h2 className="text-white font-bold text-lg leading-snug">
              {sceneTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-neutral-400 hover:text-white transition-colors shrink-0"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden shadow-2xl">
          <iframe
            src={`${getEmbedUrl(youtubeId)}?autoplay=1`}
            title={`${movieTitle} — ${sceneTitle}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
