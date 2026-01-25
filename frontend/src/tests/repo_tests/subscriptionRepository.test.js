import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../axios/axios";
import subscriptionRepository from "../../repository/subscriptionRepository";
import timeslotRepository from "../../repository/timeslotRepository.js";

describe("subscriptionRepository", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
     mock.restore();
  });
  describe("subscribe", () => {
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
          expect(mock.history.post).toHaveLength(1);
          expect(mock.history.post[0].url).toBe("/subscriptions/subscribe/1096535518");
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
          expect(mock.history.get[0].url).toBe("/subscriptions/user/me");
      });

      it("returns empty list when user has no subscriptions", async () => {
          const mockData = [];
          mock.onGet("/subscriptions/user/me").reply(200, mockData);

          const response = await subscriptionRepository.getByUser();

          expect(response.status).toBe(200);
          expect(response.data).toEqual(mockData);
          expect(mock.history.get[0].url).toBe("/subscriptions/user/me");
      });

      it("handles network error on subscribe", async () => {
          mock.onPost("/subscriptions/subscribe/1096535518").networkError();

          await expect(
              subscriptionRepository.subscribe(1096535518)
          ).rejects.toBeDefined();
      });

      it("handles network timeout on subscribe", async () => {
          mock.onPost("/subscriptions/subscribe/1096535518").timeout();
          await expect(timeslotRepository.getByDoctor(1096535518)).rejects.toBeDefined();
      });

      it("handles server error (500) on subscribe", async () => {
          mock.onPost("/subscriptions/subscribe/1").reply(500);

          await expect(
            subscriptionRepository.subscribe(1)
          ).rejects.toMatchObject({
            response: { status: 500 },
          });
    });

    it("fails when doctor_id is null on subscribe", async () => {
      mock.onPost("/subscriptions/subscribe/null").reply(400);

      await expect(
        subscriptionRepository.subscribe(null)
      ).rejects.toBeDefined();
    });

    it("fails when doctor_id is undefined on subscribe", async () => {
      mock.onPost("/subscriptions/subscribe/undefined").reply(400);

      await expect(
        subscriptionRepository.subscribe(undefined)
      ).rejects.toBeDefined();
    });

    it("handles invalid doctor_id types on subscribe", async () => {
      mock.onPost("/subscriptions/subscribe/abc").reply(400);
      mock.onPost("/subscriptions/subscribe/-1").reply(400);

      await expect(subscriptionRepository.subscribe("abc")).rejects.toBeDefined();
      await expect(subscriptionRepository.subscribe(-1)).rejects.toBeDefined();
    });

    it("handles server error on getByUser on subscribe", async () => {
      mock.onGet("/subscriptions/user/me").reply(500);

      await expect(
        subscriptionRepository.getByUser()
      ).rejects.toMatchObject({
        response: { status: 500 },
      });
    });

    it("handles network timeout on subscribe", async () => {
      mock.onPost("/subscriptions/subscribe/10").timeout();

      await expect(subscriptionRepository.subscribe(10)).rejects.toBeDefined();
    });

    it("handles concurrency: two subscribe calls simultaneously", async () => {
      const responseData1 = { id: 20, user_id: 8, doctor_id: 101 };
      const responseData2 = { id: 21, user_id: 8, doctor_id: 102 };

      mock.onPost("/subscriptions/subscribe/101").reply(200, responseData1);
      mock.onPost("/subscriptions/subscribe/102").reply(200, responseData2);

      const [res1, res2] = await Promise.all([
        subscriptionRepository.subscribe(101),
        subscriptionRepository.subscribe(102)
      ]);

      expect(res1.data).toEqual(responseData1);
      expect(res2.data).toEqual(responseData2);
    });
  });

  describe("unsubscribe", () => {
      it("successfully unsubscribes from a doctor", async () => {
            mock.onDelete("/subscriptions/unsubscribe/17").reply(200, {message: "Subscription deleted"});

            const response = await subscriptionRepository.unsubscribe(17);

            expect(response.status).toBe(200);
      });

      it("fails to unsubscribe from non-existent subscription", async () => {
            mock.onDelete("/subscriptions/unsubscribe/999").reply(404);

            await expect(
                subscriptionRepository.unsubscribe(999)
            ).rejects.toMatchObject({
                response: {status: 404},
            });
      });

      it("handles server error on unsubscribe (500)", async () => {
          mock.onDelete("/subscriptions/unsubscribe/1").reply(500);

          await expect(
            subscriptionRepository.unsubscribe(1)
          ).rejects.toBeDefined();
      });

      it("handles invalid sub_id types on unsubscribe", async () => {
          mock.onDelete("/subscriptions/unsubscribe/abc").reply(400);
          await expect(subscriptionRepository.unsubscribe("abc")).rejects.toBeDefined();
          await expect(subscriptionRepository.unsubscribe(-1)).rejects.toBeDefined();
          await expect(subscriptionRepository.unsubscribe(null)).rejects.toBeDefined();
          await expect(subscriptionRepository.unsubscribe(undefined)).rejects.toBeDefined();
      });

      it("handles concurrency: two unsubscribe calls simultaneously", async () => {
          const responseData1 = { message: "Subscription 101 deleted" };
          const responseData2 = { message: "Subscription 102 deleted" };

          mock.onDelete("/subscriptions/unsubscribe/101").reply(200, responseData1);
          mock.onDelete("/subscriptions/unsubscribe/102").reply(200, responseData2);

          const [res1, res2] = await Promise.all([
            subscriptionRepository.unsubscribe(101),
            subscriptionRepository.unsubscribe(102)
          ]);

          expect(res1.data).toEqual(responseData1);
          expect(res2.data).toEqual(responseData2);
      });
  });
});

