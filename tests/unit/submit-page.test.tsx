import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import SubmitPage from "@/app/submit/page";

describe("SubmitPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects guests to login", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await SubmitPage();

    expect(mocks.redirect).toHaveBeenCalledWith("/login?next=/submit");
  });

  it("renders for authenticated users", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "user_123",
      username: "mark",
      role: "ADMIN",
      status: "ACTIVE",
      sessionId: "session_123",
      sessionExpiresAt: new Date(),
      sessionLastUsedAt: new Date(),
    });

    const page = await SubmitPage();

    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(page).toBeTruthy();
  });
});
