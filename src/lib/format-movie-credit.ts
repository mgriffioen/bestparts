export function formatMovieCredit(movieTitle: string, director?: string | null): string {
  if (!director) return movieTitle;
  if (/\(\d{4}\)$/.test(movieTitle)) {
    return movieTitle.replace(/\)$/, ` dir. ${director})`);
  }
  return `${movieTitle} (dir. ${director})`;
}
