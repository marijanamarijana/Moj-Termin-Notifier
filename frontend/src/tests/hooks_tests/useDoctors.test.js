import { renderHook, act, waitFor } from "@testing-library/react";
import useDoctors from "../../hooks/useDoctors";
import doctorRepository from "../../repository/doctorRepository";

vi.mock("../../repository/doctorRepository", () => ({
  default: {
    findAll: vi.fn(),
    add: vi.fn(),
  },
}));

const doctor1 = {
  id: 1096535518,
  full_name: "ВАНЧЕ ТРАЈКОВСКА",
};

const doctor2 = {
  id: 879157831,
  full_name: "БОЖИДАР ПОПОСКИ",
};

describe("useDoctors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state on first render", () => {
    doctorRepository.findAll.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useDoctors());

    expect(result.current.loading).toBe(true);
    expect(result.current.doctors).toEqual([]);
    expect(typeof result.current.onAdd).toBe("function");
  });

  it("fetches doctors on mount", async () => {
      doctorRepository.findAll.mockResolvedValue({
      data: [doctor1, doctor2],
    });

    const { result } = renderHook(() => useDoctors());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.doctors).toEqual([doctor1, doctor2]);
    });

    expect(doctorRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("adds a new doctor and refetches doctors", async () => {
    doctorRepository.findAll
      .mockResolvedValueOnce({ data: [doctor1] })
      .mockResolvedValueOnce({ data: [doctor1, doctor2] });

    doctorRepository.add.mockResolvedValue({});

    const { result } = renderHook(() => useDoctors());

    await waitFor(() => {
      expect(result.current.doctors).toEqual([doctor1]);
    });

    await act(async () => {
      await result.current.onAdd({ doctor_id: doctor2.id });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.doctors).toEqual([doctor1, doctor2]);
    });

    expect(doctorRepository.add).toHaveBeenCalledWith({
      doctor_id: doctor2.id,
    });
    expect(doctorRepository.findAll).toHaveBeenCalledTimes(2);
  });

  it("does not refetch doctors on rerender without changes", async () => {
    doctorRepository.findAll.mockResolvedValue({ data: [] });

    const { rerender } = renderHook(() => useDoctors());

    await waitFor(() => {
      expect(doctorRepository.findAll).toHaveBeenCalledTimes(1);
    });

    rerender();

    expect(doctorRepository.findAll).toHaveBeenCalledTimes(1);
  });

});
