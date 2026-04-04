import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getTestDatabaseUrl } from "../setup/test-db";

describe("integration database setup", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: getTestDatabaseUrl(),
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to the isolated postgres test database", async () => {
    const count = await prisma.video.count();

    expect(count).toBe(0);
  });
});
