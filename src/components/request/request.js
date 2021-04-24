
import './request.scss';
import { useState, useEffect } from 'react';
import Table from '../table/table';
import { Input2 } from '../utils/myReactLib';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import RequestView from '../requestView/requestView';
import axios from 'axios';


export default function Request({ role, setErr}) {


    const [data, setData] = useState(null);
    const header = ['Id', "Name", "Service", "Type", "Time", "Status", "Action"];
    const { path } = useRouteMatch();
    const [request, setRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refresh, setRefresh] = useState(true);


    useEffect(() => {

        const url = "/api/my-approvals";
        axios.get(url, { withCredentials: true })
            .then((data) => {
                setData(data.data);
            })
            .catch(err =>{
                console.error(err);
                setErr(err.response.data.error);
            });

    // eslint-disable-next-line
    }, [refresh])

    return (
        <Switch>
            <Route exact path={path}>
                <div className="request">
                    <div className="request_header">

                       <h6 className="request_header_title">All requests</h6> 
                    </div>
                    <div className="request_sub">
                        <h6 className="request_sub_title">You have {data !== null && data !== undefined ? data.length : 0} request</h6>

                        <Input2 className="request_sub_input" placeholder="Search for requests" onChange={(e) => setSearchTerm(e.target.value)} />

                    </div>

                    <Table headers={header} data={data} type='request' setRequest={setRequest} searchTerm={searchTerm} />


                </div>
            </Route>
            <Route path={path + '/:id'}>
                <RequestView req={request} setRefresh={setRefresh} refresh={refresh} showButton={true} setErr={setErr}/>
            </Route>
        </Switch>

    )
}

