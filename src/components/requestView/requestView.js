import './requestView.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Spinner from '../spinner/spinner';
import { useHistory } from "react-router-dom";

export default function RequestView({ req, setRefresh, refresh, showButton, setErr}) {

    const [spinner, setSpinner] = useState(false);
    const [data, setData] = useState({})
    const [message, setMessage] = useState(false);


    useEffect(() => {

        if (req !== undefined && req !== null) {
            setData(req);
        }
        else {
            const url = "http://localhost:5000/api/my-approvals";
            axios.get(url, { withCredentials: true })
                .then((d) => {
                    setData(d.data[0]);
                })
                .catch(err =>{
                    console.error(err);
                    setErr(err.response.data.error);
                });
        }
    // eslint-disable-next-line
    }, [req])




    return (
        (data !== null && data !== undefined && data !== {} && data.type !== undefined) ?
            <div className="requestView">
                {spinner ? <Spinner /> : null}
                <div className="requestView_con">
                    <div className="requestView_con_item">
                        <p>Name</p>
                        <input value={data.name} readOnly/>
                    </div>
                    <div className="requestView_con_item">
                        <p>Email</p>
                        <input value={data.email} readOnly/>
                    </div>


                    <div className="requestView_con_item">
                        <p>Phone No</p>
                        <input value={data.phone} readOnly/>
                    </div>
                    <div className="requestView_con_item">
                        <p>Service</p>
                        <input value={data.type.replace('_', ' ')} readOnly/>
                    </div>

                    <div className="requestView_con_item">
                        <p>Service type</p>
                        <input value={data.serviceName} readOnly/>
                    </div>
                    <div className="requestView_con_item">
                        <p>Desciption</p>
                        <textarea value={data.description} readOnly />
                    </div>

                    {data.type === "online_meeting" ?
                        [

                            <div className="requestView_con_item" key="1">
                                <p>Title</p>
                                <input value={data.title} readOnly />
                            </div>,
                            <div className="requestView_con_item" key="2">
                                <p>Date</p>
                                <input value={new Date(data.startTime).toDateString()} readOnly/>
                            </div>,

                            <div className="requestView_con_item" key="3">
                                <p>Time from </p>
                                <input value={new Date(data.startTime).toLocaleTimeString()} readOnly/>
                            </div>,
                            <div className="requestView_con_item" key="4">
                                <p>Time to</p>
                                <input value={new Date(data.endTime).toLocaleTimeString()} readOnly/>
                            </div>,
                            data.coHosts !== null ? JSON.parse(data.coHosts).map((cohost, index) =>

                                [<div className="requestView_con_item" key="1">
                                    <p>Co-host {index + 1}</p>
                                    <input value={cohost[0]} readOnly/>
                                </div>,
                                <div className="requestView_con_item" key="2">
                                    <p>Co-host {index + 1} email</p>
                                    <input value={cohost[1]} readOnly/>
                                </div>
                                ]
                            ) : null,

                            <div className="requestView_con_item">
                                <p>Speaker</p>
                                <input value={data.speakerName} readOnly/>
                            </div>,
                            <div className="requestView_con_item">
                                <p>Speaker Email</p>
                                <input value={data.speakerEmail} readOnly/>

                            </div>

                        ] : [<div className="requestView_con_item" key="1">
                            <p>Date</p>
                            <input value={data.date} readOnly/>

                        </div>,
                        <div className="requestView_con_item" key="2">
                            <p>Time</p>
                            <input value={data.time} readOnly/>
                        </div>]
                    }


                    {data.service === "Intern support" ? [

                        <div className="requestView_con_item" key="1">
                            <p>Purpose</p>
                            <input value={data.purpose} readOnly/>
                        </div>,
                        <div className="requestView_con_item" key="2">
                            <p>Comments</p>
                            <textarea value={data.comments} readOnly/>
                        </div>


                    ] : null

                    }
                    {data.type === "Content Writing" ? 
                        <div className="requestView_con_item">
                            <p>Word Count</p>
                            <input value={data.wordCount} readOnly/>
                        </div>
                     : null}

                    {data.type === "Poster Design" ? 
                        <div className="requestView_con_item">
                            <p>Poster Diamensions</p>
                            <input value={data.diamensions} readOnly />
                        </div>
                    : null}

                    {data.type === "Website development" ? 
                        <div className="requestView_con_item">
                            <p>URL</p>
                            <input value={data.url} readOnly />
                        </div>
                    : null}

                    {data.service === "e_notice" ? [
                        <div className="requestView_con_item" key="1">
                            <p>Comments</p>
                            <input value={data.comments} readOnly />
                        </div>,
                        <div className="requestView_con_item" key="2">
                            <p>Delivery Type</p>
                            <input value={data.deliveryType} readOnly />
                        </div>,

                    ] : null}


                    {data.service === "Publicity" ? [
                        <div className="requestView_con_item" key="1">
                            <p>Comments</p>
                            <input value={data.comments} readOnly />
                        </div>,
                        <div className="requestView_con_item" key="2">
                            <p>Program Schedule</p>
                            <input value={data.schedule} readOnly />
                        </div>,

                    ] : null}

                    <div className="requestView_con_item">
                        <h4>Endorsements</h4>
                    </div>
                    <div className="requestView_con_item">
                        <h4></h4>
                    </div>

                    {data.otherResponses !== [] ?


                        data.otherResponses.map((approver, index) =>

                            <div key={index} className="requestView_con_item">
                                <p>{approver.name}</p>
                                <textarea value={approver.response} readOnly />
                            </div>



                        ) : <div className="requestView_con_item">
                            <input value={"No one has endorsed this request"} />
                        </div>}

                </div>
                {data.img !== null ? <img src={"/image/" + data.img} alt='poster' /> : null}

                {showButton ? <div className="requestView_button">
                    <button onClick={() => setMessage(true)}>Approve</button>
                    <button onClick={() => setMessage(true)}>Reject</button>
                </div> : null}

                {message ? <Message setMessage={setMessage} setRefresh={setRefresh} setSpinner={setSpinner} refresh={refresh} data={data} /> : null}
            </div >
            : null
    );
}

function Message({ setMessage, setRefresh, data, setSpinner, refresh }) {

    const [msg, setMsg] = useState("");
    const history = useHistory();

    const handleLogin = async (action) => {

        setSpinner(true);
        const formData = new URLSearchParams();
        formData.append('id', data.id);
        formData.append('action', action);
        formData.append('response', "This is just a test dffhasdifhpadohfpoasjdfoiasdhfio");
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }

            const url = "http://localhost:5000/api/my-approvals/"
            await axios.post(url, formData, { headers: headers, withCredentials: true });
            setRefresh(!refresh);
            setSpinner(false);
            history.push("/requests")


        } catch (err) {
            console.error(err);
            setErr(err.response.data.error);
            setSpinner(false);
        }
    }

    return (
        <div className="message">
            <div className="message_overlay" onClick={() => setMessage(false)}>
            </div>
            <div className="message_box">
                <p className="message_box_name">
                    Enter your response
                </p>
                <textarea placeholder="Enter your responses" defaultValue={msg} onChange={(e) => setMsg(e.target.value)} />
                <button onClick={() => handleLogin('approve')}>Submit</button>
                <button onClick={() => handleLogin('decline')}>Cancel</button>
            </div>


        </div>
    );
}