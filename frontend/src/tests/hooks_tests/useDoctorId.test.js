import { renderHook, waitFor } from "@testing-library/react";
import useDoctorId from "../../hooks/useDoctorId";
import doctorRepository from "../../repository/doctorRepository";

vi.mock("../../repository/doctorRepository");

describe("useDoctorId", () => {
  it("fetches doctor data by id", async () => {
    const mockDoctor = {
    "full_name": "БИЛЈАНА САВИН ИВАНОВСКА",
    "id": 1376904131
  };
    doctorRepository.findById.mockResolvedValueOnce({ data: mockDoctor });

    const { result } = renderHook(() => useDoctorId(1376904131));

    await waitFor(() => expect(result.current).toEqual(mockDoctor));
  });
});
