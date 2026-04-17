import Link from "next/link";

export default function HomeEmptyState({
  canSubmit,
  titleQuery,
  clearSearchHref,
}: {
  canSubmit: boolean;
  titleQuery?: string;
  clearSearchHref?: string;
}) {
  if (titleQuery) {
    return (
      <div className="text-center py-24 text-neutral-600">
        <p className="text-xl font-semibold text-neutral-400 mb-2">
          {`No movie titles match "${titleQuery}"`}
        </p>
        <p className="mb-6">Try a different search or clear the filter.</p>
        <Link
          href={clearSearchHref ?? "/"}
          className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Clear search
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-24 text-neutral-600">
      <p className="text-xl font-semibold text-neutral-400 mb-2">
        No scenes yet
      </p>
      <p className="mb-6">Submit the best part of a movie.</p>
      {canSubmit ? (
        <Link
          href="/submit"
          className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Submit the first scene
        </Link>
      ) : (
        <p className="text-sm text-neutral-500">
          Log in to submit the first scene.
        </p>
      )}
    </div>
  );
}
