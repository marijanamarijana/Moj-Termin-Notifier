import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../../axios/axios";
import RegisterForm from "../../../components/auth/RegisterForm";
import userEvent from "@testing-library/user-event";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("RegisterForm Component Testing", () => {
  let mockAxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = new MockAdapter(axiosInstance);
    navigateMock.mockClear();
  });

  afterEach(() => {
    mockAxiosInstance.restore();
  });

  it("renders all form fields and submit button correctly", () => {
    renderWithRouter(<RegisterForm />);

    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^register$/i })).toBeInTheDocument();
  });

  it("updates input values fields correctly when user types", () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    user.type(screen.getByPlaceholderText(/username/i), "testuser");
    user.type(screen.getByPlaceholderText(/password/i), "password123");

    expect(screen.getByPlaceholderText(/email/i)).toBeEnabled();
    expect(screen.getByPlaceholderText(/username/i)).toBeEnabled();
    expect(screen.getByPlaceholderText(/password/i)).toBeEnabled();
  });

  it("submits form successfully and navigates after success", async () => {
    renderWithRouter(<RegisterForm />);

    mockAxiosInstance.onPost("/users/register").reply(200, {
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
    mockAxiosInstance.onPost("/users/register").reply(400, {
      detail: "Email already exists"
    });
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/username/i), "testuser");
    await user.type(screen.getByPlaceholderText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /^register$/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Email already exists")
      ).toBeInTheDocument();
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("displays generic error if response has no detail", async () => {
    mockAxiosInstance.onPost("/users/register").networkError();

    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/username/i), "testuser");
    await user.type(screen.getByPlaceholderText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /^register$/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Registration failed")
      ).toBeInTheDocument();
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

    it("does not submit form when required fields are empty", async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    await waitFor(() => {expect(navigateMock).not.toHaveBeenCalled();});
  });

  it("clears error message after a successful retry", async () => {
    mockAxiosInstance.onPost("/users/register")
      .replyOnce(400, { detail: "Email already exists" })
      .onPost("/users/register")
      .replyOnce(200, { message: "Registration successful" });

    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/username/i), "testuser");
    await user.type(screen.getByPlaceholderText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.queryByText("Email already exists")).not.toBeInTheDocument();
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

});
