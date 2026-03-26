import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractYouTubeId } from "@/lib/youtube";

export async function GET() {
  const videos = await db.video.findMany({
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { youtubeUrl, movieTitle, sceneTitle, description } = body;

  if (!youtubeUrl || !movieTitle || !sceneTitle) {
    return NextResponse.json(
      { error: "YouTube URL, movie title, and scene title are required." },
      { status: 400 }
    );
  }

  const youtubeId = extractYouTubeId(String(youtubeUrl));
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Could not extract a valid YouTube video ID from the URL. Please use a standard YouTube link." },
      { status: 400 }
    );
  }

  const video = await db.video.create({
    data: {
      youtubeId,
      movieTitle: String(movieTitle).trim(),
      sceneTitle: String(sceneTitle).trim(),
      description: description ? String(description).trim() : null,
    },
  });

  return NextResponse.json(video, { status: 201 });
}
