import React from "react";
import useUserSubscriptions from "../../hooks/useUserSubscription.js";
import useDoctors from "../../hooks/useDoctors.js";
import { Card, Spinner, Alert, Container } from "react-bootstrap";

function MySubscriptions() {
  const { subscriptions, loading } = useUserSubscriptions() || {};
  const { doctors } = useDoctors();

  if (loading || !subscriptions) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading subscriptions...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">My Subscriptions</h2>

      {subscriptions.length === 0 ? (
        <Alert variant="info" className="text-center">
          You have no subscriptions yet.
        </Alert>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {subscriptions.map((sub) => {
            const doctor = doctors.find((d) => d.id === parseInt(sub.doctor_id));
            return (
              <div className="col" key={sub.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{doctor?.full_name ?? "Unknown Doctor"}</Card.Title>
                    <Card.Text>
                      <strong>Id:</strong> {doctor?.id ?? "N/A"}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}

export default MySubscriptions;
