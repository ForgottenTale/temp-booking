
import EventsList from './eventList';
import { useState } from 'react';
import './dateBody.scss';


function DateBody(props) {

    const [showEventList, setEventList] = useState(false);

    var d = new Date();
    d.setHours(0, 0, 0, 0);


    return (
        <div className="daytime"
            onMouseEnter={() => { setEventList(!showEventList) }}
            onMouseLeave={() => { setEventList(!showEventList) }}
        >
            <div className="daytime_day">{props.day.format("D")}</div>
            <p style={{ color: "white", fontSize: 12 }}>{props.day.key}</p>
            <div className="daytime_events">
                {showEventList ? <EventsList day={props.day} /> : null}
            </div>
        </div>
    );


}


export default DateBody