import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MySubscriptions from "../../../components/subscription/UserSubscriptions";

vi.mock("../../../hooks/useUserSubscription.js", () => ({
  default: vi.fn(),
}));

vi.mock("../../../hooks/useDoctors.js", () => ({
  default: vi.fn(),
}));

import useUserSubscriptions from "../../../hooks/useUserSubscription.js";
import useDoctors from "../../../hooks/useDoctors.js";

describe("MySubscriptions", () => {
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

    mockUseDoctors.mockReturnValue({
      doctors: [],
    });

    render(<MySubscriptions />);

    expect(
      screen.getByText(/loading subscriptions/i)
    ).toBeInTheDocument();
  });

  it("shows message when there are no subscriptions", () => {
    mockUseUserSubscriptions.mockReturnValue({
      subscriptions: [],
      loading: false,
    });

    mockUseDoctors.mockReturnValue({
      doctors: [],
    });

    render(<MySubscriptions />);

    expect(
      screen.getByText(/you have no subscriptions yet/i)
    ).toBeInTheDocument();
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

    mockUseDoctors.mockReturnValue({
      doctors: [],
    });

    render(<MySubscriptions />);

    expect(screen.getByText("Unknown Doctor")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
