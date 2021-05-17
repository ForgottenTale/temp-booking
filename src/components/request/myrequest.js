import { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../table/table';



export default function MyRequests({ setErr, ouid, setRequest, searchTerm, setRequestNumber,role,setRefresh }) {

    const [data, setData] = useState([]);
    const header = ['Id', "Name", "OU", "Type", "Time", "Status", "Action"];


    useEffect(() => {
        if (ouid !== undefined && ouid !== null) {
            const url = `/api/approvals?ouId=${ouid}&filter=pending`;
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

    }, [ouid,setRequestNumber,setErr])


    return (
        <div className="history">
            <Table setRefresh={setRefresh} role={role} setErr={setErr} ouId={ouid} headers={header} data={data} edit={false} type='request' setRequest={setRequest} searchTerm={searchTerm} path="/requests"/>

        </div>
    );
}