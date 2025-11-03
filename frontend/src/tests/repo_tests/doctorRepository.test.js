import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../axios/axios";
import doctorRepository from "../../repository/doctorRepository";

describe("doctorRepository", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.reset();
  });

  it("fetches all doctors success", async () => {
    const mockData = [{
    "full_name": "БОЖИДАР ПОПОСКИ",
    "id": 879157831
  },
  {
    "full_name": "Марјан Балоски",
    "id": 891281366
  },
  {
    "full_name": "БИЛЈАНА САВИН ИВАНОВСКА",
    "id": 1376904131
  }];
    mock.onGet("/doctors/all").reply(200, mockData);

    const response = await doctorRepository.findAll();

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

    it("fetches all doctors success empty list", async () => {
    const mockData = [];
    mock.onGet("/doctors/all").reply(200, mockData);

    const response = await doctorRepository.findAll();

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

  it("get doctor by id success", async () => {
    const mockData =   {
    "full_name": "БИЛЈАНА САВИН ИВАНОВСКА",
    "id": 1376904131
  };
    mock.onGet("/doctors/1376904131").reply(200, mockData);

    const response = await doctorRepository.findById(1376904131);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

  // check this test if it's needed
    it("get doctor by id non existent", async () => {
       mock.onGet("/doctors/999").reply(404, { message: "Doctor not found" });

    try {
      await doctorRepository.findById(999);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data).toEqual({ message: "Doctor not found" });
    }
  });

  it("add a new doctor success", async () => {
    const newDoctor = { "doctor_id": 1096535518 };
    const mockResponse = {
        "full_name": "ВАНЧЕ ТРАЈКОВСКА",
        "id": 1096535518

    };
    mock.onPost("/doctors/add").reply(200, mockResponse);

    const response = await doctorRepository.add(newDoctor);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockResponse);
  });

  it("add a new doctor already existing", async () => {
    mock.onPost("/doctors/add").reply(409, {message: "Doctor already exists!"});

    try {
      await doctorRepository.add(1096535518);
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data).toEqual({ message: "Doctor already exists!" });
    }
  });

   it("add a new doctor non existent id", async () => {
    mock.onPost("/doctors/add").reply(404, {message: "Doctor not found or API blocked"});

    try {
      await doctorRepository.add(999);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data).toEqual({ message: "Doctor not found or API blocked" });
    }
  });

});
