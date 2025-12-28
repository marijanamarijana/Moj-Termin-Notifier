import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../../axios/axios";
import RegisterForm from "../../../components/auth/RegisterForm";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("RegisterForm Component", () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    navigateMock.mockClear(); // clear previous calls
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("renders the form correctly", () => {
    renderWithRouter(<RegisterForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  it("updates input fields correctly", () => {
    renderWithRouter(<RegisterForm />);
    const emailInput = screen.getByLabelText(/Email/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  it("submits form successfully and navigates after success", async () => {
    renderWithRouter(<RegisterForm />);

    mockAxios.onPost("/users/register").reply(200, {
      message: "Registration successful",
    });

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration successful")).toBeInTheDocument();
    });

    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("displays error message on failed registration", async () => {
    renderWithRouter(<RegisterForm />);

    mockAxios.onPost("/users/register").reply(400, {
      detail: "Email already exists",
    });

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("displays generic error if response has no detail", async () => {
    renderWithRouter(<RegisterForm />);

    mockAxios.onPost("/users/register").networkError();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
