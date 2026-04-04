import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import IssueSetupTokenButton from "@/components/IssueSetupTokenButton";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

describe("IssueSetupTokenButton", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    mocks.writeText.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: mocks.writeText,
      },
    });
  });

  it("issues a recovery setup link and shows revocation counts", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          setupToken: {
            setupUrl: "http://localhost:3000/setup/recovery-token",
            reason: "RECOVERY",
            expiresAt: "2026-04-05T00:00:00.000Z",
          },
          recovery: {
            revokedPasskeyCount: 2,
            revokedSessionCount: 1,
            revokedSetupTokenCount: 3,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(
      <IssueSetupTokenButton
        userId="user_123"
        username="mark"
        reason="RECOVERY"
        label="Recovery"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Recovery" }));

    expect(await screen.findByText("mark")).toBeInTheDocument();
    expect(
      screen.getByText(/Revoked 2 passkey\(s\), 1 session\(s\), and 3 outstanding setup token\(s\)\./)
    ).toBeInTheDocument();
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("copies an issued setup link", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          setupToken: {
            setupUrl: "http://localhost:3000/setup/add-passkey-token",
            reason: "ADD_PASSKEY",
            expiresAt: "2026-04-05T00:00:00.000Z",
          },
          recovery: {
            revokedPasskeyCount: 0,
            revokedSessionCount: 0,
            revokedSetupTokenCount: 1,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(
      <IssueSetupTokenButton
        userId="user_123"
        username="mark"
        reason="ADD_PASSKEY"
        label="Add passkey"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add passkey" }));
    await screen.findByText("http://localhost:3000/setup/add-passkey-token");

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(mocks.writeText).toHaveBeenCalledWith(
        "http://localhost:3000/setup/add-passkey-token"
      );
    });
  });
});
