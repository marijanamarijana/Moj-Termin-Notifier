// import { useState, useEffect } from "react";
// import subscriptionRepository from "../repository/subscriptionRepository";
// import {useAuth} from "../auth/AuthContext.jsx";
//
// const initialState = {
//     "subscriptions" : [],
//     "loading" : true,
// }
// const useUserSubscriptions = () => {
//     const { user } = useAuth();
//     const [state, setState] = useState(initialState)
//
//     useEffect(() => {
//       if (!user) return;
//
//       subscriptionRepository.
//       getByUser()
//           .then((response) => {
//               setState({
//                   "subscriptions" : response.data,
//                   "loading" : false,
//               })
//           })
//   }, [user]);
//
//   return state;
// };
//
// export default useUserSubscriptions;

import { useState, useEffect } from "react";
import subscriptionRepository from "../repository/subscriptionRepository";
import { useAuth } from "../auth/AuthContext.jsx";

const initialState = {
  subscriptions: [],
  loading: true,
};

const useUserSubscriptions = () => {
  const { user } = useAuth();
  const [state, setState] = useState(initialState);

  // Fetch subscriptions when user changes
  useEffect(() => {
    if (!user) {
      setState({ subscriptions: [], loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    subscriptionRepository
      .getByUser()
      .then((response) => {
        setState({ subscriptions: response.data, loading: false });
      })
      .catch(() => {
        setState({ subscriptions: [], loading: false });
      });
  }, [user]);

  // Add subscription for a doctor
  const addSubscription = async (doctorId) => {
    try {
      setState((s) => ({ ...s, loading: true }));
      await subscriptionRepository.subscribe(doctorId);
      // Refetch or append new subscription (simplified: just refetch)
      const response = await subscriptionRepository.getByUser();
      setState({ subscriptions: response.data, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, loading: false }));
      throw error;
    }
  };

  // Remove subscription for a doctor
  const removeSubscription = async (doctorId) => {
    try {
      setState((s) => ({ ...s, loading: true }));
      // Find subscription ID by doctorId
      const subscription = state.subscriptions.find(
        (sub) => parseInt(sub.doctor_id) === doctorId
      );
      if (!subscription) return;

      await subscriptionRepository.unsubscribe(subscription.id);

      // Refetch or remove subscription from state
      const response = await subscriptionRepository.getByUser();
      setState({ subscriptions: response.data, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, loading: false }));
      throw error;
    }
  };

  return {
    subscriptions: state.subscriptions,
    loading: state.loading,
    addSubscription,
    removeSubscription,
  };
};

export default useUserSubscriptions;
