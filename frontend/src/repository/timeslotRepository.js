import axiosInstance from "../axios/axios.js";

const timeslotRepository = {
    getByDoctor: async (doc_id) => {
        return await axiosInstance.get(`/timeslots/doctor/${doc_id}`);
    },
};
export default timeslotRepository;
