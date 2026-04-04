import { createHash, randomBytes, randomUUID } from "node:crypto";

export type TestUserRole = "ADMIN";
export type TestUserStatus = "PENDING_SETUP" | "ACTIVE";
export type TestSetupTokenReason =
  | "INITIAL_ENROLLMENT"
  | "ADD_PASSKEY"
  | "RECOVERY";

export interface SeededAdminUserFixture {
  username: string;
  displayName: string;
  role: TestUserRole;
  status: Extract<TestUserStatus, "ACTIVE">;
}

export interface SessionCookieFixtureOptions {
  cookieName?: string;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
}

export interface SetupTokenFixture {
  rawToken: string;
  hashedToken: string;
  setupPath: string;
  reason: TestSetupTokenReason;
  expiresAt: Date;
}

export const DEFAULT_TEST_SESSION_COOKIE_NAME = "bestparts_session";

export function buildSeededAdminUserFixture(
  overrides: Partial<SeededAdminUserFixture> = {}
): SeededAdminUserFixture {
  const suffix = randomBytes(4).toString("hex");

  return {
    username: `admin-${suffix}`,
    displayName: "Test Admin",
    role: "ADMIN",
    status: "ACTIVE",
    ...overrides,
  };
}

export function buildSessionCookie(
  sessionId = randomUUID(),
  options: SessionCookieFixtureOptions = {}
): string {
  const {
    cookieName = DEFAULT_TEST_SESSION_COOKIE_NAME,
    path = "/",
    sameSite = "Lax",
    secure = false,
    httpOnly = true,
    maxAge,
  } = options;

  const segments = [`${cookieName}=${sessionId}`, `Path=${path}`, `SameSite=${sameSite}`];

  if (httpOnly) {
    segments.push("HttpOnly");
  }

  if (secure) {
    segments.push("Secure");
  }

  if (typeof maxAge === "number") {
    segments.push(`Max-Age=${maxAge}`);
  }

  return segments.join("; ");
}

export function hashSetupToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function buildSetupTokenFixture(
  reason: TestSetupTokenReason = "INITIAL_ENROLLMENT",
  ttlMinutes = 15
): SetupTokenFixture {
  const rawToken = randomBytes(24).toString("base64url");

  return {
    rawToken,
    hashedToken: hashSetupToken(rawToken),
    setupPath: `/setup/${rawToken}`,
    reason,
    expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
  };
}
