import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CreateUserForm from "@/components/CreateUserForm";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

describe("CreateUserForm", () => {
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

  it("creates a user and shows the one-time setup link", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: {
            username: "second-admin",
          },
          setupToken: {
            setupUrl: "http://localhost:3000/setup/token-123",
            reason: "INITIAL_ENROLLMENT",
            expiresAt: "2026-04-05T00:00:00.000Z",
          },
        }),
        {
          status: 201,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "second-admin" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Create user" }).closest("form")!);

    expect(await screen.findByText("Setup link ready for second-admin")).toBeInTheDocument();
    expect(screen.getByText("http://localhost:3000/setup/token-123")).toBeInTheDocument();
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("copies the setup link", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: {
            username: "second-admin",
          },
          setupToken: {
            setupUrl: "http://localhost:3000/setup/token-123",
            reason: "INITIAL_ENROLLMENT",
            expiresAt: "2026-04-05T00:00:00.000Z",
          },
        }),
        {
          status: 201,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "second-admin" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Create user" }).closest("form")!);

    await screen.findByText("Setup link ready for second-admin");
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => {
      expect(mocks.writeText).toHaveBeenCalledWith("http://localhost:3000/setup/token-123");
    });
    expect(await screen.findByText("Link copied.")).toBeInTheDocument();
  });
});
