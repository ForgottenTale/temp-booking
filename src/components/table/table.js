import './table.scss';
import pic from '../../images/pic3.jpg';
import { NavLink } from 'react-router-dom';
import SkeletonRowRequest from '../skeleton/skeletonRowRequest';
import SkeletonRowUser from '../skeleton/skeletonRowUser';
import { useState } from 'react';
import Modal from '../modal/modal';
import axios from 'axios';


export default function Table({ setRefresh, setErr, headers, data, type, setUser, setRequest, searchTerm, path, edit, ouId, role }) {

    return (
        <div className="tableTag">

            <table>

                <tbody>
                    <tr>
                        {headers.map((header, key) => <th key={key}>{header}</th>)}
                    </tr>


                    {
                        (data !== null && data.length >= 0) ?
                            data.filter((val) => {
                                if (searchTerm === "") {
                                    return val;
                                }
                                else if (
                                    val.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    || val.type.toLowerCase().includes(searchTerm.toLowerCase())
                                    || new Date(val.startTime).toDateString().toLowerCase().includes(searchTerm.toLowerCase())
                                    || val.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
                                    || val.id.toString().includes(searchTerm)
                                ) {
                                    return val;
                                }
                                else {
                                    return null
                                }
                            }).map((data, key) => <Row setRefresh={setRefresh} setErr={setErr} role={role} ouId={ouId} edit={edit} path={path} key={key} data={data} type={type} setUser={setUser} setRequest={setRequest} />
                            )

                            : (type === "user" || type === "admin" ? [1, 2, 3, 5, 6, 7, 8].map((key) => <SkeletonRowUser key={key} />) :
                                data !== null && data.length > 0 ? [1, 2, 3, 5, 6, 7, 8].map((key) => <SkeletonRowRequest key={key} />) : null)
                    }
                </tbody>
            </table>

        </div>
    )
}



function Row({ setRefresh, data, type, setRequest, setUser, path, edit, ouId, role, setErr }) {

    const [cancel, setCancel] = useState(false);
    const [del, setDel] = useState(false);


    const handleCancel = () => {
        const url = `api/bookings/${data.id}?ouId=${ouId}&cancel=true`;

        axios.delete(url, { withCredentials: true })
            .then((data) => {
                if (data.status === 200) {
                    setCancel(false)
                    setRefresh((prevState) => !prevState);
                }
            }).catch((err) => {
                console.log(err);
                setErr(err.response !== undefined ? err.response.data : err)
            })
    }


    const handleDelete = () => {
        const url = `api/bookings/${data.id}?ouId=${ouId}`;

        axios.delete(url, { withCredentials: true })
            .then((data) => {
                if (data.status === 200) {
                    setRefresh((prevState) => !prevState);
                    setDel(false)
                }
            }).catch((err) => {
                console.log(err);
                setErr(err.response !== undefined ? err.response.data : err)
            })
    }
    return (

        [cancel ? <Modal key="1" title="Are you sure you want to cancel this request" setModal={setCancel} handleSubmit={handleCancel} /> : null,
        del ? <Modal key="2" title="Are you sure you want to cancel this request" setModal={setDel} handleSubmit={handleDelete} /> : null,


        <tr key="3" className={data.encourages === 0 ? "discouraged-row" : (data.encourages === 1 ? "encouraged-row" : "")}>

            <td data-label="id">{data.id}</td>
            <td data-label="Name">
                <div className="tableTag_user">
                    <img src={pic} alt='profile-pic' className="tableTag_user_pic" />
                    <p>
                        {data.name}
                    </p>

                </div>

            </td>
            {type === 'admin' || type === 'user' ? [
                <td data-label="Email" key="1">{data.email}</td>,
                <td data-label="Role" key="2">{data.role.replace('_', " ").toLowerCase()}</td>,] : null}

            {type === 'request' ? [
                <td data-label="Service" key="1">{data.type.replace('_', ' ')}</td>,
                <td data-label="Type" key="2">{data.serviceName}</td>,
                <td data-label="Time" key="3">{data.type === "publicity" || data.type === "e_notice" ? new Date(data.publishTime).toDateString() : new Date(data.startTime).toDateString()}</td>,
                <td data-label="Status" key="4">
                    <p >
                        {data.status.toLowerCase()}
                    </p>
                </td>,
            ] : null}

            <td>
                {type === 'request' ?
                    [

                        <NavLink key='1' to={path + "/" + data.id} onClick={() => setRequest(data)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-eye"
                                viewBox="0 0 24 24"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </NavLink>,
                        edit === true && data.status !== "APPROVED" ? <NavLink key='2' to={`${path}/${data.id}/edit`} onClick={() => setRequest(data)}>
                            <svg
                                key='3'
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-edit"
                                viewBox="0 0 24 24"
                            >
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </NavLink> : null,

                        role === true ? <svg
                            onClick={() => { setCancel(true) }}
                            key='4'
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-x-circle"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M15 9L9 15"></path>
                            <path d="M9 9L15 15"></path>
                        </svg> : null,

                        ouId === 1 && role === true ? <svg
                            onClick={() => { setDel(true) }}
                            key='5'
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-trash-2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 6L5 6 21 6"></path>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            <path d="M10 11L10 17"></path>
                            <path d="M14 11L14 17"></path>
                        </svg> : null

                    ]
                    : <NavLink to={`users/${path}/${data.id}`} onClick={() => setUser(data)}>View</NavLink>}

            </td>
        </tr>]


    );
}


