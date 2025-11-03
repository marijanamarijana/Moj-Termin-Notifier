import { renderHook, waitFor } from "@testing-library/react";
import useDoctors from "../../hooks/useDoctors";
import doctorRepository from "../../repository/doctorRepository";

vi.mock("../../repository/doctorRepository");

describe("useDoctors", () => {
  it("loads and returns all doctors", async () => {
    const mockDoctors = [{
          "full_name": "БОЖИДАР ПОПОСКИ",
          "id": 879157831
        },
        {
          "full_name": "Марјан Балоски",
          "id": 891281366
        }];

    doctorRepository.findAll.mockResolvedValueOnce({ data: mockDoctors });

    const { result } = renderHook(() => useDoctors());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.doctors).toEqual(mockDoctors);
  });

  it("adds a doctor and reloads list", async () => {
    const mockDoctors = [{
          "full_name": "БОЖИДАР ПОПОСКИ",
          "id": 879157831
        },
        {
          "full_name": "Марјан Балоски",
          "id": 891281366
        }];

    doctorRepository.add.mockResolvedValueOnce({});
    doctorRepository.findAll.mockResolvedValueOnce({ data: mockDoctors });

    const { result } = renderHook(() => useDoctors());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.onAdd({
    "full_name": "БИЛЈАНА САВИН ИВАНОВСКА",
    "id": 1376904131
  });
    expect(doctorRepository.add).toHaveBeenCalled();
    expect(doctorRepository.findAll).toHaveBeenCalledTimes(2);
  });
});
