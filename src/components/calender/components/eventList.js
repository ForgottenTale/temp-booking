import './eventList.scss';


function Event({ event }) {

    return (
        <div className="eventList_events_event">
            <div className="eventList_events_event_title">{event.title}</div>
            <div className="eventList_events_event_time">{new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}</div>
        </div>
    );
}
function EventsList({ day,setEventList }) {

    return (
        <div className="eventList">
             <div className="eventList_overlay" onClick={()=>setEventList(false)}>
             </div>
             <div className="eventList_con">

             
            <div className="eventList_head">
                <h4 className="eventList_head_date">{day.format("DD MMM,YYYY")}</h4>
                <svg
                onClick={()=>setEventList(false)}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-x"
                    viewBox="0 0 24 24"
                >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6L18 18"></path>
                </svg>
                </div>
           

            <p className="eventList_number"> Number of events : {(day !== undefined && day.events !== null) ? day.events.length : 0}</p>
            <div className="eventList_events">
                {(day !== undefined && day.events !== null) ? day.events.map((event) => <Event event={event} key={event.startTime} />) : null}


            </div>
            </div>
        </div>
    )
}



export default EventsList