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


  const addSubscription = async (doctorId) => {
    try {
      setState((s) => ({ ...s, loading: true }));
      await subscriptionRepository.subscribe(doctorId);

      const response = await subscriptionRepository.getByUser();
      setState({ subscriptions: response.data, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, loading: false }));
      throw error;
    }
  };

  const removeSubscription = async (doctorId) => {
    try {
      setState((s) => ({ ...s, loading: true }));

      const subscription = state.subscriptions.find(
        (sub) => parseInt(sub.doctor_id) === doctorId
      );
      if (!subscription) return;

      await subscriptionRepository.unsubscribe(subscription.id);

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
