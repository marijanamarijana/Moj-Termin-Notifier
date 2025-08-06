import {useEffect, useState} from "react";
import doctorRepository from "../repository/doctorRepository.js";
const useDoctorId = (id) => {
    const [state, setState] = useState({});

    useEffect(() => {
        doctorRepository
            .findById(id)
            .then((response) => {
                setState(response.data);
            })
    }, [id]);
    return state;
};

export default useDoctorId;