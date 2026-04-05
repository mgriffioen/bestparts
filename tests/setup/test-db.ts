import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

export const TEST_DATABASE_URL_ENV = "DATABASE_URL_TEST";
export const APP_DATABASE_URL_ENV = "DATABASE_URL";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envFilePath = path.join(repoRoot, ".env");

function loadLocalEnvFile(): void {
  if (!existsSync(envFilePath)) {
    return;
  }

  const contents = readFileSync(envFilePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const quoted =
      (rawValue.startsWith("\"") && rawValue.endsWith("\"")) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"));
    const value = quoted ? rawValue.slice(1, -1) : rawValue;

    process.env[key] = value;
  }
}

loadLocalEnvFile();

export function getTestDatabaseUrl(): string {
  const url = process.env[TEST_DATABASE_URL_ENV];

  if (!url) {
    throw new Error(
      `Missing ${TEST_DATABASE_URL_ENV}. Configure a dedicated PostgreSQL test database before running integration tests.`
    );
  }

  return url;
}

export function assertSafeTestDatabaseUrl(testDatabaseUrl: string): void {
  const appDatabaseUrl = process.env[APP_DATABASE_URL_ENV];

  if (appDatabaseUrl && appDatabaseUrl === testDatabaseUrl) {
    throw new Error(
      `${TEST_DATABASE_URL_ENV} must not match ${APP_DATABASE_URL_ENV}. Refusing to run against the application database.`
    );
  }
}

export function createTestDatabaseEnv(): NodeJS.ProcessEnv {
  const testDatabaseUrl = getTestDatabaseUrl();

  assertSafeTestDatabaseUrl(testDatabaseUrl);

  return {
    ...process.env,
    [APP_DATABASE_URL_ENV]: testDatabaseUrl,
  };
}

function runPrismaCommand(args: string[], env = createTestDatabaseEnv()): void {
  const prismaCli = require.resolve("prisma/build/index.js");
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: repoRoot,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Prisma command failed: prisma ${args.join(" ")}`);
  }
}

export async function bootstrapTestDatabase(): Promise<void> {
  runPrismaCommand(["db", "push", "--skip-generate"]);
}

export async function resetTestDatabase(): Promise<void> {
  runPrismaCommand(["db", "push", "--force-reset", "--skip-generate"]);
}

export default async function setupIntegrationDatabase(): Promise<() => Promise<void>> {
  await resetTestDatabase();

  return async () => {};
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "check";

  if (command === "check") {
    assertSafeTestDatabaseUrl(getTestDatabaseUrl());
    return;
  }

  if (command === "bootstrap") {
    await bootstrapTestDatabase();
    return;
  }

  if (command === "reset") {
    await resetTestDatabase();
    return;
  }

  throw new Error(`Unknown test database command: ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown test database error";
    console.error(message);
    process.exit(1);
  });
}
