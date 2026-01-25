import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../axios/axios";
import timeslotRepository from "../../repository/timeslotRepository";
import subscriptionRepository from "../../repository/subscriptionRepository.js";

describe("timeslotRepository", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("getByDoctor", () => {
    it("gets timeslots by doctor success", async () => {
      const mockData = [
        {
          id: 16,
          free_slot: "2025-08-04T08:40:00",
          doctor_id: 3783958400
        },
      ];

      mock.onGet("/timeslots/doctor/3783958400").reply(200, mockData);

      const response = await timeslotRepository.getByDoctor(3783958400);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockData);
      expect(mock.history.get[0].url).toBe("/timeslots/doctor/3783958400");
    });

    it("returns empty list when no timeslots exist", async () => {
      const mockData = [];

      mock.onGet("/timeslots/doctor/3783958400").reply(200, mockData);

      const response = await timeslotRepository.getByDoctor(3783958400);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockData);
      expect(mock.history.get[0].url).toBe("/timeslots/doctor/3783958400");
    });

    it("handles server error (500)", async () => {
      mock.onGet("/timeslots/doctor/3783958400").reply(500);

      await expect(
        timeslotRepository.getByDoctor(3783958400)
      ).rejects.toMatchObject({
        response: { status: 500 },});
    });

    it("handles network error", async () => {
       mock.onGet("/timeslots/doctor/3783958400").networkError();

       await expect(
           subscriptionRepository.subscribe(3783958400)
       ).rejects.toBeDefined();
    });

    it("handles network timeout", async () => {
      mock.onGet("/timeslots/doctor/3783958400").timeout();
      await expect(timeslotRepository.getByDoctor(3783958400)).rejects.toBeDefined();
    });

    it("returns 400 for invalid doctor id", async () => {
      mock.onGet("/timeslots/doctor/abc").reply(400);
      mock.onGet("/timeslots/doctor/null").reply(400);
      mock.onGet("/timeslots/doctor/undefined").reply(400);
      mock.onGet("/timeslots/doctor/-1").reply(400);

      await expect(timeslotRepository.getByDoctor("abc")).rejects.toMatchObject({ response: { status: 400 } });
      await expect(timeslotRepository.getByDoctor(null)).rejects.toMatchObject({ response: { status: 400 } });
      await expect(timeslotRepository.getByDoctor(undefined)).rejects.toMatchObject({ response: { status: 400 } });
      await expect(timeslotRepository.getByDoctor(-1)).rejects.toMatchObject({ response: { status: 400 } });
    });

    it("handles concurrency: multiple requests simultaneously", async () => {
      const data1 = [{ id: 1, free_slot: "2025-08-04T09:00:00", doctor_id: 3783958400 }];
      const data2 = [{ id: 2, free_slot: "2025-08-04T10:00:00", doctor_id: 3983958420 }];

      mock.onGet("/timeslots/doctor/3783958400").reply(200, data1);
      mock.onGet("/timeslots/doctor/3983958420").reply(200, data2);

      const [res1, res2] = await Promise.all([
        timeslotRepository.getByDoctor(3783958400),
        timeslotRepository.getByDoctor(3983958420),
      ]);

      expect(res1.data).toEqual(data1);
      expect(res2.data).toEqual(data2);
    });

  });
});
