import {
  PrismaClient,
  SetupTokenReason,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { SESSION_COOKIE_NAME } from "../../src/lib/auth/cookies";
import { createSession } from "../../src/lib/auth/session";
import { createSetupToken } from "../../src/lib/auth/setup-token";
import { getPlaywrightTestDatabaseUrl } from "./playwright-env";

export function createE2EPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: getPlaywrightTestDatabaseUrl(),
      },
    },
  });
}

export async function resetE2EDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.authThrottleBucket.deleteMany();
  await prisma.consumedCeremonyNonce.deleteMany();
  await prisma.videoUpvote.deleteMany();
  await prisma.video.deleteMany();
  await prisma.userSetupToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passkey.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedGuestVideo(prisma: PrismaClient): Promise<void> {
  await prisma.video.create({
    data: {
      youtubeId: "abc123def45",
      movieTitle: "Heat",
      sceneTitle: "Downtown shootout",
      description: "Chaos on the street.",
    },
  });
}

export async function seedGuestSortScenario(prisma: PrismaClient): Promise<void> {
  const now = Date.now();

  await prisma.video.createMany({
    data: [
      {
        youtubeId: "oldscene001",
        movieTitle: "Heat",
        sceneTitle: "Already top voted",
        description: "The current leader.",
        submittedAt: new Date(now - 120_000),
        upvoteCount: 2,
      },
      {
        youtubeId: "newscene002",
        movieTitle: "Arrival",
        sceneTitle: "Almost top voted",
        description: "One vote behind.",
        submittedAt: new Date(now - 60_000),
        upvoteCount: 1,
      },
    ],
  });
}

export async function seedGuestMovieTitleSearchScenario(
  prisma: PrismaClient
): Promise<void> {
  const now = Date.now();

  await prisma.video.createMany({
    data: [
      {
        youtubeId: "alienclip01",
        movieTitle: "Alien",
        sceneTitle: "Air shaft hunt",
        description: "Tension in the vents.",
        submittedAt: new Date(now - 180_000),
        upvoteCount: 3,
      },
      {
        youtubeId: "aliensclip2",
        movieTitle: "Aliens",
        sceneTitle: "Power loader showdown",
        description: "Ripley steps in.",
        submittedAt: new Date(now - 60_000),
        upvoteCount: 7,
      },
      {
        youtubeId: "heatclip003",
        movieTitle: "Heat",
        sceneTitle: "Coffee shop faceoff",
        description: "De Niro and Pacino talk.",
        submittedAt: new Date(now - 30_000),
        upvoteCount: 5,
      },
    ],
  });
}

export async function seedAdminSession(
  prisma: PrismaClient,
  username = "browser-admin"
): Promise<{ sessionToken: string; username: string }> {
  const admin = await prisma.user.create({
    data: {
      username,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  const createdSession = await createSession(prisma, admin.id);

  return {
    sessionToken: createdSession.sessionToken,
    username: admin.username,
  };
}

export async function seedSetupUser(
  prisma: PrismaClient,
  options: {
    username?: string;
    reason?: SetupTokenReason;
  } = {}
): Promise<{ rawToken: string; setupPath: string; username: string }> {
  const user = await prisma.user.create({
    data: {
      username: options.username ?? "browser-passkey-user",
      role: UserRole.ADMIN,
      status: UserStatus.PENDING_SETUP,
    },
  });
  const setupToken = await createSetupToken(prisma, {
    userId: user.id,
    reason: options.reason,
  });

  return {
    rawToken: setupToken.rawToken,
    setupPath: setupToken.setupPath,
    username: user.username,
  };
}

export function buildSessionCookieForBaseUrl(baseURL: URL, sessionToken: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    domain: baseURL.hostname,
    path: "/",
    httpOnly: true,
    sameSite: "Lax" as const,
    secure: false,
  };
}
