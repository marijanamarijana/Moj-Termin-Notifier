import React from "react";
import { useAuth } from "../../auth/AuthContext";
import useUserSubscriptions from "../../hooks/useUserSubscription";
import {Link} from "react-router-dom";

function DoctorCard({ doctor }) {
  const { user } = useAuth();
  const { subscriptions, addSubscription, removeSubscription, loading } = useUserSubscriptions();

  if (!doctor) return null;

  const isSubscribed = user && subscriptions?.some(sub => parseInt(sub.doctor_id) === doctor.id);

  const handleSubscribe = async () => {
    if (!loading) {
      await addSubscription(doctor.id);
    }
  };

  const handleUnsubscribe = async () => {
    if (!loading) {
      await removeSubscription(doctor.id);
    }
  };

  return (
    <div className="card shadow-sm mb-3 p-3">
      <h5 className="card-title mb-3">{doctor.full_name}</h5>
      <Link to={`/doctors/${doctor.id}/slots`} className="btn btn-muted btn-outline-dark">
         See Available Dates
       </Link>
      {/*<p className="card-text text-muted">{doctor.id}</p>*/}

      {user && (
        <div className="mt-2">
          {isSubscribed ? (
            <button
              className="btn btn-danger w-100"
              onClick={handleUnsubscribe}
              disabled={loading}
            >
              Unsubscribe
            </button>
          ) : (
            <button
              className="btn btn-primary w-100"
              onClick={handleSubscribe}
              disabled={loading}
            >
              Subscribe
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorCard;
