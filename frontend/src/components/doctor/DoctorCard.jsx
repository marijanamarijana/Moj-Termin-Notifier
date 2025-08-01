import React from "react";
import { Card } from "react-bootstrap";
import {Link} from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title>{doctor.full_name}</Card.Title>
        {/*<Card.Subtitle className="mb-2 text-muted">{doctor.label}</Card.Subtitle>*/}
        <Card.Text>
          ID: {doctor.id}
        </Card.Text>
          <Link to={`/doctors/${doctor.id}/slots`} className="btn btn-primary">
        See Available Dates
      </Link>
      </Card.Body>
    </Card>
  );
};

export default DoctorCard;
