import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VideoCard from "@/components/VideoCard";

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
    <img {...props} />
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/VideoModal", () => ({
  default: () => <div>video modal</div>,
}));

vi.mock("@/components/EditModal", () => ({
  default: () => <div>edit modal</div>,
}));

const baseProps = {
  id: 1,
  youtubeId: "abc123def45",
  movieTitle: "Heat",
  sceneTitle: "Downtown shootout",
  description: "Chaos on the street.",
  submittedAt: new Date("2026-04-04T20:00:00.000Z"),
};

describe("VideoCard", () => {
  it("hides edit and delete controls for guests", () => {
    render(<VideoCard {...baseProps} canManage={false} />);

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("shows edit and delete controls for authenticated users", () => {
    render(<VideoCard {...baseProps} canManage />);

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
