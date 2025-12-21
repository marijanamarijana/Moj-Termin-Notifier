import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../axios/axios";
import subscriptionRepository from "../../repository/subscriptionRepository";

describe("subscriptionRepository", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.reset();
  });

  it("subscribes to a doctor", async () => {
      const responseData = {
          "id": 17,
          "user_id": 8,
          "doctor_id": 1096535518
        }
    mock.onPost("/subscriptions/subscribe/1096535518").reply(200, responseData);

    const response = await subscriptionRepository.subscribe(1096535518);

  expect(response.status).toBe(200);
  expect(response.data).toEqual(responseData);
  });

  it("gets subscriptions by user", async () => {
    const mockData = [{
        "id": 14,
        "user_id": 8,
        "doctor_id": 816473126
      },
      {
        "id": 15,
        "user_id": 8,
        "doctor_id": 891281366
      },
      {
        "id": 16,
        "user_id": 8,
        "doctor_id": 3919513121
      }];
    mock.onGet("/subscriptions/user/me").reply(200, mockData);

    const response = await subscriptionRepository.getByUser();

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

   it("gets subscriptions by user empty list", async () => {
    const mockData = [];
    mock.onGet("/subscriptions/user/me").reply(200, mockData);

    const response = await subscriptionRepository.getByUser();

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

   it("handles network error on subscribe", async () => {
  mock.onPost("/subscriptions/subscribe/1096535518").networkError();

  await expect(
    subscriptionRepository.subscribe(1096535518)
  ).rejects.toBeDefined();
});

  it("unsubscribes from a doctor", async () => {
    mock.onDelete("/subscriptions/unsubscribe/17").reply(200, {message: "Subscription deleted"});

    const response = await subscriptionRepository.unsubscribe(17);

    expect(response.status).toBe(200);
  });

  it("fails to unsubscribe non-existent subscription", async () => {
  mock.onDelete("/subscriptions/unsubscribe/999").reply(404);

  await expect(
    subscriptionRepository.unsubscribe(999)
  ).rejects.toMatchObject({
    response: { status: 404 },
  });
});

});

