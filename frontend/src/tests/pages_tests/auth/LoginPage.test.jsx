import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "../../../pages/auth/LoginPage";
import userEvent from "@testing-library/user-event";

vi.mock("../../../components/auth/LoginForm", () => ({
  default: ({ onLogin }) => (
    <button onClick={() => onLogin({ username: "testuser" })}>
      Mock LoginForm
    </button>
  ),
}));

describe("LoginPage Testing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("LoginPage – initial state", () => {
    it("renders LoginForm when no user is logged in", () => {
      render(<LoginPage />);

      expect(screen.getByText("Mock LoginForm")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /mock loginform/i })).toBeInTheDocument();
    });

    it("loads user from localStorage on mount and shows welcome message", () => {
      localStorage.setItem("user", JSON.stringify({ username: "marijana" }));
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

      render(<LoginPage />);

      expect(screen.getByText("Welcome, marijana")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();

      expect(getItemSpy).toHaveBeenCalledTimes(1);
      expect(getItemSpy).toHaveBeenCalledWith("user");
    });
  });

  describe("LoginPage – login flow", () => {
    it("sets user and shows welcome message after login", async () => {
      render(<LoginPage />);

      await userEvent.click(screen.getByRole("button", { name: /mock loginform/i }));
      expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();
    });

    it("replaces LoginForm with welcome message after login", async () => {
      render(<LoginPage />);

      await userEvent.click(screen.getByText("Mock LoginForm"));

      expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();
      expect(screen.queryByText("Mock LoginForm")).not.toBeInTheDocument();
    });

    it("does not render LoginForm when user exists", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ username: "marijana" })
      );

      render(<LoginPage />);

      expect(screen.queryByText("Mock LoginForm")).not.toBeInTheDocument();
    });
  });

  describe("LoginPage – logout flow", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      localStorage.clear();
      localStorage.setItem(
        "user",
        JSON.stringify({ username: "marijana" })
      );
      localStorage.setItem("token", "fake-token");
    });

    it("renders welcome message and logout button when user exists", () => {
      render(<LoginPage />);

      expect(screen.getByText("Welcome, marijana")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    });

    it("logs out user and clears localStorage", async () => {
      render(<LoginPage />);

      await userEvent.click(screen.getByRole("button", { name: /logout/i }));

      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(screen.getByText("Mock LoginForm")).toBeInTheDocument();
    });

    it("logs out correctly even if token is missing", async () => {
      localStorage.removeItem("token");

      render(<LoginPage />);

      await userEvent.click(screen.getByText("Logout"));

      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(screen.getByText("Mock LoginForm")).toBeInTheDocument();
    });
  });

  describe("LoginPage – edge cases", () => {
    it("replaces existing user when LoginForm calls onLogin again", async () => {
      render(<LoginPage/>);

      await userEvent.click(screen.getByText("Mock LoginForm"));
      expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();

      await userEvent.click(screen.getByText("Logout"));
      await userEvent.click(screen.getByText("Mock LoginForm"));

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

      expect(localStorage.getItem("user")).toBeNull();
      expect(screen.getByText("Mock LoginForm")).toBeInTheDocument();
    });

    it("does not crash if stored user has no username", () => {
      localStorage.setItem("user", JSON.stringify({}));

      expect(() => render(<LoginPage />)).not.toThrow();
  });
  });
});