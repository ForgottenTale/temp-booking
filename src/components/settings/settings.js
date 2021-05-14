
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
                setDisabled(false)}}>
               Cancel
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
    const [confirmPassword, setConfirmPassword] = useState(null)

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
        formData.append('email', userDetails.email);
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
        if(confirmPassword===password){
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
      
        else{
            setErr("Password doesn't match")
        }
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


                <Item name="Name" userDetails={userDetails} setUserDetails={setUserDetails} type="name" />
                <Item name="Email" userDetails={userDetails} setUserDetails={setUserDetails} type="email"  />
                <Item name="Phone No" userDetails={userDetails} setUserDetails={setUserDetails} type="phone" />

                <button className="save" onClick={() => handleSave()}>Save</button>
                <h5>Set a new Password</h5>
                <div className="settings_con_itemCon">
                    <div className="settings_con_itemCon_item">
                        <p>New Password</p>
                        <input onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    

                </div>
                <div className="settings_con_itemCon">
                 
                    <div className="settings_con_itemCon_item">
                        <p>Re-enter Password</p>
                        <input onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>

                </div>
                <button className="save" onClick={() => handlePasswordSave()} >Save</button>
            </div>
        </div>
    );
}