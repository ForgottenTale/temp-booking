import './eventList.scss';


function Event({event}) {

    return (
        <div className="eventList_events_event">
            <div className="eventList_events_event_title">{event.title}</div>
            <div className="eventList_events_event_time">{event.startTime}</div>
        </div>
    );
}
function EventsList({ day }) {

    return (
        <div className="eventList">
            <h4 className="eventList_date">{day.format("DD MMM,YYYY")}</h4>
            <p className="eventList_number"> Number of events : {(day !== undefined && day.events !==null )?day.events.length:0}</p>
            <div className="eventList_events">
                {(day !== undefined && day.events !==null )?day.events.map((event)=><Event event ={event}  key={event.startTime}/>):null}

        
            </div>
        </div>
    )
}



export default EventsList