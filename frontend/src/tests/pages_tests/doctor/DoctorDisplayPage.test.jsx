import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DoctorList from "../../../pages/doctor/DoctorsDisplayPage";

const mockUseDoctors = vi.fn();

vi.mock("../../../hooks/useDoctors", () => ({
  default: () => mockUseDoctors(),
}));

vi.mock("../../../components/doctor/DoctorCard", () => ({
  default: ({ doctor }) => (
    <div data-testid="doctor-card">
      {doctor.full_name}
    </div>
  ),
}));

vi.mock("../../../components/doctor/DoctorAddForm", () => ({
  default: ({ onAdd }) => (
    <button data-testid="doctor-form" onClick={() => onAdd({ doctor_id: "1" })}>
      Mock DoctorForm
    </button>
  ),
}));

describe("DoctorList Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    mockUseDoctors.mockReturnValue({
      doctors: [],
      loading: false,
      onAdd: vi.fn(),
    });

    render(<DoctorList />);
    expect(
      screen.getByText("Available Doctors")
    ).toBeInTheDocument();
  });

  it("renders spinner while loading", () => {
    mockUseDoctors.mockReturnValue({
      doctors: [],
      loading: true,
      onAdd: vi.fn(),
    });

    render(<DoctorList />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders doctor cards when loading is false", () => {
    mockUseDoctors.mockReturnValue({
      loading: false,
      doctors: [
        { id: 1, full_name: "Dr. A" },
        { id: 2, full_name: "Dr. B" },
      ],
      onAdd: vi.fn(),
    });

    render(<DoctorList />);

    const cards = screen.getAllByTestId("doctor-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Dr. A")).toBeInTheDocument();
    expect(screen.getByText("Dr. B")).toBeInTheDocument();
  });

  it("renders empty state safely when there are no doctors", () => {
    mockUseDoctors.mockReturnValue({
      loading: false,
      doctors: [],
      onAdd: vi.fn(),
    });

    render(<DoctorList />);
    expect(screen.queryAllByTestId("doctor-card")).toHaveLength(0);
  });

  it("always renders DoctorForm", () => {
    mockUseDoctors.mockReturnValue({
      loading: false,
      doctors: [],
      onAdd: vi.fn(),
    });

    render(<DoctorList />);
    expect(
      screen.getByTestId("doctor-form")
    ).toBeInTheDocument();
  });

  it("passes onAdd from hook to DoctorForm", () => {
    const onAdd = vi.fn();

    mockUseDoctors.mockReturnValue({
      loading: false,
      doctors: [],
      onAdd,
    });

    render(<DoctorList />);
    screen.getByTestId("doctor-form").click();

    expect(onAdd).toHaveBeenCalledWith({ doctor_id: "1" });
  });
});
