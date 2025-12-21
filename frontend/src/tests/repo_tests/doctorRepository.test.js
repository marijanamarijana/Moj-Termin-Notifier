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
    });

    it("returns no doctors for all doctors", async () => {
      mock.onGet("/doctors/all").reply(200, []);

      const response = await doctorRepository.findAll();

      expect(response.data).toEqual([]);
    });

    it("handles server error for all doctors", async () => {
      mock.onGet("/doctors/all").reply(500);

      await expect(doctorRepository.findAll()).rejects.toMatchObject({
        response: { status: 500 },
      });
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
    });

    it("throws 404 if doctor does not exist", async () => {
      mock.onGet("/doctors/999").reply(404, {
        message: "Doctor not found",
      });

      await expect(doctorRepository.findById(999)).rejects.toMatchObject({
        response: {
          status: 404,
          data: { message: "Doctor not found" },
        },
      });
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
  });
});
