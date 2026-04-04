import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromCookieStore, type CurrentUser } from "./current-user";
import { assertActiveUser, AuthorizationError } from "./permissions";

export const PUBLIC_AUTH_API_PATHS = [
  "/api/auth/login/options",
  "/api/auth/login/verify",
  "/api/auth/logout",
  "/api/auth/session",
  "/api/auth/setup/options",
  "/api/auth/setup/verify",
] as const;

export function isPublicAuthApiPath(pathname: string): boolean {
  return PUBLIC_AUTH_API_PATHS.includes(
    pathname as (typeof PUBLIC_AUTH_API_PATHS)[number]
  );
}

export function jsonAuthenticationRequired(message = "Authentication required.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function jsonForbidden(message = "Forbidden.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireApiSession(
  request: Pick<NextRequest, "cookies">
): Promise<CurrentUser | NextResponse> {
  const currentUser = await getCurrentUserFromCookieStore(request.cookies, db);

  if (!currentUser) {
    return jsonAuthenticationRequired();
  }

  try {
    assertActiveUser(currentUser);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonForbidden(error.message);
    }

    throw error;
  }

  return currentUser;
}
