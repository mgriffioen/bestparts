import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeEmptyState from "@/components/HomeEmptyState";

describe("HomeEmptyState", () => {
  it("does not show the submit link for guests", () => {
    render(<HomeEmptyState canSubmit={false} />);

    expect(
      screen.queryByRole("link", { name: "Submit the first scene" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Log in to submit the first scene.")
    ).toBeInTheDocument();
  });

  it("shows the submit link for authenticated users", () => {
    render(<HomeEmptyState canSubmit />);

    expect(
      screen.getByRole("link", { name: "Submit the first scene" })
    ).toHaveAttribute("href", "/submit");
  });
});
