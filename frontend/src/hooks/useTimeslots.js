import {useEffect, useState} from "react";
import timeslotRepository from "../repository/timeslotRepository.js";

const initialState = {
    "slots": [],
    "loading": true,
};

const useTimeslots = (doc_id) => {
    const [state, setState] = useState(initialState);

    useEffect(() => {
        timeslotRepository
            .getByDoctor(doc_id)
            .then((response) => {
                setState({
                    "slots": response.data,
                    "loading": false,
                });
            })
    }, [doc_id]);

    return state;
};

export default useTimeslots;