import type { CurrentUser } from "@/lib/auth/current-user";
import HeaderAuthActions from "./HeaderAuthActions";
import { canManageUsers } from "@/lib/auth/permissions";

export default function HeaderPrimaryActions({
  currentUser,
}: {
  currentUser: CurrentUser | null;
}) {
  return (
    <div className="flex items-center gap-3">
      {currentUser && (
        <>
          <a
            href="/submit"
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-yellow-300"
          >
            + Submit a scene
          </a>
          {canManageUsers(currentUser) && (
            <a
              href="/admin/users"
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
            >
              Manage users
            </a>
          )}
        </>
      )}
      <HeaderAuthActions currentUser={currentUser} />
    </div>
  );
}
