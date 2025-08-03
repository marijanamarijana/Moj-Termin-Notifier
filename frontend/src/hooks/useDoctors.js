import {useCallback, useEffect, useState} from "react";
import doctorRepository from "../repository/doctorRepository.js";

const initialState = {
    "doctors": [],
    "loading": true,
};

const useDoctors = () => {
    const [state, setState] = useState(initialState);

    const fetchDoctors = useCallback(() => {
        setState(initialState);
        doctorRepository
            .findAll()
            .then((response) => {
                setState({
                    "doctors": response.data,
                    "loading": false,
                });
            })
    }, []);

    const onAdd = useCallback((data) => {
        console.log(data)
        doctorRepository
            .add(data)
            .then(() => {
                fetchDoctors();
            })
    }, [fetchDoctors]);

    useEffect(() => {
    fetchDoctors();
    }, [fetchDoctors]);

    return {...state, onAdd: onAdd};
};

export default useDoctors;
