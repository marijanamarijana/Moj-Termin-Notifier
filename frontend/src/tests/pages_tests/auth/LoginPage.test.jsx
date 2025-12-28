import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../../../pages/auth/LoginPage";

vi.mock("../../../components/auth/LoginForm", () => ({
  default: ({ onLogin }) => (
    <button onClick={() => onLogin({ username: "testuser" })}>
      Mock LoginForm
    </button>
  ),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders LoginForm when no user is logged in", () => {
    render(<LoginPage />);

    expect(screen.getByText("Mock LoginForm")).toBeInTheDocument();
  });

  it("loads user from localStorage on mount and shows welcome message", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ username: "marijana" })
    );

    render(<LoginPage />);

    expect(
      screen.getByText("Welcome, marijana")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Logout/i }))
      .toBeInTheDocument();
  });

  it("logs out user and clears localStorage", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ username: "marijana" })
    );
    localStorage.setItem("token", "fake-token");

    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Logout/i }));

    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();

    expect(
      screen.getByText("Mock LoginForm")
    ).toBeInTheDocument();
  });

  it("sets user when LoginForm calls onLogin", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText("Mock LoginForm"));

    expect(
      screen.getByText("Welcome, testuser")
    ).toBeInTheDocument();
  });
});

describe("LoginPage – extended tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("does not render LoginForm when user exists", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ username: "marijana" })
    );

    render(<LoginPage />);

    expect(
      screen.queryByText("Mock LoginForm")
    ).not.toBeInTheDocument();
  });

  it("renders Logout button only when user exists", () => {
    render(<LoginPage />);
    expect(
      screen.queryByRole("button", { name: /Logout/i })
    ).not.toBeInTheDocument();

    localStorage.setItem(
      "user",
      JSON.stringify({ username: "marijana" })
    );

    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /Logout/i })
    ).toBeInTheDocument();
  });

  it("logs out even if token is missing", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ username: "marijana" })
    );

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Logout"));

    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByText("Mock LoginForm")).toBeInTheDocument();
  });

  it("replaces existing user when LoginForm calls onLogin again", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText("Mock LoginForm"));
    expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));
    fireEvent.click(screen.getByText("Mock LoginForm"));

    expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();
  });

  it("calls localStorage.getItem on mount", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    render(<LoginPage />);

    expect(getItemSpy).toHaveBeenCalledWith("user");
  });

  it("does not crash if localStorage user is invalid JSON", () => {
    localStorage.setItem("user", "{invalid-json");

    expect(() => render(<LoginPage />)).not.toThrow();
  });
});