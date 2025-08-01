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
      <h4 className="text-center">Add a New Doctor</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3 w-50 mx-auto" controlId="formDoctorID">
          {/*<Form.Label>Doctor ID</Form.Label>*/}
          <Form.Control
            type="text"
            placeholder="Enter doctor's ID"
            value={doctor_id}
            onChange={(e) => setId(e.target.value)}
          />
        </Form.Group>

        <div className="mx-auto d-flex justify-content-center">
        <Button variant="primary" type="submit">
          Add Doctor
        </Button>
        </div>
      </Form>
    </div>
  );
};

export default DoctorForm;
