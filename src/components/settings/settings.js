
import './settings.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import pic from '../../images/pic3.jpg';


function Item({ name, userDetails, setUserDetails,type,handleSave }) {
    const [disabled, setDisabled] = useState(false)
    return (<div className="settings_con_itemCon">
        <div className="settings_con_itemCon_item">
            <p>{name}</p>
            <input
                value={userDetails[type]}
                onChange={(e) =>
                    setUserDetails({ ...userDetails,[type]: e.target.value })
                } 
                disabled={!disabled}
                
                />
        </div>
        {disabled ?
            <button onClick={() => {
                handleSave()
                setDisabled(false)}}>
                Save
             </button>
            : <button onClick={() => setDisabled(true)}>
                Edit
               </button>
        }


    </div>)
}

export default function Setting({ setErr }) {

    const [refresh, setRefresh] = useState(true);
    const [userDetails, setUserDetails] = useState({
        name: null,
        email: null,
        phone: null,
    });
    const [password, setPassword] = useState(null)

    useEffect(() => {

        const url = "/api/credentials/"
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
        const url = "/api/user ";
        axios.patch(url, formData, { headers: headers, withCredentials: true })
            .then((data) => {
                console.log(data);
                setRefresh(!refresh);
            })
            .catch(err => {
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
        const url = "/api/user ";
        axios.patch(url, formData, { headers: headers, withCredentials: true })
            .then((data) => {
                console.log(data);
                setRefresh(!refresh);
            })
            .catch(err => {
                console.error(err);
                setErr(err.response.data.error);
            });

    }



    return (
        <div className="settings">
            <div className="settings_con">


                <h5>User Profile</h5>
                <div className="settings_con_img">
                    <img src={pic} alt="user" />
                    <button>
                        Change
                   </button>
                </div>


                <Item name="Name" userDetails={userDetails} setUserDetails={setUserDetails} type="name" handleSave={handleSave()}/>
                <Item name="Email" userDetails={userDetails} setUserDetails={setUserDetails} type="email"  handleSave={handleSave()}/>
                <Item name="Phone No" userDetails={userDetails} setUserDetails={setUserDetails} type="phone"  handleSave={handleSave()}/>

                <button onClick={() => handleSave()}>Save</button>
                <h5>Set a new Password</h5>
                <div className="settings_con_itemCon">
                    <div className="settings_con_itemCon_item">
                        <p>New Password</p>
                        <input />
                    </div>
                    <div className="settings_con_itemCon_item">
                        <p>Re-enter Password</p>
                        <input onChange={(e) => setPassword(e.target.value)} />
                    </div>

                </div>
                <button onClick={() => handlePasswordSave()} >Save</button>
            </div>
        </div>
    );
}