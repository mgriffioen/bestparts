import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getEmbedUrl } from "@/lib/youtube";
import UpvoteButton from "@/components/UpvoteButton";
import ShareButton from "@/components/ShareButton";
import { UPVOTE_COOLDOWN_MS } from "@/lib/votes/persist";
import {
  ANONYMOUS_VOTER_COOKIE_NAME,
  hashAnonymousVoterId,
  tryReadAnonymousVoterCookie,
} from "@/lib/votes/voter-cookie";

export const dynamic = "force-dynamic";

async function getVideo(id: number) {
  return db.video.findUnique({ where: { id } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const videoId = parseInt(id);
  if (isNaN(videoId)) return {};

  const video = await getVideo(videoId);
  if (!video) return {};

  return {
    title: `${video.sceneTitle} — ${video.movieTitle} | bestparts.biz`,
    description: video.description ?? `${video.movieTitle}: ${video.sceneTitle}`,
    openGraph: {
      title: `${video.sceneTitle} — ${video.movieTitle}`,
      description: video.description ?? `${video.movieTitle}: ${video.sceneTitle}`,
      images: [`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`],
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const videoId = parseInt(id);

  if (isNaN(videoId)) {
    notFound();
  }

  const video = await getVideo(videoId);

  if (!video) {
    notFound();
  }

  const cookieStore = await cookies();
  const nextEligibleUpvoteAt = await getNextEligibleUpvoteAt(cookieStore, videoId);

  const formattedDate = new Date(video.submittedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All scenes
      </Link>

      <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-1">
        {video.movieTitle}
      </p>
      <h1 className="text-2xl font-black text-white mb-5">{video.sceneTitle}</h1>

      <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden shadow-2xl mb-6">
        <iframe
          src={getEmbedUrl(video.youtubeId)}
          title={`${video.movieTitle} — ${video.sceneTitle}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {video.description && (
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
          {video.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UpvoteButton
            videoId={video.id}
            upvoteCount={video.upvoteCount}
            nextEligibleUpvoteAt={nextEligibleUpvoteAt}
          />
          <p className="text-neutral-600 text-xs">{formattedDate}</p>
        </div>
        <ShareButton videoId={video.id} />
      </div>
    </div>
  );
}

async function getNextEligibleUpvoteAt(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  videoId: number
): Promise<Date | null> {
  const anonymousVoterCookie = tryReadAnonymousVoterCookie(
    cookieStore.get(ANONYMOUS_VOTER_COOKIE_NAME)?.value
  );

  if (!anonymousVoterCookie) {
    return null;
  }

  const lastVote = await db.videoUpvote.findFirst({
    where: {
      videoId,
      voterKeyHash: hashAnonymousVoterId(anonymousVoterCookie.voterId),
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!lastVote) {
    return null;
  }

  const nextEligibleAt = new Date(lastVote.createdAt.getTime() + UPVOTE_COOLDOWN_MS);
  return nextEligibleAt.getTime() > Date.now() ? nextEligibleAt : null;
}
