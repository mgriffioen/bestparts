import { redirect } from "next/navigation";
import SubmitSceneForm from "@/components/SubmitSceneForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function SubmitPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/submit");
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Submit a scene</h1>
        <p className="text-neutral-400">
          Share a memorable movie moment from YouTube with the community.
        </p>
      </div>
      <SubmitSceneForm />
    </div>
  );
}
