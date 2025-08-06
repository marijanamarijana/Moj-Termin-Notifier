import { useParams } from "react-router-dom";
import useTimeslots from "../../hooks/useTimeslots.js";
import { format } from 'date-fns';
import useDoctorId from "../../hooks/useDoctorId.js";

function DoctorSlots() {
  const { id } = useParams();
  const { slots, loading } = useTimeslots(id);
  const doc = useDoctorId(parseInt(id));
  console.log(doc)

  const formatDatetimeWithWeekday = (isoString) => {
    return format(new Date(isoString), "EEEE, dd/MM/yyyy HH:mm");
  };

  return (
    <div className="container mt-4">
      <h2>Available Slots for Doctor {doc.full_name} on dates: </h2>

      {loading ? (
        <p>Loading...</p>
      ) : slots.length === 0 ? (
        <p>No available slots.</p>
      ) : (
        <ul className="list-group">
          {slots.map((slot, index) => (
            <li className="list-group-item" key={index}>
              {formatDatetimeWithWeekday(slot.free_slot)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DoctorSlots;