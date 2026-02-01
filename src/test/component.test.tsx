import { test, expect, vi, describe } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * Example React component test using Vitest and Testing Library
 */

// Simple Button component for testing
function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
}

describe("Button Component", () => {
  test("renders button with text", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
