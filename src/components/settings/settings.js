
import './settings.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Setting({setErr}) {

    const [refresh, setRefresh] = useState(true);
    const [userDetails, setUserDetails] = useState({
        name: null,
        email: null,
        phone: null,
    });
    const [password, setPassword] = useState(null)

    useEffect(() => {

        const url = "http://localhost:5000/api/credentials/"
        axios.get(url, { withCredentials: true })
            .then((data) => {
                if (data.status === 200)
                    return data.data

            })
            .then(userInfo => {
                setUserDetails({
                    name: userInfo.name,
                    phone: userInfo.phone,
                    email: userInfo.email
                })
            })
            .catch(err => {
                console.error(err);
                setErr(err.response.data.error);
            });

    // eslint-disable-next-line
    }, [refresh]);

    const handleSave = () => {
        const formData = new URLSearchParams();
        formData.append('name', userDetails.name);
        // formData.append('email', userDetails.email);
        formData.append('phone', userDetails.phone);
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        const url = "http://localhost:5000/api/user ";
        axios.patch(url, formData, { headers: headers, withCredentials: true })
            .then((data) => {
                console.log(data);
                setRefresh(!refresh);
            })
            .catch(err =>{
                console.error(err);
                setErr(err.response.data.error);
            });

    }
    const handlePasswordSave = () => {
        const formData = new URLSearchParams();
        formData.append('password', password);
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        const url = "http://localhost:5000/api/user ";
        axios.patch(url, formData, { headers: headers, withCredentials: true })
            .then((data) => {
                console.log(data);
                setRefresh(!refresh);
            })
            .catch(err =>{
                console.error(err);
                setErr(err.response.data.error);
            });

    }

    return (
        <div className="settings">
            <h5>User Profile</h5>
            <div className="settings_con">
                <div className="settings_con_item">
                    <p>Name</p>
                    <input placeholder={userDetails.name} onChange={(e) =>
                        setUserDetails({ ...userDetails, name: e.target.value })
                    } />
                </div>
                {/* <div className="settings_con_item">
                    <p>Email Id</p>
                    <input placeholder={userDetails.email} onChange={(e) =>
                        setUserDetails({ ...userDetails, email: e.target.value })
                    } />
                </div> */}


            </div>
            <div className="settings_con">
                <div className="settings_con_item">
                    <p>Phone No</p>
                    <input placeholder={userDetails.phone} onChange={(e) =>
                        setUserDetails({ ...userDetails, phone: e.target.value })
                    } />
                </div>

            </div>
            <button onClick={() => handleSave()}>Save</button>
            <h5>Set a new Password</h5>
            <div className="settings_con">

                <div className="settings_con_item">
                    <p>New Password</p>
                    <input />
                </div>
                <div className="settings_con_item">
                    <p>Re-enter Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} />
                </div>

            </div>
            <button onClick={() => handlePasswordSave()} >Save</button>
        </div>
    );
}