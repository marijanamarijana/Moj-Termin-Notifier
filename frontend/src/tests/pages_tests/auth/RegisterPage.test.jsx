import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterPage from "../../../pages/auth/RegisterPage";

vi.mock("../../../components/auth/RegisterForm", () => ({
  default: () => <div data-testid="register-form">Mock RegisterForm</div>,
}));

describe("RegisterPage", () => {
  it("renders without crashing", () => {
    render(<RegisterPage />);
  });

  it("renders RegisterForm component", () => {
    render(<RegisterPage />);

    expect(
      screen.getByTestId("register-form")
    ).toBeInTheDocument();
  });

  it("renders RegisterForm exactly once", () => {
    render(<RegisterPage />);

    const forms = screen.getAllByTestId("register-form");
    expect(forms).toHaveLength(1);
  });
});
