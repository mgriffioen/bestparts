/**
 * Backfills the director field for existing Video records that have none.
 * Uses TMDB search + credits API to look up each movie.
 *
 * Usage: node --import tsx scripts/backfill-directors.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_TOKEN = process.env.TMDB_TOKEN;
if (!TMDB_TOKEN) {
  console.error("TMDB_TOKEN environment variable is required");
  process.exit(1);
}

async function tmdbFetch(path: string) {
  const res = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`TMDB ${path} returned ${res.status}`);
  return res.json();
}

async function findDirector(movieTitle: string): Promise<string | null> {
  const match = movieTitle.match(/^(.+?)\s*\((\d{4})\)$/);
  const searchTitle = match ? match[1].trim() : movieTitle;
  const year = match ? match[2] : null;

  const searchData = await tmdbFetch(
    `/search/movie?query=${encodeURIComponent(searchTitle)}&language=en-US&page=1${year ? `&year=${year}` : ""}`
  );

  const results: Array<{ id: number; release_date?: string }> = searchData.results ?? [];
  if (results.length === 0) return null;

  let best = results[0];
  if (year) {
    const exact = results.find((r) => r.release_date?.startsWith(year));
    if (exact) best = exact;
  }

  const credits = await tmdbFetch(`/movie/${best.id}/credits`);
  const director = (credits.crew ?? []).find(
    (p: { job: string; name: string }) => p.job === "Director"
  );
  return director?.name ?? null;
}

async function main() {
  const videos = await prisma.video.findMany({ where: { director: null } });
  console.log(`Found ${videos.length} video(s) without a director`);

  let updated = 0;
  let skipped = 0;

  for (const video of videos) {
    try {
      const director = await findDirector(video.movieTitle);
      if (director) {
        await prisma.video.update({ where: { id: video.id }, data: { director } });
        console.log(`✓ "${video.movieTitle}" → ${director}`);
        updated++;
      } else {
        console.log(`✗ "${video.movieTitle}" → no director found`);
        skipped++;
      }
    } catch (err) {
      console.error(`  Error for "${video.movieTitle}":`, err);
      skipped++;
    }

    // Respect TMDB rate limit (40 req/10s)
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nDone. Updated: ${updated}, skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
