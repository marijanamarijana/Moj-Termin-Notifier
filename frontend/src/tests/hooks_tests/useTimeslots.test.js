import { renderHook, waitFor } from "@testing-library/react";
import useTimeslots from "../../hooks/useTimeslots";
import timeslotRepository from "../../repository/timeslotRepository";

vi.mock("../../repository/timeslotRepository", () => ({
  default: { getByDoctor: vi.fn() },
}));

describe("useTimeslots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches timeslots for a doctor", async () => {
    const mockSlots = [
      { id: 1, free_slot: "2025-08-04T08:40:00", doctor_id: 1096535518 },
      { id: 2, free_slot: "2025-08-04T09:00:00", doctor_id: 1096535518 },
    ];

    timeslotRepository.getByDoctor.mockResolvedValue({ data: mockSlots });

    const { result } = renderHook(() => useTimeslots(1096535518));

    expect(result.current.loading).toBe(true);
    expect(result.current.slots).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.slots).toEqual(mockSlots);
    });

    expect(timeslotRepository.getByDoctor).toHaveBeenCalledWith(1096535518);
  });

  it("updates when doctor id changes", async () => {
    const slots1 = [{ id: 1, free_slot: "2025-08-04T08:40:00", doctor_id: 1096535518 }];
    const slots2 = [{ id: 2, free_slot: "2025-08-05T09:00:00", doctor_id: 891281366 }];

    timeslotRepository.getByDoctor
      .mockResolvedValueOnce({ data: slots1 })
      .mockResolvedValueOnce({ data: slots2 });

    const { result, rerender } = renderHook(({ id }) => useTimeslots(id), {
      initialProps: { id: 1096535518 },
    });

    await waitFor(() => expect(result.current.slots).toEqual(slots1));

    rerender({ id: 891281366 });

    await waitFor(() => expect(result.current.slots).toEqual(slots2));

    expect(timeslotRepository.getByDoctor).toHaveBeenCalledTimes(2);
    expect(timeslotRepository.getByDoctor).toHaveBeenCalledWith(891281366);
  });
});
