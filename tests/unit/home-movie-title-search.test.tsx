import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeMovieTitleSearch from "@/components/HomeMovieTitleSearch";

describe("HomeMovieTitleSearch", () => {
  it("reflects the current title query and preserves top-voted sorting on submit", () => {
    const { container } = render(
      <HomeMovieTitleSearch sort="votes" titleQuery="alien" />
    );

    expect(screen.getByRole("searchbox", { name: "Search movie titles" })).toHaveValue(
      "alien"
    );
    expect(container.querySelector('form[method="get"]')).toHaveAttribute(
      "action",
      "/"
    );
    expect(
      container.querySelector('input[type="hidden"][name="sort"]')
    ).toHaveAttribute("value", "votes");
  });

  it("omits the hidden sort field for the default newest sort", () => {
    const { container } = render(
      <HomeMovieTitleSearch sort="date" titleQuery="alien" />
    );

    expect(
      container.querySelector('input[type="hidden"][name="sort"]')
    ).toBeNull();
  });

  it("clears only the title filter while preserving the active sort", () => {
    render(<HomeMovieTitleSearch sort="votes" titleQuery="alien" />);

    expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute(
      "href",
      "/?sort=votes"
    );
  });
});
