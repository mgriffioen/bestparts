import Link from "next/link";
import type { CurrentUser } from "@/lib/auth/current-user";
import HeaderAuthActions from "./HeaderAuthActions";
import { canManageUsers } from "@/lib/auth/permissions";

export default function HeaderPrimaryActions({
  currentUser,
}: {
  currentUser: CurrentUser | null;
}) {
  const canAccessUserManagement = currentUser
    ? canManageUsers(currentUser)
    : false;
  const secondaryActionClassName =
    "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-2xl border border-neutral-700 px-3 py-3 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white sm:min-h-0 sm:rounded-lg sm:py-2";

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      {currentUser ? (
        <>
          <Link
            href="/submit"
            className="inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-yellow-300 sm:min-h-0 sm:w-auto sm:rounded-lg sm:py-2"
          >
            + Submit a scene
          </Link>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:gap-3">
            {canAccessUserManagement && (
              <Link
                href="/admin/users"
                className={`${secondaryActionClassName} flex-1 sm:flex-none`}
              >
                Manage users
              </Link>
            )}
            <HeaderAuthActions
              currentUser={currentUser}
              buttonClassName={
                canAccessUserManagement
                  ? secondaryActionClassName
                  : `${secondaryActionClassName} w-full sm:w-auto`
              }
            />
          </div>
        </>
      ) : (
        <HeaderAuthActions
          currentUser={currentUser}
          buttonClassName={`${secondaryActionClassName} w-full sm:w-auto`}
        />
      )}
    </div>
  );
}
