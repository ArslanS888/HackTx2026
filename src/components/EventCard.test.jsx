import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "./EventCard";

vi.mock("../lib/format", () => ({
  formatRelativeTime: () => "in 25 min",
}));

const base = {
  id: "abc",
  title: "Study session",
  category: "study",
  place_name: "Alkek Library",
  starts_at: new Date(Date.now() + 25 * 60000).toISOString(),
  host_name: "Alex B.",
  member_count: 2,
  max_people: 5,
};

function renderCard(event) {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>,
  );
}

describe("EventCard", () => {
  it("renders title, place, and going count", () => {
    renderCard(base);
    expect(screen.getByText("Study session")).toBeInTheDocument();
    expect(screen.getByText("Alkek Library")).toBeInTheDocument();
    expect(screen.getByText("2/5 going")).toBeInTheDocument();
  });

  it("shows Full badge when count equals max_people", () => {
    renderCard({ ...base, member_count: 5, max_people: 5 });
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("does not show Full badge when spots remain", () => {
    renderCard(base);
    expect(screen.queryByText("Full")).not.toBeInTheDocument();
  });
});
