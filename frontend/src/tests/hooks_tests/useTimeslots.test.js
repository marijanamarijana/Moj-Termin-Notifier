import { renderHook, waitFor } from "@testing-library/react";
import useTimeslots from "../../hooks/useTimeslots";
import timeslotRepository from "../../repository/timeslotRepository";

vi.mock("../../repository/timeslotRepository", () => ({
  default: { getByDoctor: vi.fn() },
}));

const slotsDoctor1 = [
  { id: 1, free_slot: "2025-08-04T08:40:00", doctor_id: 1096535518 },
  { id: 2, free_slot: "2025-08-04T09:00:00", doctor_id: 1096535518 },
];

const slotsDoctor2 = [
  { id: 3, free_slot: "2025-08-05T09:00:00", doctor_id: 891281366 },
];

describe("useTimeslots hook tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state on first render", () => {
    timeslotRepository.getByDoctor.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useTimeslots(1096535518));

    expect(result.current.loading).toBe(true);
    expect(result.current.slots).toEqual([]);
  });

  it("fetches timeslots for a doctor", async () => {
        timeslotRepository.getByDoctor.mockResolvedValue({ data: slotsDoctor1 });

    const { result } = renderHook(() => useTimeslots(1096535518));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.slots).toEqual(slotsDoctor1);
    });

    expect(timeslotRepository.getByDoctor).toHaveBeenCalledTimes(1);
    expect(timeslotRepository.getByDoctor).toHaveBeenCalledWith(1096535518);
  });

  it("refetches timeslots when doctor id changes", async () => {
    timeslotRepository.getByDoctor
      .mockResolvedValueOnce({ data: slotsDoctor1 })
      .mockResolvedValueOnce({ data: slotsDoctor2 });

    const { result, rerender } = renderHook(
      ({ id }) => useTimeslots(id),
      { initialProps: { id: 1096535518 } }
    );

    await waitFor(() => {
      expect(result.current.slots).toEqual(slotsDoctor1);
    });

    rerender({ id: 891281366 });

    await waitFor(() => {
      expect(result.current.slots).toEqual(slotsDoctor2);
      expect(result.current.loading).toBe(false);
    });

    expect(timeslotRepository.getByDoctor).toHaveBeenCalledTimes(2);
    expect(timeslotRepository.getByDoctor).toHaveBeenLastCalledWith(891281366);
  });

  it("calls repository even when doctor id is undefined", async () => {
    timeslotRepository.getByDoctor.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useTimeslots(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.slots).toEqual([]);
    });

    expect(timeslotRepository.getByDoctor).toHaveBeenCalledWith(undefined);
  });

  it("calls repository even when doctor id is null", async () => {
    timeslotRepository.getByDoctor.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useTimeslots(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.slots).toEqual([]);
    });

    expect(timeslotRepository.getByDoctor).toHaveBeenCalledWith(null);
  });
});
