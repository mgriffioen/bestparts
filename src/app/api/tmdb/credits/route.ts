import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/route-auth";

export async function GET(req: NextRequest) {
  const currentUser = await requireApiSession(req);
  if (currentUser instanceof NextResponse) return currentUser;

  const tmdbId = req.nextUrl.searchParams.get("id");
  if (!tmdbId || isNaN(parseInt(tmdbId))) {
    return NextResponse.json({ director: null });
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}/credits`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ director: null });
  }

  const data = await res.json();
  const directorEntry = (data.crew ?? []).find(
    (person: { job: string }) => person.job === "Director"
  );

  return NextResponse.json({ director: directorEntry?.name ?? null });
}
