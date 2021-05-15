import './admin.scss';
import { Input2 } from '../../utils/myReactLib';
import { useState, useEffect } from 'react';
import Table from '../../table/table';

import axios from 'axios';
export default function Admin({ setUser,ouId  }) {
    const [searchTerm, setSearchTerm] = useState("");

    const header = ['Id', "Name", "Email", "Role", ""];
    const [data,setData] = useState(null);
    useEffect(() => {
        if(ouId!==undefined){
            const url = "/api/users?role=admin&ouId="+ouId;
            axios.get(url, { withCredentials: true })
                .then((d) => {
                    setData(d.data);
                })
                .catch(err => console.error(err));
    
        }
       

    }, [ouId])
    return (
        <div className="admin">
            <div className="admin_sub">
                <Input2 className="admin_sub_input" placeholder="Search for admins" onChange={(e) => setSearchTerm(e.target.value)} />

            </div>
            <Table headers={header} data={data} type='admin' setUser={setUser} searchTerm={searchTerm} />
        </div>
    )
}