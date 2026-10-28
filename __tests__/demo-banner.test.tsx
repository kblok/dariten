import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoBanner } from "@/components/demo-banner";

describe("DemoBanner", () => {
  it("tells visitors this browser keeps its own sample household", () => {
    render(<DemoBanner />);
    expect(screen.getByTestId("demo-banner").textContent).toContain("Local demo — no login");
    expect(screen.getByTestId("demo-banner").textContent).toContain("This browser keeps its own sample household");
    expect(screen.getByRole("button", { name: "Reset sample data" }).textContent).toBe("Reset sample data");
  });
});
