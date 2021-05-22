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



export default function RequestView({ req, setRefresh, refresh, showButton, setErr, readProtect, ou, edit, switchUrl }) {

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
    const { params,path } = useRouteMatch();
    const history = useHistory();
    const [msg, setMsg] = useState("");
    console.log(path)


    useEffect(() => {

        setReadOnly(readProtect);

    }, [readProtect])

    useEffect(() => {
        if (ou !== undefined && ou.ouId !== undefined) {
            if (req !== undefined && req !== null) {
                setData(req);
            }
            else {
                var url = ""
                if (switchUrl) {
                    url = "/api/bookings?ouId=" + ou.ouId;
                }
                else {
                    url = `/api/approvals/${params.id}?ouId=${ou.ouId}`;
                }

                axios.get(url, { withCredentials: true })
                    .then((d) => {
                        setData(d.data[0]);
                    })
                    .catch(err => {
                        console.error(err);
                        setErr(err.response.data.error);
                    });
            }
        }

        // eslint-disable-next-line
    }, [req, ou])

    const handleSave = () => {

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
            const url = `/api/bookings/${data.id}?ouId=${ou.ouId}`;
            await axios.patch(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true

            });

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
                    <Item title="Organisational Unit" value={data.ouName} key="1" name="title" setData={setData} readOnly />
                    <Item title="Created at" value={new Date(data.createdAt).toLocaleString()} key="40" name="title" setData={setData} readOnly={readOnly} />
                    <ItemTextArea title="Description" readOnly={readOnly} value={data.description} name="description" />
                    <Item title="Title" value={data.title} key="41" name="title" setData={setData} readOnly={readOnly} />


                    {data.type === "online_meeting" || data.type === "intern_support" ? [
                        <ItemTime name="startTime" title="Start Time" value={data.startTime} key="3" readOnly={readOnly} setData={setData} />,
                        <ItemTime name="endTime" title="End Time" value={data.endTime} key="4" readOnly={readOnly} setData={setData} />,
                    ] : [
                        <ItemDate title="Date" value={data.publishTime} key="52" readOnly={readOnly} setData={setData} />,
                        <ItemDate title="Remainder" value={data.reminder} key="51" readOnly={readOnly} setData={setData} />,]}
                   
                    {data.type === "online_meeting" ?
                        [
                            <ItemDate title="Date" value={data.startTime} key="2" readOnly={readOnly} setData={setData} />,
                            data.coHosts !== null ? JSON.parse(data.coHosts).map((cohost, index) =>

                                [
                                    <Item title={`Co-host ${String(index + 1)}`} value={cohost[0]} key="5" readOnly={readOnly} setData={setData} />,
                                    <Item title={`Co-host ${String(index + 1)} email`} value={cohost[1]} key="6" readOnly={readOnly} setData={setData} />
                                ]
                            ) : null,
                            <Item title="Speaker" value={data.speakerName} name="speakerName" key="7" readOnly={readOnly} setData={setData} />,
                            <Item title="Speaker Email" value={data.speakerEmail} name="speakerEmail" key="8" readOnly={readOnly} setData={setData} />,


                        ] : [

                            <Item title="Comments" value={data.comments} key="11" name="comments" readOnly={readOnly} setData={setData} />
                        ]
                    }




                    {data.type === "intern_support" ? <Item title="Purpose" value={data.purpose} name="purpose" readOnly={readOnly} /> : null}
                    {data.serviceName === "content writing" ? <Item title="Word Count" value={data.wordsCount} name="wordCount" readOnly={readOnly} /> : null}
                    {data.serviceName === "poster design" ? <Item title="Poster Diamensions" value={data.dimensions} name="diamensions" readOnly={readOnly} /> : null}
                    {data.serviceName === "website development" ? <Item title="URL" readOnly={readOnly} value={data.url} name="url" /> : null}
                    {data.type === "e_notice" ? <Item title="Delivery Type" value={data.express===1?"Express":"Normal"} name="deliveryType" readOnly={readOnly} /> : null}
                    {data.type === "publicity" ? [
                        <Item title="Program Schedule" value={data.schedule} key="12" name="schedule" readOnly={readOnly} />,
                        <Item title="Publish Time" value={new Date(data.publishTime).toLocaleTimeString()} key="13" name="publishTime" readOnly={readOnly} />] : null
                    }



                </div >
                <div className="requestView_con">

                    <div className="requestView_con_item">
                        <h4>Endorsements</h4>
                    </div>
                    <div className="requestView_con_item">
                        <h4>{""}</h4>
                    </div>

                    {data.otherResponses.length > 0 ?
                        data.otherResponses.map((approver, index) =>
                            <ItemTextArea key={index} title={`${approver.name} @ ${new Date(approver.createdAt).toLocaleString()}`} value={approver.response === null ? "" : approver.response} readOnly />) :
                        <Item title="" value="No one has endorsed this request" key="14" readOnly />
                    }



                </div>
                {data.status === "APPROVED" && data.type === "online_meeting" ?

                    <div className="requestView_con2">
                        <h6>
                            <span>Meeting URL : </span>
                            {data.meetingUrl === "WILL BE UPDATED" ? data.meetingUrl : <a href={data.meetingUrl}>{data.meetingUrl}</a>}</h6>
                        <h6><span>Meeting Id : </span>{data.meetingId}</h6>
                        <h6><span>Meeting Password : </span>{data.meetingPassword}</h6>
                    </div>
                    : null}

                {data.img !== null ? <img src={"/image/" + data.img} alt='poster' /> : null}
                {showButton && data.status !== "APPROVED" && data.status !== "DECLINED" ?
                    <div className="requestView_button">
                        <button onClick={() => {
                            setMessage(true)
                            setMsg("approve")
                        }}>Approve</button>
                        <button onClick={() => {
                            setMessage(true)
                            setMsg("decline")
                        }
                        }>Reject</button>
                    </div> : null

                }
                {!readOnly ? <div className="requestView_button"><button onClick={() => {
                    setReadOnly(true);
                    handleSave();
                    history.push(`/requests/${params.id}`)
                }}>Save</button> </div> : null

                }

                {message ? <Message ouId={ou.ouId} msg2={msg} setMessage={setMessage} setRefresh={setRefresh} setSpinner={setSpinner} refresh={refresh} data={data} setErr={setErr} /> : null}
            </div >
            : null
    );
}
