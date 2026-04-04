import { db } from "@/lib/db";
import HomeEmptyState from "@/components/HomeEmptyState";
import VideoCard from "@/components/VideoCard";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentUser = await getCurrentUser();
  const videos = await db.video.findMany({
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">
          The best parts of movies
        </h1>
      </div>

      {videos.length === 0 ? (
        <HomeEmptyState canSubmit={Boolean(currentUser)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              {...video}
              canManage={Boolean(currentUser)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
