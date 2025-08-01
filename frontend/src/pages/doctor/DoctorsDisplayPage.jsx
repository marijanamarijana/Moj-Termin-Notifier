import React from "react";
import useDoctors from "../../hooks/useDoctors";
import DoctorCard from "../../components/doctor/DoctorCard";
import DoctorForm from "../../components/doctor/DoctorAddForm";
import Spinner from "react-bootstrap/Spinner";
import 'bootstrap/dist/css/bootstrap.min.css';

const DoctorList = () => {
  const { doctors, loading, onAdd } = useDoctors();

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">Available Doctors</h2>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <div className="row">
          {doctors.map((doctor) => (
            <div className="col-md-4 mb-4" key={doctor.id}>
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>
      )}

      <hr />
      <DoctorForm onAdd={onAdd} />
    </div>
  );
};

export default DoctorList;
