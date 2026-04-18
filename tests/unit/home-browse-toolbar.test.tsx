import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/HomeSortControls", () => ({
  default: () => <div data-testid="toolbar-sort-controls">sort</div>,
}));

vi.mock("@/components/HomeMovieTitleSearch", () => ({
  default: () => <div data-testid="toolbar-search">search</div>,
}));

import HomeBrowseToolbar from "@/components/HomeBrowseToolbar";

describe("HomeBrowseToolbar", () => {
  it("renders the sort controls before the search slot", () => {
    render(<HomeBrowseToolbar sort="votes" titleQuery="alien" />);

    const toolbar = screen.getByTestId("home-browse-toolbar");

    expect(toolbar.firstElementChild).toBe(screen.getByTestId("home-browse-sort-slot"));
    expect(screen.getByTestId("home-browse-sort-slot")).toContainElement(
      screen.getByTestId("toolbar-sort-controls")
    );
    expect(screen.getByTestId("home-browse-search-slot")).toContainElement(
      screen.getByTestId("toolbar-search")
    );
  });

  it("keeps the shared spacing and shrinkable search width contract", () => {
    render(<HomeBrowseToolbar sort="date" />);

    expect(screen.getByTestId("home-browse-toolbar")).toHaveClass(
      "mb-6",
      "flex",
      "items-center"
    );
    expect(screen.getByTestId("home-browse-search-slot")).toHaveClass(
      "min-w-0",
      "flex-1"
    );
    expect(screen.getByTestId("home-browse-search-shell")).toHaveClass(
      "min-w-0",
      "w-full",
      "max-w-lg",
      "sm:ml-auto"
    );
  });
});
