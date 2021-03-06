import './adminDashboard.scss';
import { useState, useEffect } from 'react';
import Table from '../table/table';
import { Input2 } from '../utils/myReactLib';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import RequestView from '../requestView/requestView';
import RequestView2 from '../requestView/requestView2';
import axios from 'axios';
import ServiceSelection from '../New Appointment/App';

export default function AdminDashboard({ role, setErr,user ,ou}) {
    const [data, setData] = useState(null);
    const header = ['Id', "Name", "OU", "Type", "Time", "Status", "Action"];
    const { path } = useRouteMatch();
    const [request, setRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refresh, setRefresh] = useState(true);
    const [pop, setPop] = useState(false);
    const [values, setValues] = useState({
        approved: 0,
        denied: 0,
        pending: 0,
        total: 0
    })

    useEffect(() => {
        var url = ""
       if(ou.ouId!==undefined){ url = `/api/activity?ouId=${ou.ouId}`;
        axios.get(url, { withCredentials: true })
            .then((data) => {

                setValues({
                    approved: (data.data.approved !== undefined ? data.data.approved : 0),
                    denied: (data.data.declined !== undefined ? data.data.declined : 0),
                    pending: (data.data.pending !== undefined ? data.data.pending : 0),
                    total: (
                        (data.data.approved !== undefined ? data.data.approved : 0)
                        + (data.data.declined !== undefined ? data.data.declined : 0)
                        + (data.data.pending !== undefined ? data.data.pending : 0)
                    )
                });

            })
            .catch(err => {
                console.error(err);
                setErr(err.response.data.err);
            });}

    }, [role,setErr,refresh,ou]);

    useEffect(()=>{
        if(ou.ouId!==undefined){
           var url = "/api/bookings?ouId="+ou.ouId;
            axios.get(url, { withCredentials: true })
                .then((data) => {
                    if (data.status === 200)
                        setData(data.data);
                })
                .catch(err => {
                    console.error(err)
                    setErr(err.response.data.error);
                });
        }
    },[ou,setErr,refresh])

    return (
        <Switch>

            <Route exact path={path}>
                {pop ? <ServiceSelection setErr={setErr} setRefresh={setRefresh} setPop={setPop} pop={pop} user={user} /> : null}
                <div className="request">
                    <div className="adminDashboard">
                        <div className="adminDashboard_con">
                            <div className="adminDashboard_con_box">
                                <h5>Approved request</h5>
                                <p>{values.approved}</p>
                            </div>
                            <div className="adminDashboard_con_box">
                                <h5>Pending request</h5>
                                <p>{values.pending}</p>
                            </div>
                            <div className="adminDashboard_con_box">
                                <h5>Declined request</h5>
                                <p>{values.denied}</p>
                            </div>
                            <div className="adminDashboard_con_box">
                                <h5>Total request</h5>
                                <p>{values.total}</p>
                            </div>
                        </div>
                    </div>
                    <h6 className="request_sub_title" style={{ margin: 30 }}>My requests</h6>
                    <div className="request_sub">


                        <Input2 className="request_sub_input" placeholder="Search for requests" onChange={(e) => setSearchTerm(e.target.value)} />
                        {/* <button className="button" >+ Book service</button> */}
                    </div>

                    <Table  setRefresh={setRefresh} setErr={setErr} ouId={ou.ouId} headers={header} data={data} path="dashboard" type='request' setRequest={setRequest} searchTerm={searchTerm} edit={false}role={role} />


                </div>
            </Route>
            <Route path={"/dashboard/:id"} exact>
                <RequestView switchUrl={true} req={request} edit={false} ou={ou} setRefresh={setRefresh} refresh={refresh} showButton={false} setErr={setErr} readProtect={true} />
            </Route>
            <Route path={"/dashboard/:id/edit"} exact>
                <RequestView2 req={request} edit={false} ou={ou} setRefresh={setRefresh} refresh={refresh} showButton={false} setErr={setErr} readProtect={false}/>
            </Route>
        </Switch>
    );
}