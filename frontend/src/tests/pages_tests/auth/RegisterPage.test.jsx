import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterPage from "../../../pages/auth/RegisterPage";

vi.mock("../../../components/auth/RegisterForm", () => ({
  default: () => (
    <div data-testid="register-form">Mock RegisterForm</div>
  ),
}));

describe("RegisterPage Testing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => render(<RegisterPage />)).not.toThrow();
  });

  it("renders RegisterForm component", () => {
    render(<RegisterPage />);

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("renders RegisterForm exactly once", () => {
    render(<RegisterPage />);

    const forms = screen.getAllByTestId("register-form");
    expect(forms).toHaveLength(1);
  });

  it("wraps RegisterForm inside a container div", () => {
    render(<RegisterPage />);

    const form = screen.getByTestId("register-form");
    const container = form.closest(".container");

    expect(container).toBeInTheDocument();
  });

  it("does not render any unexpected content", () => {
    render(<RegisterPage />);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
  });

  it("acts only as a layout component (no internal logic)", () => {
    render(<RegisterPage />);

    expect(screen.getAllByTestId("register-form")).toHaveLength(1);
  });
});
