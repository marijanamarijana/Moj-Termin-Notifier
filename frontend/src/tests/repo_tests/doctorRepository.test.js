import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../axios/axios";
import doctorRepository from "../../repository/doctorRepository";

describe("doctorRepository", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("findAll", () => {
    it("returns data for all doctors", async () => {
      const mockData = [
        { full_name: "БОЖИДАР ПОПОСКИ", id: 879157831 },
        { full_name: "Марјан Балоски", id: 891281366 },
      ];

      mock.onGet("/doctors/all").reply(200, mockData);

      const response = await doctorRepository.findAll();

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockData);
      expect(mock.history.get[0].url).toBe("/doctors/all");
    });

    it("returns empty array when no doctors exist", async () => {
      mock.onGet("/doctors/all").reply(200, []);

      const response = await doctorRepository.findAll();

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
      expect(mock.history.get[0].url).toBe("/doctors/all");
    });

    it("handles server error (500)", async () => {
      mock.onGet("/doctors/all").reply(500);

      await expect(doctorRepository.findAll()).rejects.toMatchObject({
        response: { status: 500 },
      });
    });

     it("handles network error", async () => {
      mock.onGet("/doctors/all").networkError();

      await expect(doctorRepository.findAll()).rejects.toBeDefined();
    });

     it("handles network timeout", async () => {
      mock.onGet("/doctors/all").timeout();
      await expect(doctorRepository.findAll()).rejects.toBeDefined();
    });
  });

  describe("findById", () => {
    it("returns doctor by id successfully", async () => {
      const mockDoctor = {
        full_name: "БИЛЈАНА САВИН ИВАНОВСКА",
        id: 1376904131,
      };

      mock.onGet("/doctors/1376904131").reply(200, mockDoctor);

      const response = await doctorRepository.findById(1376904131);

      expect(response.data).toEqual(mockDoctor);
      expect(response.status).toBe(200);
      expect(mock.history.get[0].url).toBe("/doctors/1376904131");
    });

    it("throws 404 if doctor does not exist", async () => {
      mock.onGet("/doctors/999").reply(404, {
        message: "Doctor not found",
      });

      await expect(doctorRepository.findById(999)).rejects.toMatchObject({
        response: {
          status: 404,
          data: {message: "Doctor not found"},
        },
      });
    });

    it("handles network error", async () => {
      mock.onGet("/doctors/999").networkError();

      await expect(doctorRepository.findAll()).rejects.toBeDefined();
    });

     it("handles network timeout", async () => {
      mock.onGet("/doctors/999").timeout();
      await expect(doctorRepository.findAll()).rejects.toBeDefined();
    });

    it("fails gracefully when id is null, undefined, string, negative", async () => {
      mock.onGet("/doctors/null").reply(400);
      mock.onGet("/doctors/undefined").reply(400);
      mock.onGet("/doctors/abc").reply(400);
      mock.onGet("/doctors/-1").reply(400);

      await expect(doctorRepository.findById(null)).rejects.toBeDefined();
      await expect(doctorRepository.findById(undefined)).rejects.toBeDefined();
      await expect(doctorRepository.findById("abc")).rejects.toBeDefined();
      await expect(doctorRepository.findById(-1)).rejects.toBeDefined();
    });

    it("handles concurrency: two findById calls simultaneously", async () => {
      const doctor1 = {full_name: "БИЛЈАНА САВИН ИВАНОВСКА", id: 1376904131};
      const doctor2 = {full_name: "БОЖИДАР ПОПОСКИ", id: 879157831};

      mock.onGet("/doctors/1376904131").reply(200, doctor1);
      mock.onGet("/doctors/879157831").reply(200, doctor2);

      const [res1, res2] = await Promise.all([
        doctorRepository.findById(1376904131),
        doctorRepository.findById(879157831),
      ]);

      expect(res1.data).toEqual(doctor1);
      expect(res2.data).toEqual(doctor2);
    });
  });

  describe("add", () => {
    it("adds a new doctor successfully", async () => {
      const payload = { doctor_id: 1096535518 };

      mock.onPost("/doctors/add", payload).reply(200, {
        full_name: "ВАНЧЕ ТРАЈКОВСКА",
        id: 1096535518,
      });

      const response = await doctorRepository.add(payload);

      expect(response.status).toBe(200);
      expect(mock.history.post[0].url).toBe("/doctors/add");
      expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
    });

    it("fails if doctor already exists", async () => {
      mock.onPost("/doctors/add").reply(409, {
        message: "Doctor already exists!",
      });

      await expect(
        doctorRepository.add({ doctor_id: 1096535518 })
      ).rejects.toMatchObject({
        response: { status: 409 },
      });
    });

    it("handles server error (500) on add", async () => {
      mock.onPost("/doctors/add").reply(500);

      await expect(
        doctorRepository.add({ doctor_id: 1 })
      ).rejects.toBeDefined();
    });

    it("handles network error", async () => {
      mock.onPost("/doctors/add").networkError();

      await expect(doctorRepository.add({ doctor_id: 10 })).rejects.toBeDefined();
    });

    it("handles network timeout", async () => {
      mock.onPost("/doctors/add").timeout();
      await expect(doctorRepository.add({ doctor_id: 10 })).rejects.toBeDefined();
    });

    it("handles concurrency: two add calls simultaneously", async () => {
      const payload1 = { doctor_id: 101 };
      const payload2 = { doctor_id: 102 };

      mock.onPost("/doctors/add", payload1).reply(200, { full_name: "Doctor 101", id: 101 });
      mock.onPost("/doctors/add", payload2).reply(200, { full_name: "Doctor 102", id: 102 });

      const [res1, res2] = await Promise.all([
        doctorRepository.add(payload1),
        doctorRepository.add(payload2),
      ]);

      expect(res1.data.full_name).toBe("Doctor 101");
      expect(res2.data.full_name).toBe("Doctor 102");
    });
  });
});
