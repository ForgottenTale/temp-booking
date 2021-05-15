import { useHistory } from "react-router-dom";
import './message.scss';
import { useState } from 'react';
import axios from 'axios';

export default function Message({ setMessage, setRefresh, data, setSpinner, refresh, setErr,ouId }) {

    const [msg, setMsg] = useState("");
    const history = useHistory();

    const handleLogin = async (action) => {

        setSpinner(true);
        const formData = new URLSearchParams();
        // formData.append('id', data.id);
        formData.append('action', action);
        formData.append('response', msg);
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }

            const url = `/api/approvals/${data.id}?ouId=${ouId}`;
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
                <button onClick={() => setMessage(false)}>Cancel</button>
            </div>


        </div>
    );
}