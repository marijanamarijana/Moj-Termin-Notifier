import axiosInstance from "../axios/axios.js";

const subscriptionRepository = {
    subscribe: async () => {
        return await axiosInstance.post(`/subscriptions/subscribe`)
    },

    getByUser: async (user_id) => {
        return await axiosInstance.get(`/subscriptions/${user_id}`)
    },

    unsubscribe: async (sub_id) => {
        return await axiosInstance.delete(`/subscriptions/unsubscribe/${sub_id}`)
    },
};
export default subscriptionRepository;