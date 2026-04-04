import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth/current-user";
import HeaderPrimaryActions from "@/components/HeaderPrimaryActions";

vi.mock("@/components/HeaderAuthActions", () => ({
  default: ({ currentUser }: { currentUser: CurrentUser | null }) => (
    <div>{currentUser ? "auth" : "guest"}</div>
  ),
}));

function createCurrentUser(): CurrentUser {
  return {
    id: "user_123",
    username: "mark",
    role: "ADMIN",
    status: "ACTIVE",
    sessionId: "session_123",
    sessionExpiresAt: new Date("2026-04-04T20:00:00.000Z"),
    sessionLastUsedAt: new Date("2026-04-04T19:30:00.000Z"),
  };
}

describe("HeaderPrimaryActions", () => {
  it("hides the submit action for guests", () => {
    render(<HeaderPrimaryActions currentUser={null} />);

    expect(
      screen.queryByRole("link", { name: "+ Submit a scene" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("guest")).toBeInTheDocument();
  });

  it("shows the submit action for authenticated users", () => {
    render(<HeaderPrimaryActions currentUser={createCurrentUser()} />);

    expect(
      screen.getByRole("link", { name: "+ Submit a scene" })
    ).toHaveAttribute("href", "/submit");
    expect(screen.getByText("auth")).toBeInTheDocument();
  });
});
