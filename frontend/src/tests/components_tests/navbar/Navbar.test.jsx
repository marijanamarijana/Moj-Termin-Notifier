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

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders app title", () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithRouter(<Navbar />);
    expect(
      screen.getByText("Moj Termin Subscriber App")
    ).toBeInTheDocument();
  });

  it("shows Login and Register links when user is not logged in", () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithRouter(<Navbar />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    expect(screen.queryByText(/Hi,/)).not.toBeInTheDocument();
  });

  it("shows username, Logout, and My Subscriptions when user is logged in", () => {
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
