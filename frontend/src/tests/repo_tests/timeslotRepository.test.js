import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../axios/axios";
import timeslotRepository from "../../repository/timeslotRepository";

describe("timeslotRepository", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.reset();
  });

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
  });

    it("gets timeslots by doctor success empty list", async () => {
    const mockData = [];

    mock.onGet("/timeslots/doctor/3783958400").reply(200, mockData);

    const response = await timeslotRepository.getByDoctor(3783958400);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

    it("handles server error", async () => {
  mock.onGet("/timeslots/doctor/3783958400").reply(500);

  await expect(
    timeslotRepository.getByDoctor(3783958400)
  ).rejects.toMatchObject({
    response: { status: 500 },
  });
});

    it("returns 400 for invalid doctor id", async () => {
  mock.onGet("/timeslots/doctor/abc").reply(400);

  await expect(
    timeslotRepository.getByDoctor("abc")
  ).rejects.toMatchObject({
    response: { status: 400 },
  });
});



});
