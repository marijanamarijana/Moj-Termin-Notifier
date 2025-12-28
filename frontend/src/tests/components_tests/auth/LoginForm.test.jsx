import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../../../components/auth/LoginForm";
import axiosInstance from "../../../axios/axios";
import { BrowserRouter } from "react-router-dom";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

const handleLoginMock = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    handleLogin: handleLoginMock
  }))
}));

vi.mock("../../../axios/axios", () => ({
  default: {
    post: vi.fn()
  }
}));

const mockedAxios = axiosInstance;

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders login form inputs and button", () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("logs in successfully and navigates home", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        user: { id: 1, username: "john" }
      }
    });

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "john" }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" }
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(handleLoginMock).toHaveBeenCalledWith({ id: 1, username: "john" });
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on failed login", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wrong" }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" }
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/login failed/i)
    ).toBeInTheDocument();
  });
});
