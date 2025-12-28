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

describe("DoctorSlots Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseTimeslots.mockReturnValue({
      slots: [],
      loading: true,
    });

    mockUseDoctorId.mockReturnValue({
      full_name: "Dr. Jane Doe",
    });

    render(<DoctorSlots />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders no available slots message", () => {
    mockUseTimeslots.mockReturnValue({
      slots: [],
      loading: false,
    });

    mockUseDoctorId.mockReturnValue({
      full_name: "Dr. Jane Doe",
    });

    render(<DoctorSlots />);

    expect(
      screen.getByText("No available slots.")
    ).toBeInTheDocument();
  });

  it("renders list of available slots with formatted date", () => {
    mockUseTimeslots.mockReturnValue({
      loading: false,
      slots: [
        { free_slot: "2025-01-10T14:30:00Z" },
        { free_slot: "2025-01-11T09:00:00Z" },
      ],
    });

    mockUseDoctorId.mockReturnValue({
      full_name: "Dr. Jane Doe",
    });

    render(<DoctorSlots />);

    expect(
      screen.getByText(/Available Slots for Doctor Dr. Jane Doe/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Friday, 10\/01\/2025/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Saturday, 11\/01\/2025/i)
    ).toBeInTheDocument();
  });

  it("calls useTimeslots and useDoctorId with correct doctor id", () => {
    mockUseTimeslots.mockReturnValue({
      slots: [],
      loading: false,
    });

    mockUseDoctorId.mockReturnValue({
      full_name: "Dr. Jane Doe",
    });

    render(<DoctorSlots />);

    expect(mockUseTimeslots).toHaveBeenCalledWith("5");
    expect(mockUseDoctorId).toHaveBeenCalledWith(5);
  });

  it("renders doctor name even when there are no slots", () => {
  mockUseTimeslots.mockReturnValue({
    slots: [],
    loading: false,
  });

  mockUseDoctorId.mockReturnValue({
    full_name: "Dr. Jane Doe",
  });

  render(<DoctorSlots />);

  expect(
    screen.getByText(/Available Slots for Doctor Dr. Jane Doe/i)
  ).toBeInTheDocument();
});

it("renders correct number of slots", () => {
  mockUseTimeslots.mockReturnValue({
    loading: false,
    slots: [
      { free_slot: "2025-01-10T14:30:00Z" },
      { free_slot: "2025-01-11T09:00:00Z" },
      { free_slot: "2025-01-12T16:15:00Z" },
    ],
  });

  mockUseDoctorId.mockReturnValue({
    full_name: "Dr. Jane Doe",
  });

  render(<DoctorSlots />);

  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(3);
});

it("does not render slot list while loading", () => {
  mockUseTimeslots.mockReturnValue({
    slots: [{ free_slot: "2025-01-10T14:30:00Z" }],
    loading: true,
  });

  mockUseDoctorId.mockReturnValue({
    full_name: "Dr. Jane Doe",
  });

  render(<DoctorSlots />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

it("renders formatted time as well as date", () => {
  mockUseTimeslots.mockReturnValue({
    loading: false,
    slots: [{ free_slot: "2025-01-10T14:30:00Z" }],
  });

  mockUseDoctorId.mockReturnValue({
    full_name: "Dr. Jane Doe",
  });

  render(<DoctorSlots />);

  expect(
  screen.getByText((text) =>
    text.includes("10/01/2025") && text.includes("15:30")
  )
  ).toBeInTheDocument();
});

it("reveals crash if doctor hook returns null (defensive test)", () => {
  mockUseTimeslots.mockReturnValue({
    slots: [],
    loading: false,
  });

  mockUseDoctorId.mockReturnValue(null);

  expect(() => render(<DoctorSlots />)).toThrow();
});

});
