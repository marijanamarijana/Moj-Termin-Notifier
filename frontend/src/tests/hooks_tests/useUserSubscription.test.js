import { renderHook, act, waitFor } from "@testing-library/react";
import useUserSubscriptions from "../../hooks/useUserSubscription";
import subscriptionRepository from "../../repository/subscriptionRepository";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../repository/subscriptionRepository", () => ({
  default: { getByUser: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn() },
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("useUserSubscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets empty subscriptions if user is not logged in", async () => {
    useAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useUserSubscriptions());

    await waitFor(() => {
      expect(result.current.subscriptions).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("fetches subscriptions for logged-in user", async () => {
    const mockUser = { id: 1 };
    const mockSubs = [{ id: 1, doctor_id: 1096535518 }];

    useAuth.mockReturnValue({ user: mockUser });
    subscriptionRepository.getByUser.mockResolvedValue({ data: mockSubs });

    const { result } = renderHook(() => useUserSubscriptions());

    await waitFor(() => {
      expect(result.current.subscriptions).toEqual(mockSubs);
      expect(result.current.loading).toBe(false);
    });

    expect(subscriptionRepository.getByUser).toHaveBeenCalledTimes(1);
  });

  it("adds a subscription and refetches", async () => {
    const mockUser = { id: 1 };
    const initialSubs = [];
    const newSubs = [{ id: 1, doctor_id: 1096535518 }];

    useAuth.mockReturnValue({ user: mockUser });
    subscriptionRepository.getByUser
      .mockResolvedValueOnce({ data: initialSubs })
      .mockResolvedValueOnce({ data: newSubs });

    subscriptionRepository.subscribe.mockResolvedValue({});

    const { result } = renderHook(() => useUserSubscriptions());

    await waitFor(() => expect(result.current.subscriptions).toEqual(initialSubs));

    await act(async () => {
      await result.current.addSubscription(1096535518);
    });

    await waitFor(() => expect(result.current.subscriptions).toEqual(newSubs));

    expect(subscriptionRepository.subscribe).toHaveBeenCalledWith(1096535518);
    expect(subscriptionRepository.getByUser).toHaveBeenCalledTimes(2);
  });

  it("removes a subscription and refetches", async () => {
    const mockUser = { id: 1 };
    const initialSubs = [{ id: 1, doctor_id: 1096535518 }];
    const afterRemove = [];

    useAuth.mockReturnValue({ user: mockUser });
    subscriptionRepository.getByUser
      .mockResolvedValueOnce({ data: initialSubs })
      .mockResolvedValueOnce({ data: afterRemove });

    subscriptionRepository.unsubscribe.mockResolvedValue({});

    const { result } = renderHook(() => useUserSubscriptions());

    await waitFor(() => expect(result.current.subscriptions).toEqual(initialSubs));

    await act(async () => {
      await result.current.removeSubscription(1096535518);
    });

    await waitFor(() => expect(result.current.subscriptions).toEqual(afterRemove));

    expect(subscriptionRepository.unsubscribe).toHaveBeenCalledWith(1);
    expect(subscriptionRepository.getByUser).toHaveBeenCalledTimes(2);
  });

  it("does nothing if trying to remove non-existent subscription", async () => {
    const mockUser = { id: 1 };
    const initialSubs = [{ id: 1, doctor_id: 1096535518 }];

    useAuth.mockReturnValue({ user: mockUser });
    subscriptionRepository.getByUser.mockResolvedValue({ data: initialSubs });

    const { result } = renderHook(() => useUserSubscriptions());

    await waitFor(() => expect(result.current.subscriptions).toEqual(initialSubs));

    await act(async () => {
      await result.current.removeSubscription(999);
    });

    expect(result.current.subscriptions).toEqual(initialSubs);
    expect(subscriptionRepository.unsubscribe).not.toHaveBeenCalled();
  });
});
