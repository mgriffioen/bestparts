import Link from "next/link";
import type { HomeSort } from "@/lib/videos/list-home-videos";

export default function HomeSortControls({
  sort,
  titleQuery,
}: {
  sort: HomeSort;
  titleQuery?: string;
}) {
  return (
    <nav
      aria-label="Sort videos"
      className="flex items-center gap-2 text-sm"
    >
      <SortLink
        href={buildSortHref("date", titleQuery)}
        label="Newest"
        active={sort === "date"}
      />
      <SortLink
        href={buildSortHref("votes", titleQuery)}
        label="Top voted"
        active={sort === "votes"}
      />
    </nav>
  );
}

function buildSortHref(sort: HomeSort, titleQuery: string | undefined): string {
  const params = new URLSearchParams();

  if (titleQuery) {
    params.set("title", titleQuery);
  }

  if (sort === "votes") {
    params.set("sort", "votes");
  }

  const query = params.toString();

  return query ? `/?${query}` : "/";
}

function SortLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-full border border-yellow-300 bg-yellow-400 px-3 py-1.5 font-semibold text-neutral-950"
          : "rounded-full border border-neutral-700 px-3 py-1.5 font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
      }
    >
      {label}
    </Link>
  );
}
