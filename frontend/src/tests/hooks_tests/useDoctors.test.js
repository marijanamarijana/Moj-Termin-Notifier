import { renderHook, act, waitFor } from "@testing-library/react";
import useDoctors from "../../hooks/useDoctors";
import doctorRepository from "../../repository/doctorRepository";

vi.mock("../../repository/doctorRepository", () => ({
  default: {
    findAll: vi.fn(),
    add: vi.fn(),
  },
}));

describe("useDoctors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches doctors on mount", async () => {
    const doctors = [
     { full_name: "БОЖИДАР ПОПОСКИ", id: 879157831 },
        { full_name: "Марјан Балоски", id: 891281366 },
    ];

    doctorRepository.findAll.mockResolvedValue({ data: doctors });

    const { result } = renderHook(() => useDoctors());

    expect(result.current.loading).toBe(true);
    expect(result.current.doctors).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.doctors).toEqual(doctors);
    });

    expect(doctorRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("adds a new doctor and refetches doctors", async () => {
    const doctorsBefore = [{ full_name: "БОЖИДАР ПОПОСКИ", id: 879157831 }];
    const doctorsAfter = [
      { full_name: "БОЖИДАР ПОПОСКИ", id: 879157831 },
        { full_name: "Марјан Балоски", id: 891281366 },
    ];

    doctorRepository.findAll
      .mockResolvedValueOnce({ data: doctorsBefore })
      .mockResolvedValueOnce({ data: doctorsAfter });

    doctorRepository.add.mockResolvedValue({});

    const { result } = renderHook(() => useDoctors());

    await waitFor(() => expect(result.current.doctors).toEqual(doctorsBefore));

    await act(async () => {
      await result.current.onAdd({ doctor_id: 891281366 });
    });

    await waitFor(() => expect(result.current.doctors).toEqual(doctorsAfter));

    expect(doctorRepository.add).toHaveBeenCalledWith({ doctor_id: 891281366 });
    expect(doctorRepository.findAll).toHaveBeenCalledTimes(2);
  });
});
