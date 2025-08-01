import axiosInstance from "../axios/axios.js";

const subscriptionRepository = {
    subscribe: async (doctor_id) => {
        return await axiosInstance.post(`/subscriptions/subscribe/${doctor_id}`)
    },

    getByUser: async () => {
        return await axiosInstance.get(`/subscriptions/user/me`)
    },

    unsubscribe: async (sub_id) => {
        return await axiosInstance.delete(`/subscriptions/unsubscribe/${sub_id}`)
    },
};
export default subscriptionRepository;