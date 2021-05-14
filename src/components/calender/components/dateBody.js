
import EventsList from './eventList';
import { useState } from 'react';
import './dateBody.scss';
import Tile from './tile';
import {useEffect} from 'react';


function DateBody(props) {

   


    const [showEventList, setEventList] = useState(false);

    var d = new Date();
    d.setHours(0, 0, 0, 0);

    useEffect(()=>{
        if (props.day.events !== null && props.day.events !== undefined) {
            console.log(props.day.events)
        }
    },[])

    return (
        <div className="daytime"
            onMouseEnter={() => { setEventList(!showEventList) }}
            onMouseLeave={() => { setEventList(!showEventList) }}
        >
            <div className="daytime_day">{props.day.format("D")}</div>
            <p style={{ color: "white", fontSize: 12 }}>{props.day.key}</p>

            {props.day.events !== null && props.day.events !== undefined && props.day.events.length >= 1 ? props.day.events.map((event) => <Tile event={event} />) : null}

            <div className="daytime_events">
                {showEventList ? <EventsList day={props.day} /> : null}
            </div>
        </div>
    );


}


export default DateBody