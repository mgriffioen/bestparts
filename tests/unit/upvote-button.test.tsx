import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UpvoteButton from "@/components/UpvoteButton";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

describe("UpvoteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the vote label and count", () => {
    render(
      <UpvoteButton
        videoId={1}
        upvoteCount={12}
        nextEligibleUpvoteAt={null}
      />
    );

    expect(
      screen.getByRole("button", { name: "Upvote video (12 votes)" })
    ).toHaveTextContent("👍✌️");
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("disables the button when the server says the browser is cooling down", () => {
    render(
      <UpvoteButton
        videoId={1}
        upvoteCount={12}
        nextEligibleUpvoteAt={new Date(Date.now() + 60_000)}
      />
    );

    expect(
      screen.getByRole("button", { name: "Upvote video (12 votes)" })
    ).toBeDisabled();
  });

  it("updates the count and refreshes after a successful upvote", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            upvoteCount: 13,
            nextEligibleUpvoteAt: "2026-04-06T00:00:00.000Z",
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          }
        )
      )
    );

    render(
      <UpvoteButton
        videoId={1}
        upvoteCount={12}
        nextEligibleUpvoteAt={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Upvote video (12 votes)" }));

    await waitFor(() => {
      expect(mocks.refresh).toHaveBeenCalled();
    });
    expect(screen.getByText("13")).toBeInTheDocument();
  });
});
