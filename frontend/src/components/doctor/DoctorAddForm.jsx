import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const DoctorForm = ({ onAdd }) => {
  const [doctor_id, setId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (doctor_id) {
      onAdd({doctor_id});
      setId("");
    }
  };

  return (
  <div className="mt-5 mx-5">
    <h4 className="text-center mb-3">Add a New Doctor</h4>
    <Form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-center align-items-center gap-3">
        <Form.Group controlId="formDoctorID" className=" flex-grow-1" style={{ maxWidth: "300px" }}>
          <Form.Control
            type="text"
            placeholder="Enter doctor's ID"
            value={doctor_id}
            onChange={(e) => setId(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Doctor
        </Button>
      </div>
    </Form>
  </div>
);

};

export default DoctorForm;