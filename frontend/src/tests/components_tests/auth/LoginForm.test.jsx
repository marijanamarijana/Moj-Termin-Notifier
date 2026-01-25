import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../../../components/auth/LoginForm";
import MockAdapter from "axios-mock-adapter";
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

let mockAxiosInstance;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockAxiosInstance = new MockAdapter(axiosInstance);
});

afterEach(() => {
  mockAxiosInstance.restore();
});

describe("LoginForm Component Testing", () => {
  it("renders login form inputs and button", () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("updates input values when typing", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");
    await user.type(screen.getByLabelText(/password/i), "123456");

    expect(screen.getByLabelText(/username/i)).toHaveValue("john");
    expect(screen.getByLabelText(/password/i)).toHaveValue("123456");
  });

  it("logs in successfully and navigates home", async () => {
    mockAxiosInstance.onPost("/users/login").reply(200, {
      token: "fake-token",
      user: { id: 1, username: "john" }
    });

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");
    await user.type(screen.getByLabelText(/password/i), "123456");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(handleLoginMock).toHaveBeenCalledWith({
        id: 1,
        username: "john"
      });
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("sends correct form data and headers", async () => {
    mockAxiosInstance.onPost("/users/login").reply((config) => {
      expect(config.headers["Content-Type"]).toBe(
        "application/x-www-form-urlencoded"
      );

      const params = new URLSearchParams(config.data);
      expect(params.get("username")).toBe("john");
      expect(params.get("password")).toBe("123456");

      return [
        200,
        {
          token: "token",
          user: { id: 1, username: "john" }
        }
      ];});

      const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");
    await user.type(screen.getByLabelText(/password/i), "123456");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(handleLoginMock).toHaveBeenCalled();
    });
  });

  it("shows error message on failed login", async () => {
    mockAxiosInstance.onPost("/users/login").reply(401);

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "wrong");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/login failed/i)
    ).toBeInTheDocument();

    expect(navigateMock).not.toHaveBeenCalled();
    expect(handleLoginMock).not.toHaveBeenCalled();;
  });

    it("clears error on retry after failed login", async () => {
    mockAxiosInstance
      .onPost("/users/login")
      .replyOnce(401)
      .onPost("/users/login")
      .replyOnce(200, {
        token: "new-token",
        user: { id: 2, username: "john" }
      });

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "wrong");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/login failed/i)
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/username/i));
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/username/i), "john");
    await user.type(screen.getByLabelText(/password/i), "123456");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/login failed/i)
      ).not.toBeInTheDocument();
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });
});
