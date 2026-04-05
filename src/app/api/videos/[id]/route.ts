import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/route-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await requireApiSession(req);

  if (currentUser instanceof NextResponse) {
    return currentUser;
  }

  const { id } = await params;
  const videoId = parseInt(id);
  if (isNaN(videoId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const { movieTitle, sceneTitle, description } = body;

  if (!movieTitle || !sceneTitle) {
    return NextResponse.json(
      { error: "Movie title and scene title are required." },
      { status: 400 }
    );
  }

  const video = await db.video.update({
    where: { id: videoId },
    data: {
      movieTitle: String(movieTitle).trim(),
      sceneTitle: String(sceneTitle).trim(),
      description: description ? String(description).trim() : null,
    },
  });

  return NextResponse.json(video);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await requireApiSession(req);

  if (currentUser instanceof NextResponse) {
    return currentUser;
  }

  const { id } = await params;
  const videoId = parseInt(id);
  if (isNaN(videoId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await db.video.delete({ where: { id: videoId } });
  return new NextResponse(null, { status: 204 });
}
