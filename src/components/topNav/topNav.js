import './topNav.scss';
import userPic from '../../images/profile.png';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select'


export default function TopNav({ activeComponent, setUser, setOU, ou, user,setAuth }) {

    const history = useHistory();
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
            }
        }

        load();
    }



    useEffect(() => {


        if (user.ou !== undefined && user.ou !== null && user.ou.length > 1) {
            var temp = user.ou.map((item) => {
                return { "value": item.name, "label": item.name }
            })
            setSelectedOU({ "value": ou.name, "label": ou.name })
            setOptions(temp)
        }
        console.log(ou);
    }, [user.ou, ou]);


    const handleChange = (e) => {
        var temp = user.ou.filter((item) => {
            console.log()
            
                return item.name === e.value?item:null
        })


        setOU(temp[0])
    }
    return (
        <div className="topNav">
            <div className="topNav_title">
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
            <div className="topNav_icons">
                {/* <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-bell"
                            viewBox="0 0 24 24"
                        >
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"></path>
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-settings"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                        </svg> */}
                <div className="topNav_select">
                    <Select
                        value={selectedOU}
                        options={options}
                        onChange={(e) => {
                            console.log(e.value)
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