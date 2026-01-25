import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";


const mockUseAuth = vi.fn();

vi.mock("../../../hooks/useAuth.js", () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRouter = (ui) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Navbar Component Testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders app title", () => {
      mockUseAuth.mockReturnValue({user: null});

      renderWithRouter(<Navbar/>);
      const titleLink = screen.getByRole("link", {name: "Moj Termin Subscriber App",});

      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute("href", "/");
  });

  describe("user is not authenticated (not logged in)", () => {
    it("shows Login and Register links", () => {
      mockUseAuth.mockReturnValue({user: null});

      renderWithRouter(<Navbar/>);

      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();

      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
      expect(screen.queryByText(/Hi,/)).not.toBeInTheDocument();
      expect(screen.queryByText("My Subscriptions")).not.toBeInTheDocument();
    });

    it("Login and Register links point to correct routes", () => {
      mockUseAuth.mockReturnValue({user: null});

      renderWithRouter(<Navbar/>);

      expect(screen.getByRole("link", {name: "Login"})).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", {name: "Register"})).toHaveAttribute("href", "/register");
    });
  });

  describe("user is authenticated (logged in)", () => {
    it("shows username, Logout, and My Subscriptions", () => {
      mockUseAuth.mockReturnValue({
        user: { username: "marijana" },
        handleLogout: vi.fn(),
      });

      renderWithRouter(<Navbar />);

      expect(screen.getByText("Hi, marijana!")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.getByText("My Subscriptions")).toBeInTheDocument();

      expect(screen.queryByText("Login")).not.toBeInTheDocument();
      expect(screen.queryByText("Register")).not.toBeInTheDocument();
    });

    it("calls handleLogout when Logout button is clicked", () => {
      const handleLogout = vi.fn();

      mockUseAuth.mockReturnValue({
        user: { username: "marijana" },
        handleLogout,
      });

      renderWithRouter(<Navbar />);

      fireEvent.click(screen.getByText("Logout"));
      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });
});
