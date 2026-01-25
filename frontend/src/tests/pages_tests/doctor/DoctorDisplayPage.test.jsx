import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DoctorList from "../../../pages/doctor/DoctorsDisplayPage";

const mockUseDoctors = vi.fn();

vi.mock("../../../hooks/useDoctors", () => ({
  default: () => mockUseDoctors(),
}));

vi.mock("../../../components/doctor/DoctorCard", () => ({
  default: ({ doctor }) => (
    <div data-testid="doctor-card">{doctor.full_name}</div>
  ),
}));

vi.mock("../../../components/doctor/DoctorAddForm", () => ({
  default: ({ onAdd }) => (
    <button
      data-testid="doctor-form"
      onClick={() => onAdd({ doctor_id: "1" })}
    >
      Mock DoctorForm
    </button>
  ),
}));

const setup = ({
  doctors = [],
  loading = false,
  onAdd = vi.fn(),
} = {}) => {
  mockUseDoctors.mockReturnValue({ doctors, loading, onAdd });
  render(<DoctorList />);
  return { onAdd };
};

describe("DoctorList Page Testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    setup();
    expect(screen.getByText("Available Doctors")).toBeInTheDocument();
  });

  it("renders spinner while loading", () => {
    setup({ loading: true });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders doctor cards when loading is false", () => {
    setup({
      doctors: [
        { id: 1, full_name: "Dr. A" },
        { id: 2, full_name: "Dr. B" },
      ],
    });

    const cards = screen.getAllByTestId("doctor-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Dr. A")).toBeInTheDocument();
    expect(screen.getByText("Dr. B")).toBeInTheDocument();
  });

  it("renders empty state safely when there are no doctors", () => {
    setup({ doctors: [] });
    expect(screen.queryAllByTestId("doctor-card")).toHaveLength(0);
  });

  it("always renders DoctorForm", () => {
    setup();
    expect(screen.getByTestId("doctor-form")).toBeInTheDocument();
  });

  it("passes onAdd from hook to DoctorForm", () => {
    const { onAdd } = setup();
    screen.getByTestId("doctor-form").click();
    expect(onAdd).toHaveBeenCalledWith({ doctor_id: "1" });
  });

  it("handles no doctors", () => {
    setup({ doctors: [] });
    expect(screen.queryAllByTestId("doctor-card")).toHaveLength(0);
    expect(screen.getByTestId("doctor-form")).toBeInTheDocument();
  });

  it("handles undefined doctors safely", () => {
    setup({ doctors: undefined });
    expect(screen.queryAllByTestId("doctor-card")).toHaveLength(0);
    expect(screen.getByTestId("doctor-form")).toBeInTheDocument();
  });

  it("renders correctly when both doctors array and loading are falsy", () => {
    setup({ doctors: [], loading: false });
    expect(screen.queryAllByTestId("doctor-card")).toHaveLength(0);
    expect(screen.getByTestId("doctor-form")).toBeInTheDocument();
  });
});
