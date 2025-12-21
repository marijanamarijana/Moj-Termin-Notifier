import { renderHook, waitFor } from "@testing-library/react";
import useDoctorId from "../../hooks/useDoctorId";
import doctorRepository from "../../repository/doctorRepository";

vi.mock("../../repository/doctorRepository", () => ({
  default: {
    findById: vi.fn(),
  },
}));

describe("useDoctorId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches doctor by id and sets state", async () => {
    const mockDoctor = {
        full_name: "ВАНЧЕ ТРАЈКОВСКА",
        id: 1096535518 };
    doctorRepository.findById.mockResolvedValue({ data: mockDoctor });

    const { result } = renderHook(() => useDoctorId(1096535518));

    await waitFor(() => {
      expect(result.current).toEqual(mockDoctor);
    });

    expect(doctorRepository.findById).toHaveBeenCalledWith(1096535518);
  });

  it("updates when id changes", async () => {
    const doctor1 = {full_name: "ВАНЧЕ ТРАЈКОВСКА", id: 1096535518 };
    const doctor2 =  { full_name: "БОЖИДАР ПОПОСКИ", id: 879157831 };

    doctorRepository.findById
      .mockResolvedValueOnce({ data: doctor1 })
      .mockResolvedValueOnce({ data: doctor2 });

    const { result, rerender } = renderHook(
      ({ id }) => useDoctorId(id),
      { initialProps: { id: 1096535518 } }
    );

    await waitFor(() => expect(result.current).toEqual(doctor1));

    rerender({ id: 879157831 });

    await waitFor(() => expect(result.current).toEqual(doctor2));

    expect(doctorRepository.findById).toHaveBeenCalledTimes(2);
    expect(doctorRepository.findById).toHaveBeenCalledWith(879157831);
  });
});
