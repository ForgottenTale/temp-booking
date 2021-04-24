import './requestView.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Spinner from '../spinner/spinner';
import { useHistory } from "react-router-dom";

export default function RequestView({ req, setRefresh, refresh, showButton }) {

    const [spinner, setSpinner] = useState(false);
    const history = useHistory();
    const [data, setData] = useState({})

    useEffect(() => {

        if (req !== undefined&&req!==null) {
            setData(req);
        }
        else {
            const url = "http://localhost:5000/api/my-approvals";
            axios.get(url, { withCredentials: true })
                .then((d) => {
                    setData(d.data[0]);
                })
                .catch(err => console.error(err));
        }

    }, [req])



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
            console.log(err);
            setSpinner(false);
        }
    }
    return (
       ( data !== null && data !== undefined && data !== {} && data.type !== undefined )?
            <div className="requestView">
                {spinner ? <Spinner /> : null}
                <div className="requestView_con">
                    <div className="requestView_con_item">
                        <p>Name</p>
                        <input value={data.name} />
                    </div>
                    <div className="requestView_con_item">
                        <p>Email</p>
                        <input value={data.email} />
                    </div>


                    <div className="requestView_con_item">
                        <p>Phone No</p>
                        <input value={data.phone} />
                    </div>
                    <div className="requestView_con_item">
                        <p>Service</p>
                        <input value={data.type.replace('_', ' ')} />
                    </div>

                    <div className="requestView_con_item">
                        <p>Service type</p>
                        <input value={data.serviceName} />
                    </div>
                    <div className="requestView_con_item">
                        <p>Desciption</p>
                        <textarea >{data.description}</textarea>
                    </div>

                    {data.type === "online_meeting" ?
                        [

                            <div className="requestView_con_item">
                                <p>Title</p>
                                <input value={data.title} />
                            </div>,
                            <div className="requestView_con_item">
                                <p>Date</p>
                                <input value={new Date(data.startTime).toDateString()} />
                            </div>,

                            <div className="requestView_con_item">
                                <p>Time from </p>
                                <input value={new Date(data.startTime).toLocaleTimeString()} />
                            </div>,
                            <div className="requestView_con_item">
                                <p>Time to</p>
                                <input value={new Date(data.endTime).toLocaleTimeString()} />
                            </div>,
                            data.coHosts !== [] ? JSON.parse(data.coHosts).map((cohost, index) =>

                                [<div className="requestView_con_item">
                                    <p>Co-host {index + 1}</p>
                                    <input value={cohost[0]} />
                                </div>,
                                <div className="requestView_con_item">
                                    <p>Co-host {index + 1} email</p>
                                    <input value={cohost[1]} />
                                </div>
                                ]
                            ) : null,

                            <div className="requestView_con_item">
                                <p>Speaker</p>
                                <input value={data.speakerName} />
                            </div>,
                            <div className="requestView_con_item">
                                <p>Speaker Email</p>
                                <input value={data.speakerEmail} />

                            </div>

                        ] : [<div className="requestView_con_item">
                            <p>Date</p>
                            <input value={data.date} />

                        </div>,
                        <div className="requestView_con_item">
                            <p>Time</p>
                            <input value={data.time} />
                        </div>]
                    }


                    {data.service === "Intern support" ? [

                        <div className="requestView_con_item">
                            <p>Purpose</p>
                            <input value={data.purpose} />
                        </div>,
                        <div className="requestView_con_item">
                            <p>Comments</p>
                            <textarea >{data.comments}</textarea>
                        </div>


                    ] : null

                    }
                    {data.type === "Content Writing" ? [
                        <div className="requestView_con_item">
                            <p>Word Count</p>
                            <input value={data.wordCount} />
                        </div>
                    ] : null}

                    {data.type === "Poster Design" ? [
                        <div className="requestView_con_item">
                            <p>Poster Diamensions</p>
                            <input value={data.diamensions} />
                        </div>
                    ] : null}

                    {data.type === "Website development" ? [
                        <div className="requestView_con_item">
                            <p>URL</p>
                            <input value={data.url} />
                        </div>
                    ] : null}

                    {data.service === "e_notice" ? [
                        <div className="requestView_con_item">
                            <p>Comments</p>
                            <input value={data.comments} />
                        </div>,
                        <div className="requestView_con_item">
                            <p>Delivery Type</p>
                            <input value={data.deliveryType} />
                        </div>,

                    ] : null}


                    {data.service === "Publicity" ? [
                        <div className="requestView_con_item">
                            <p>Comments</p>
                            <input value={data.comments} />
                        </div>,
                        <div className="requestView_con_item">
                            <p>Program Schedule</p>
                            <input value={data.schedule} />
                        </div>,

                    ] : null}
                    {data.responses !== undefined ? data.responses.map((approver, index) =>

                        [<div className="requestView_con_item">
                            <p>{approver.name}</p>
                            <textarea >{approver.des}</textarea>
                        </div>,
                        ]
                    ) : <div className="requestView_con_item">
                        <p>Endorsement</p>
                        <input value={"No one has endorsed this request"} />
                    </div>}


                </div>
                {data.img !== null ? <img src={"/image/"+data.img} alt='poster' /> : null}



                {showButton ? <div className="requestView_button">
                    <button onClick={() => handleLogin('approve')}>Approve</button>
                    <button onClick={() => handleLogin('decline')}>Reject</button>
                </div> : null}
            </div >
            : null
    );
}