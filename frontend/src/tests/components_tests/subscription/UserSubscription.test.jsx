import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MySubscriptions from "../../../components/subscription/UserSubscriptions";
import useUserSubscriptions from "../../../hooks/useUserSubscription.js";
import useDoctors from "../../../hooks/useDoctors.js";

vi.mock("../../../hooks/useUserSubscription.js", () => ({
  default: vi.fn(),
}));

vi.mock("../../../hooks/useDoctors.js", () => ({
  default: vi.fn(),
}));

describe("MySubscriptions Component Testing", () => {
  const mockUseUserSubscriptions = vi.mocked(useUserSubscriptions);
  const mockUseDoctors = vi.mocked(useDoctors);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when loading", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: null,
      loading: true,
    });

    mockUseDoctors.mockReturnValue({doctors: []});

    render(<MySubscriptions />);

    expect(screen.getByText(/loading subscriptions/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows message when there are no subscriptions", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [],
      loading: false,
    });

    mockUseDoctors.mockReturnValue({doctors: [],});

    render(<MySubscriptions />);

    expect(screen.getByText(/you have no subscriptions yet/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/you have no subscriptions yet/i);
  });

  it("renders subscriptions with doctor info", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [{ id: 1, doctor_id: "2" }],
      loading: false,
    });

    mockUseDoctors.mockReturnValue({
      doctors: [{ id: 2, full_name: "Dr. John Doe" }],
    });

    render(<MySubscriptions />);

    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders fallback when doctor is missing", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [{ id: 1, doctor_id: "99" }],
      loading: false,
    });

    mockUseDoctors.mockReturnValue({doctors: []});

    render(<MySubscriptions />);

    expect(screen.getByText("Unknown Doctor")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders multiple subscriptions correctly", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [
        { id: 1, doctor_id: "2" },
        { id: 2, doctor_id: "3" },
      ],
      loading: false,
    });
    mockUseDoctors.mockReturnValue({
      doctors: [
        { id: 2, full_name: "Dr. John Doe" },
        { id: 3, full_name: "Dr. Jane Smith" },
      ],
    });

    render(<MySubscriptions />);
    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    expect(screen.getByText("Dr. Jane Smith")).toBeInTheDocument();

    const idElements = screen.getAllByText("Id:", { selector: "strong" });
    expect(idElements[0].parentElement).toHaveTextContent("Id: 2");
    expect(idElements[1].parentElement).toHaveTextContent("Id: 3");
  });

  it("handles no doctors gracefully", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [{ id: 1, doctor_id: "2" }],
      loading: false,
    });
    mockUseDoctors.mockReturnValue({ doctors: [] });

    render(<MySubscriptions />);
    expect(screen.getByText("Unknown Doctor")).toBeInTheDocument();
    const idElement = screen.getByText("Id:", { selector: "strong" }).parentElement;
    expect(idElement).toHaveTextContent("Id: N/A");  });

  it("handles subscriptions being null but loading false", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: null,
      loading: false,
    });
    mockUseDoctors.mockReturnValue({ doctors: [] });

    render(<MySubscriptions />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
