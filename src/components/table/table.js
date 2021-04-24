import './table.scss';
import pic from '../../images/pic3.jpg';
import { NavLink, useRouteMatch } from 'react-router-dom';
import SkeletonRowRequest from '../skeleton/skeletonRowRequest';
import SkeletonRowUser from '../skeleton/skeletonRowUser';


export default function Table({ headers, data, type, setUser, setRequest, searchTerm }) {



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
                            }).map((data, key) => <Row key={key} data={data} type={type} setUser={setUser} setRequest={setRequest} />
                            )

                            : (type === "user" || type === "admin" ? [1, 2, 3, 5, 6, 7, 8].map((key) => <SkeletonRowUser key={key} />) : data !== [] && [1, 2, 3, 5, 6, 7, 8].map((key) => <SkeletonRowRequest key={key} />))
                    }
                </tbody>
            </table>

        </div>
    )
}


function Row({ data, type, setRequest, setUser }) {
    const { path } = useRouteMatch();
    return (



        <tr>

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
                <td data-label="Time" key="3">{new Date(data.startTime).toDateString()}</td>,
                <td data-label="Status" key="4">
                    <p >
                        {data.status.toLowerCase()}
                    </p>
                </td>,
            ] : null}

            <td>
                {type === 'request' ?
                    <NavLink to={path + "/" + data.id} onClick={() => setRequest(data)}>View</NavLink>
                    : <NavLink to={path + '/user/' + data.id} onClick={() => setUser(data)}>View</NavLink>}

            </td>
        </tr>


    );
}
// 

