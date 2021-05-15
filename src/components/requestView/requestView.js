import './requestView.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Spinner from '../spinner/spinner';
import Message from './components/message';
import { useRouteMatch, useHistory } from 'react-router-dom';
import ItemTime from './ItemTime';
import ItemTextArea from './ItemTextArea';
import Item from './Item';
import ItemDate from './ItemDate';



export default function RequestView({ req, setRefresh, refresh, showButton, setErr, readProtect, ou }) {

    const [spinner, setSpinner] = useState(false);
    const [data, setData] = useState({
        id: "",
        startTime: "",
        endTime: "",
        title: "",
        speakerName: "",
        speakerEmail: "",
        coHosts: JSON.stringify([["", ""]]),
        type: "",
        serviceName: "",
        description: "",
        deliveryType: "",
        remainder: "",
        comments: "",
        purpose: "",
        dimensions: "",
        wordsCount: "",
        url: "",
        schedule: "",
        img: "",
    })
    const [message, setMessage] = useState(false);
    const [readOnly, setReadOnly] = useState(readProtect)
    const { params } = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        // if (ou.id !== undefined) {
            if (req !== undefined && req !== null) {
                setData(req);
            }
            else {
                const url = `/api/approvals/${params.id}?ouId=${ou.ouId}`;
                axios.get(url, { withCredentials: true })
                    .then((d) => {
                        setData(d.data[0]);
                    })
                    .catch(err => {
                        console.error(err);
                        setErr(err.response.data.error);
                    });
            }
        // }

        // eslint-disable-next-line
    }, [req, ou])

    const handleSave = () => {
        console.log(data);
        const keys = Object.keys(data);
        const values = Object.values(data);
        const formData = new FormData();
        const length = keys.length;

        for (let i = 0; i < length; i++) {
            formData.append(keys[i], values[i]);
        }

        handleUpload(formData);

        console.log(Array.from(formData));
    };

    const handleUpload = async (data) => {
        try {
            const url = "/api/book/";
            const res = await axios.post(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true

            });
            console.log(res)
        } catch (err) {
            console.error(err);
            setErr(err.response.data.error);
        }
    };

    var list = ["Name", "Email", "Phone", "Service", "Service Type"];
    var resList = ["name", "email", "phone", "type", "serviceName"]

    return (
        (data !== null && data !== undefined && data !== {} && data.type !== undefined && data.id !== "") ?
            <div className="requestView">
                {spinner ? <Spinner /> : null}
                <div className="requestView_con">

                    {list.map((item, key) =>
                        <Item readOnly title={item} value={data[resList[key]].replace('_', ' ')} key={key} />,
                    )}

                    <ItemTextArea title="Description" value={data.description} name="description" />


                    {data.type === "online_meeting" ?
                        [
                            <Item title="Title" value={data.title} key="1" name="title" setData={setData} readOnly={readOnly} />,
                            <ItemDate title="Date" value={data.startTime} key="2" readOnly={readOnly} setData={setData} />,
                            <ItemTime name="startTime" title="Start Time" value={data.startTime} key="3" readOnly={readOnly} setData={setData} />,
                            <ItemTime name="endTime" title="End Time" value={data.endTime} key="4" readOnly={readOnly} setData={setData} />,

                            data.coHosts !== null ? JSON.parse(data.coHosts).map((cohost, index) =>

                                [
                                    <Item title={`Co-host ${String(index + 1)}`} value={cohost[0]} key="5" readOnly={readOnly} setData={setData} />,
                                    <Item title={`Co-host ${String(index + 1)} email`} value={cohost[1]} key="6" readOnly={readOnly} setData={setData} />,
                                ]
                            ) : null,
                            <Item title="Speaker" value={data.speakerName} name="speakerName" key="7" readOnly={readOnly} setData={setData} />,
                            <Item title="Speaker Email" value={data.speakerEmail} name="speakerEmail" key="8" readOnly={readOnly} setData={setData} />,


                        ] : [
                            <ItemDate title="Date" value={data.startTime} key="9" readOnly={readOnly} setData={setData} />,
                            <ItemTime title="Time" value={data.startTime} key="10" readOnly={readOnly} setData={setData} />,
                            <Item title="Comments" value={data.comments} key="11" name="comments" readOnly={readOnly} setData={setData} />
                        ]
                    }


                    {data.type === "intern_support" ? <Item title="Purpose" value={data.purpose} name="purpose" readOnly={readOnly} /> : null}
                    {data.serviceName === "content writing" ? <Item title="Word Count" value={data.wordsCount} name="wordCount" readOnly={readOnly} /> : null}
                    {data.serviceName === "poster design" ? <Item title="Poster Diamensions" value={data.diamensions} name="diamensions" readOnly={readOnly} /> : null}
                    {data.serviceName === "website development" ? <Item title="URL" value={data.url} name="url" /> : null}
                    {data.type === "e_notice" ? <Item title="Delivery Type" value={data.deliveryType} name="deliveryType" readOnly={readOnly} /> : null}
                    {data.type === "publicity" ? [
                        <Item title="Program Schedule" value={data.schedule} key="12" name="schedule" readOnly={readOnly} />,
                        <Item title="Publish Time" value={new Date(data.publishTime).toLocaleTimeString()} key="13" name="publishTime" readOnly={readOnly} />] : null
                    }

                    <div className="requestView_con_item">
                        <h4>Endorsements</h4>
                    </div>
                    <div className="requestView_con_item">
                        <h4>{""}</h4>
                    </div>

                    {data.otherResponses.length > 0 ?
                        data.otherResponses.map((approver, index) =>
                            <ItemTextArea key={index} title={approver.name} value={approver.response === null ? "" : approver.response} readOnly />) :
                        <Item title="" value="No one has endorsed this request" key="14" readOnly />
                    }

                </div >
                {data.img !== null ? <img src={"/image/" + data.img} alt='poster' /> : null}

                {showButton && data.status !== "APPROVED" ? <div className="requestView_button">
                    <button onClick={() => setMessage(true)}>Approve</button>
                    <button onClick={() => setMessage(true)}>Reject</button>

                    {readOnly ? null : <button onClick={() => {
                        setReadOnly(true);
                        handleSave();
                        history.push(`/requests/${params.id}`)
                    }}>Save</button>}
                </div> : data.status !== "APPROVED" ?
                    <div className="requestView_button">

                        {readOnly ?
                            <>
                                <button onClick={() => {
                                    setReadOnly(false)
                                    history.push(`${params.id}/edit`)
                                }}>Edit</button>
                                <button onClick={() => setReadOnly(true)}>Cancel</button>
                            </>
                            : <button onClick={() => { setReadOnly(false); }}>Save</button>}
                    </div> : null
                }
                {message ? <Message setMessage={setMessage} setRefresh={setRefresh} setSpinner={setSpinner} refresh={refresh} data={data} setErr={setErr} /> : null}
            </div >
            : null
    );
}
