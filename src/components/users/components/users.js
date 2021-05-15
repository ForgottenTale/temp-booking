import './admin.scss';
import { Input2 } from '../../utils/myReactLib';
import Table from '../../table/table';
import { useState, useEffect } from 'react';
import axios from 'axios';


export default function Admin({ setUser,ouId }) {
    const header = ['Id', "Name", "Email", "Role", ""];
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        const source = axios.CancelToken.source();
        const url = "/api/users?role=user&ouId="+ouId;

        const loadData = async () => {
            try {
                const res = await axios.get(url, {
                    withCredentials: true,
                    cancelToken: source.token
                })
                if (res.status === 200) {
                    setData(res.data);
                    console.log(res.data)
                }



            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Cancelled")
                }
                console.log(error)
            };
        }
        loadData();


        return () => {
            source.cancel();
        };

    }, [ouId])
    return (
        <div className="admin">
            <div className="admin_sub">
                <Input2 className="admin_sub_input" placeholder="Search for users" onChange={(e) => setSearchTerm(e.target.value)} />


            </div>
            <Table path="user" headers={header} data={data} type='user' setUser={setUser} searchTerm={searchTerm} />

        </div>
    )
}