import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DoctorCard from "../../../components/doctor/DoctorCard";


const mockUseAuth = vi.fn();
const mockUseUserSubscriptions = vi.fn();

vi.mock("../../../hooks/useAuth.js", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../../hooks/useUserSubscription", () => ({
  default: () => mockUseUserSubscriptions(),
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("DoctorCard Component", () => {
  const doctor = { id: 1, full_name: "Dr. John Doe" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders doctor info and link", () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [],
      addSubscription: vi.fn(),
      removeSubscription: vi.fn(),
      loading: false,
    });

    renderWithRouter(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See Available Dates/i })).toBeInTheDocument();
  });

  it("renders Subscribe button if user is not subscribed", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    const addSubscription = vi.fn();
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [],
      addSubscription,
      removeSubscription: vi.fn(),
      loading: false,
    });

    renderWithRouter(<DoctorCard doctor={doctor} />);
    const subscribeButton = screen.getByRole("button", { name: /Subscribe/i });
    expect(subscribeButton).toBeInTheDocument();
    expect(subscribeButton).not.toBeDisabled();

    fireEvent.click(subscribeButton);
    expect(addSubscription).toHaveBeenCalledWith(doctor.id);
  });

  it("renders Unsubscribe button if user is subscribed", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    const removeSubscription = vi.fn();
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [{ doctor_id: doctor.id }],
      addSubscription: vi.fn(),
      removeSubscription,
      loading: false,
    });

    renderWithRouter(<DoctorCard doctor={doctor} />);
    const unsubscribeButton = screen.getByRole("button", { name: /Unsubscribe/i });
    expect(unsubscribeButton).toBeInTheDocument();
    expect(unsubscribeButton).not.toBeDisabled();

    fireEvent.click(unsubscribeButton);
    expect(removeSubscription).toHaveBeenCalledWith(doctor.id);
  });

  it("disables buttons when loading is true", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [],
      addSubscription: vi.fn(),
      removeSubscription: vi.fn(),
      loading: true,
    });

    renderWithRouter(<DoctorCard doctor={doctor} />);
    const subscribeButton = screen.getByRole("button", { name: /Subscribe/i });
    expect(subscribeButton).toBeDisabled();
  });

  it("renders nothing if doctor prop is null", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [],
      addSubscription: vi.fn(),
      removeSubscription: vi.fn(),
      loading: false,
    });

    const { container } = renderWithRouter(<DoctorCard doctor={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
