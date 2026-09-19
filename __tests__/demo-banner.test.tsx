import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoBanner } from "@/components/demo-banner";

describe("DemoBanner", () => {
  it("tells visitors this is a shared demo with no login", () => {
    render(<DemoBanner />);
    expect(screen.getByTestId("demo-banner").textContent).toContain("Shared demo — no login");
  });
});
