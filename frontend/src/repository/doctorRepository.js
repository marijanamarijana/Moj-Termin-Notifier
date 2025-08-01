import axiosInstance from "../axios/axios.js";

const doctorRepository = {
    findById: async (id) => {
        return await axiosInstance.get(`/doctors/${id}`);
    },
    findAll: async () => {
        return await axiosInstance.get(`/doctors/all`);
    },
    add: async (data) => {
        return await axiosInstance.post(`/doctors/add`, data);
    },
};
export default doctorRepository;

