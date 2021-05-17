import './topNav.scss';
import userPic from '../../images/profile.png';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'


export default function TopNav({ activeComponent, setUser, setOU, ou, user,setAuth,setErr }) {


    const [options, setOptions] = useState([])
    const [selectedOU,setSelectedOU ] = useState({})
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: '#fff',
            borderColor: '#9e9e9e',
            minHeight: '30px',
            height: '30px',
            boxShadow: state.isFocused ? null : null,
        }),

        valueContainer: (provided, state) => ({
            ...provided,
            height: '30px',
            padding: '0 6px'
        }),

        input: (provided, state) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: state => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: '30px',
        }),
    };
    const handlelogOut = () => {
        const load = async () => {

            try {
                await axios.get("/api/logout", { withCredentials: true });
                setUser({ id: null, name: null, role: null, email: null })
                setAuth(false)
            } catch (error) {
                console.log(error)
                setErr(error)
            }
        }

        load();
    }



    useEffect(() => {


        if (user.ou !== undefined && user.ou !== null && user.ou.length > 0) {
            var temp = user.ou.map((item) => {
                return { "value": item.ouName, "label": item.ouName }
            })
            setSelectedOU({ "value": ou.ouName, "label": ou.ouName })
            setOptions(temp)
        }

    }, [user.ou, ou]);


    const handleChange = (e) => {
        var temp = user.ou.filter((item) => {
                return item.ouName === e.value?item:null
        })


        setOU(temp[0])
    }
    return (
        <div className="topNav">
            <div className="topNav_title">
                <div className="topNav_title_con">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-clipboard"
                    viewBox="0 0 24 24"
                >
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                </svg>
                <h3>{activeComponent}</h3>
                </div>
                <button onClick={
                    () => handlelogOut()

                }>Logout</button>
            </div>
            <div className="topNav_icons">
                <div className="topNav_select">
                    <Select
                        value={selectedOU}
                        options={options}
                        onChange={(e) => {
                            handleChange(e)
                        }}
                        styles={customStyles} />

                </div>

                <button onClick={
                    () => handlelogOut()

                }>Logout</button>

                <img src={userPic} alt="profile-pic" />
            </div>

        </div>
    );
}