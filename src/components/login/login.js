import './login.scss';
import pic from '../../images/login.jpg';
import { useState } from 'react';
import axios from 'axios';

export default function Login(props) {
    // const [user, setUser] = useState(props);
    const [details, setDetails] = useState({
        username: null,
        password: null
    });


    const handleLogin = async () => {

        const formData = new URLSearchParams();
        formData.append('username', details.username);
        formData.append('password', details.password);
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
              }
          
            const url = "http://localhost:5000/api/login/"
            axios.post(url,formData,{headers:headers})
            .then((res)=>{
                if(res.status===200){
                    // setUser({
                    //     id: res.data.id,
                    //     name: res.data.name,
                    //     role: res.data.role,
                    //     email: res.data.email
                    //   })
                    window.location.replace("/dashboard");
                }
            })
            .catch(err=>{
                console.error(err.response || err);
                props.setErr(err.response.data.error);
            })
    }

    const handleChange = (e) => {
        const values = details;
        e.preventDefault();
        values[e.target.name] = e.target.value;
        setDetails(values);

    }
    return (
        <div className="login">

            <div className="login_container">
                <div className="login_container_box">
                    <h4 className="login_container_box_title">Login</h4>
                    <p className="login_container_box_des">Login to your account</p>
                    <label className="login_container_box_label">Email</label>
                    <input className="login_container_box_input" name="username" type="email" onChange={(e) => handleChange(e)} />
                    <label className="login_container_box_label">Password</label>
                    <input className="login_container_box_input" name="password" type="Password" onChange={(e) => handleChange(e)} />
                    <div className="login_container_box_options">

                        <div className="login_container_box_options_checkbox">
                            <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike"></input>
                            &nbsp;
                            <label>Remember me</label>


                        </div>
                        <p>Forgot password ?</p>
                    </div>
                    <button className="login_container_box_button" onClick={()=>handleLogin()}>Login</button>
                </div>

            </div>
            <img className="login_img" alt='' src={pic} />
        </div>
    );
}