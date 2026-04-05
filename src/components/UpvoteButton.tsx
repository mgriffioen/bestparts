"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UpvoteButtonProps {
  videoId: number;
  upvoteCount: number;
  nextEligibleUpvoteAt: Date | null;
}

interface UpvoteResponsePayload {
  error?: string;
  retryAfterMs?: number;
  nextEligibleUpvoteAt?: string;
  upvoteCount?: number;
}

export default function UpvoteButton({
  videoId,
  upvoteCount,
  nextEligibleUpvoteAt,
}: UpvoteButtonProps) {
  const router = useRouter();
  const [currentUpvoteCount, setCurrentUpvoteCount] = useState(upvoteCount);
  const [currentNextEligibleUpvoteAt, setCurrentNextEligibleUpvoteAt] =
    useState<Date | null>(nextEligibleUpvoteAt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coolingDown =
    currentNextEligibleUpvoteAt !== null &&
    currentNextEligibleUpvoteAt.getTime() > Date.now();

  async function handleUpvote() {
    if (submitting || coolingDown) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/videos/${videoId}/upvote`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | UpvoteResponsePayload
        | null;

      if (!response.ok) {
        if (payload?.nextEligibleUpvoteAt) {
          setCurrentNextEligibleUpvoteAt(
            new Date(payload.nextEligibleUpvoteAt)
          );
        }

        setError(payload?.error ?? "Failed to upvote. Please try again.");
        return;
      }

      if (typeof payload?.upvoteCount === "number") {
        setCurrentUpvoteCount(payload.upvoteCount);
      }

      if (payload?.nextEligibleUpvoteAt) {
        setCurrentNextEligibleUpvoteAt(new Date(payload.nextEligibleUpvoteAt));
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUpvote}
          disabled={submitting || coolingDown}
          aria-label={`Upvote video (${currentUpvoteCount} votes)`}
          className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-yellow-400 hover:text-yellow-300 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
        >
          👍✌️
        </button>
        <span className="text-sm font-semibold text-neutral-200">
          {currentUpvoteCount}
        </span>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
