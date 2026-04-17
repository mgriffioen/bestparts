import Link from "next/link";
import type { HomeSort } from "@/lib/videos/list-home-videos";

export default function HomeMovieTitleSearch({
  sort,
  titleQuery,
}: {
  sort: HomeSort;
  titleQuery?: string;
}) {
  const clearSearchHref = buildClearSearchHref(sort);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form action="/" method="get" className="flex flex-1 gap-3">
        {sort === "votes" ? (
          <input type="hidden" name="sort" value="votes" />
        ) : null}
        <div className="flex-1">
          <label htmlFor="movie-title-search" className="sr-only">
            Search movie titles
          </label>
          <input
            id="movie-title-search"
            name="title"
            type="search"
            defaultValue={titleQuery ?? ""}
            placeholder="Search movie titles"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-400 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-neutral-950 transition-colors hover:bg-yellow-300"
        >
          Search
        </button>
      </form>

      {titleQuery ? (
        <Link
          href={clearSearchHref}
          className="text-sm text-neutral-400 transition-colors hover:text-white"
        >
          Clear search
        </Link>
      ) : null}
    </div>
  );
}

function buildClearSearchHref(sort: HomeSort): string {
  return sort === "votes" ? "/?sort=votes" : "/";
}
