import { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../table/table';



export default function MyRequests({ setErr, ouid, setRequest, searchTerm, setRequestNumber }) {

    const [data, setData] = useState([]);
    const header = ['Id', "Name", "Service", "Type", "Time", "Status", "Action"];


    useEffect(() => {
        if (ouid !== undefined && ouid !== null) {
            const url = "/api/bookings?ouId=" + ouid;
            axios.get(url, { withCredentials: true })
                .then((data) => {
                    setData(data.data);
                    setRequestNumber(data.data.length)
                })
                .catch(err => {
                    console.error(err);
                    setErr(err.response !== undefined ? err.response.data.error : err);
                });
        }

    }, [ouid])


    return (
        <div className="history">
            <Table headers={header} data={data} type='request' setRequest={setRequest} searchTerm={searchTerm} />

        </div>
    );
}