import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DoctorSlots from "../../../pages/doctor/DoctorAvailableSlotsPage";

const mockUseTimeslots = vi.fn();
const mockUseDoctorId = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "5" }),
}));

vi.mock("../../../hooks/useTimeslots.js", () => ({
  default: (id) => mockUseTimeslots(id),
}));

vi.mock("../../../hooks/useDoctorId.js", () => ({
  default: (id) => mockUseDoctorId(id),
}));

const setup = ({
  timeslotsReturn = { slots: [], loading: false },
  doctorReturn = { full_name: "Dr. Jane Doe" },
} = {}) => {
  mockUseTimeslots.mockReturnValue(timeslotsReturn);
  mockUseDoctorId.mockReturnValue(doctorReturn);
  render(<DoctorSlots />);
};

describe("DoctorSlots Page Testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    setup({
      timeslotsReturn: { slots: [], loading: true },
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders doctor name in the header", () => {
    setup();

    expect(
      screen.getByText(/Available Slots for Doctor Dr. Jane Doe/i)
    ).toBeInTheDocument();
  });

  it("renders no available slots message when slots array is empty", () => {
    setup({
      timeslotsReturn: { slots: [], loading: false },
    });

    expect(screen.getByText("No available slots.")).toBeInTheDocument();
  });

  it("renders a list of available slots", () => {
    setup({
      timeslotsReturn: {
        loading: false,
        slots: [
          { free_slot: "2025-01-10T14:30:00Z" },
          { free_slot: "2025-01-11T09:00:00Z" },
        ],
      },
    });

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("formats date and time for each slot", () => {
    setup({
      timeslotsReturn: {
        loading: false,
        slots: [{ free_slot: "2025-01-10T14:30:00Z" }],
      },
    });

    expect(
      screen.getByText((text) =>
        text.includes("10/01/2025") && text.includes("15:30")
      )
    ).toBeInTheDocument();
  });

  it("does not render slot list while loading", () => {
    setup({
      timeslotsReturn: {
        slots: [{ free_slot: "2025-01-10T14:30:00Z" }],
        loading: true,
      },
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("calls hooks with correct doctor id types", () => {
    setup();

    expect(mockUseTimeslots).toHaveBeenCalledWith("5");
    expect(mockUseDoctorId).toHaveBeenCalledWith(5);
  });

  it("renders correct number of list items", () => {
    setup({
      timeslotsReturn: {
        loading: false,
        slots: [
          { free_slot: "2025-01-10T14:30:00Z" },
          { free_slot: "2025-01-11T09:00:00Z" },
          { free_slot: "2025-01-12T16:15:00Z" },
        ],
      },
    });

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("handles invalid date strings without crashing", () => {
    setup({
      timeslotsReturn: {
        loading: false,
        slots: [{ free_slot: "invalid-date" }],
      },
    });

    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
