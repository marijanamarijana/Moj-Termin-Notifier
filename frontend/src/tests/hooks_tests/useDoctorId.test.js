import { renderHook, waitFor } from "@testing-library/react";
import useDoctorId from "../../hooks/useDoctorId";
import doctorRepository from "../../repository/doctorRepository";

vi.mock("../../repository/doctorRepository", () => ({
  default: {
    findById: vi.fn(),
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

describe("useDoctorId hook tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls findById once on initial render", async () => {
    doctorRepository.findById.mockResolvedValue({ data: doctor1 });

    renderHook(() => useDoctorId(doctor1.id));

    await waitFor(() => {
      expect(doctorRepository.findById).toHaveBeenCalledTimes(1);
    });

    expect(doctorRepository.findById).toHaveBeenCalledWith(doctor1.id);
  });

  it("fetches doctor by id and sets state", async () => {
    doctorRepository.findById.mockResolvedValue({ data: doctor1 });

    const { result } = renderHook(() => useDoctorId(doctor1.id));

    await waitFor(() => {
      expect(result.current).toEqual(doctor1);
    });
  });

  it("updates state when id changes", async () => {
    doctorRepository.findById
      .mockResolvedValueOnce({ data: doctor1 })
      .mockResolvedValueOnce({ data: doctor2 });

    const { result, rerender} = renderHook(
      ({ id }) => useDoctorId(id),
      { initialProps: { id: doctor1.id } }
    );

    await waitFor(() => {
      expect(result.current).toEqual(doctor1);
          });

    rerender({ id: doctor2.id });

    await waitFor(() => {
      expect(result.current).toEqual(doctor2);
    });

    expect(doctorRepository.findById).toHaveBeenCalledTimes(2);
    expect(doctorRepository.findById)
      .toHaveBeenLastCalledWith(doctor2.id);
  });

    it("calls repository even when id is undefined", async () => {
    doctorRepository.findById.mockResolvedValue({ data: {} });

    renderHook(() => useDoctorId(undefined));

    await waitFor(() => {
      expect(doctorRepository.findById).toHaveBeenCalledWith(undefined);
    });
    });

    it("calls repository even when id is null", async () => {
    doctorRepository.findById.mockResolvedValue({ data: {} });

    renderHook(() => useDoctorId(null));

    await waitFor(() => {
      expect(doctorRepository.findById).toHaveBeenCalledWith(null);
    });
    });

  it("handles rapid id changes correctly", async () => {
    doctorRepository.findById
      .mockResolvedValueOnce({ data: doctor1 })
      .mockResolvedValueOnce({ data: doctor2 });

    const { result, rerender } = renderHook(
      ({ id }) => useDoctorId(id),
      { initialProps: { id: doctor1.id } }
    );

    rerender({ id: doctor2.id });

    await waitFor(() => {
      expect(result.current).toEqual(doctor2);
    });
  });
});
