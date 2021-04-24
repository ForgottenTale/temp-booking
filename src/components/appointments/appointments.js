import './appointments.scss';
import {useState} from 'react';
import ServiceSelection from '../New Appointment/App';


var data = [
    { name: "Webinar", date: "13/02/2021", time: "3pm - 5pm IST", agent: "Alan Mathew", status: "Pending" },
    { name: "Webinar", date: "13/02/2021", time: "6pm - 5pm IST", agent: "Alan Mathew", status: "Pending" },
    { name: "Webinar", date: "13/02/2021", time: "3pm - 6pm IST", agent: "Alan Mathew", status: "Pending" },
    { name: "Webinar", date: "13/02/2021", time: "6pm - 7pm IST", agent: "Alan Mathew", status: "Pending" },
]


function Appointment({ data }) {
    return (
        <div className="appointment">
            <p className="appointment_title">{data.name}</p>
            <div className="appointment_details">
                <div className="appointment_details_date">
                    <p className="appointment_details_date_title">Date</p>
                    <p className="appointment_details_date_value">{data.date}</p>
                </div>
                <div className="appointment_details_date">
                    <p className="appointment_details_date_title">Time</p>
                    <p className="appointment_details_date_value">{data.time}</p>
                </div>
                <div className="appointment_details_date">
                    <p className="appointment_details_date_title">Agent</p>
                    <p className="appointment_details_date_value">{data.agent}</p>
                </div>
                <div className="appointment_details_date">
                    <p className="appointment_details_date_title">Status</p>
                    <p className="appointment_details_date_value">{data.status}</p>
                </div>

            </div>
          <div className="appointment_buttons">
              <button>Cancel</button>
          </div>

        </div>
    );
}

export default function Appointments() {

    const [pop,setPop] =useState(false);

    return (
        <div className="appointments">
            {pop?<ServiceSelection setPop={setPop} pop={pop}/>:null}
            <div className="appointments_header">
                <h6 className="appointments_header_title">My Appointments</h6>
                <button className="appointments_header_button" onClick={()=>{setPop(true)}}>+ New Appointment</button>
            </div>
            <div className="appointments_items">
                {data.map((data) => <Appointment data={data} key={data.time} />)}
            </div>

        </div>
    );
}