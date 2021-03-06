
import './request.scss';
import { useState, useEffect } from 'react';
import { Input2 } from '../utils/myReactLib';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import RequestView from '../requestView/requestView';
import RequestView2 from '../requestView/requestView2';
import MyRequests from './myrequest';
import axios from 'axios';
import History from './history';
import All from './all'


export default function Request({ setErr, ou, role }) {

    const [data, setData] = useState(null);
    const { path } = useRouteMatch();
    const [request, setRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refresh, setRefresh] = useState(true);
    const [requesttype, setRequestType] = useState('myrequests');
    const [requestNumber, setRequestNumber] = useState(0);



    useEffect(() => {

        const url = "/api/my-approvals";
        axios.get(url, { withCredentials: true })
            .then((data) => {
                setData(data.data);
            })
            .catch(err => {
                console.error(err);
                setErr(err.response !== undefined ? err.response.data.error : err);
            });


    }, [refresh, setErr])

    return (
        <Switch>
            <Route exact path={path}>
                <div className="request">
                    <div className="request_header">

                        <h6 className="request_header_title">All requests</h6>
                    </div>
                    <div className="request_type">
                        <h6 className={requesttype === 'myrequests' ? "request_type_title active" : "request_type_title "}
                            onClick={() => {
                                setRequestType('myrequests')
                                // history.push("/requests")
                            }
                            }>Pending</h6>
                        <h6 className={requesttype === 'history' ? "request_type_title active" : "request_type_title"}
                            onClick={() => {
                                setRequestType('history')
                                // history.push("requests/history")
                            }}>History</h6>
                        <h6 className={requesttype === 'all' ? "request_type_title active" : "request_type_title"}
                            onClick={() => {
                                setRequestType('all')
                                // history.push("requests/all")
                            }}>All</h6>
                    </div>
                    <div className="request_sub">
                        {requesttype === 'myrequests' ? <h6 className="request_sub_title">You have {requestNumber} request</h6> : null}
                        {requesttype === 'history' ? <h6 className="request_sub_title">You have processed {requestNumber} request</h6> : null}
                        {requesttype === 'all' ? <h6 className="request_sub_title">Total requests submitted {requestNumber}</h6> : null}


                        <Input2 className="request_sub_input" placeholder="Search for requests" onChange={(e) => setSearchTerm(e.target.value)} />

                    </div>
                    {requesttype === "history" ? <History data={data} setRefresh={setRefresh} role={role} setRequestNumber={setRequestNumber} setRequest={setRequest} searchTerm={searchTerm} setErr={setErr} ouid={ou.ouId} /> : null}
                    {requesttype === "myrequests" ? <MyRequests setRefresh={setRefresh} data={data} role={role} setRequestNumber={setRequestNumber} setRequest={setRequest} searchTerm={searchTerm} setErr={setErr} ouid={ou.ouId} /> : null}
                    {requesttype === "all" ? <All data={data} setRefresh={setRefresh} setRequestNumber={setRequestNumber} role={role} setRequest={setRequest} searchTerm={searchTerm} setErr={setErr} ouid={ou.ouId} /> : null}
                    {/* <Table headers={header} data={data} type='request' setRequest={setRequest} searchTerm={searchTerm} /> */}


                </div>
            </Route>
            <Route path={path + '/:id'} >
                <RequestView switchUrl={false} req={request} key="1" edit={false} setRefresh={setRefresh} refresh={refresh} showButton={true} setErr={setErr} readProtect={true} ou={ou} />
            </Route>
            <Route path={path + '/:id/edit'} exact>
                <RequestView2 req={request} edit={false} setRefresh={setRefresh} refresh={refresh} showButton={true} setErr={setErr} readProtect={`${false}`} ou={ou} />
            </Route>
            <Route path={path + '/history/:id'} exact>
                <RequestView switchUrl={false} req={request} key="60" edit={false} setRefresh={setRefresh} refresh={refresh} showButton={false} setErr={setErr} readProtect={true} ou={ou} />
            </Route>
            <Route path={path + '/all/:id'} exact>
                <RequestView switchUrl={false} req={request} key="399" edit={false} setRefresh={setRefresh} refresh={refresh} showButton={false} setErr={setErr} readProtect={true} ou={ou} />
            </Route>
        </Switch>

    )
}

