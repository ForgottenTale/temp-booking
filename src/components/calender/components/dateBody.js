
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
    },[props.day])

    return (
        <div className="daytime"
            // onMouseEnter={() => { setEventList(!showEventList) }}
            // onMouseLeave={() => { setEventList(!showEventList) }}
            style={props.dayBodyWidth}
        >
            <div className="daytime_day">{props.day.format("D")}</div>
            <p style={{ color: "white", fontSize: 12 }}>{props.day.key}</p>

            {props.day.events !== null && props.day.events !== undefined && props.day.events.length >= 1 ? <Tile event={props.day.events[0]}  tileStyle={props.tileStyle}setEventList={setEventList}/>: null}
            {props.day.events !== null && props.day.events !== undefined && props.day.events.length > 1 ? <Tile event={{title:`${props.day.events.length -1} more`}}  tileStyle={props.tileStyle}setEventList={setEventList}/>: null}
            <div className="daytime_events">
                {showEventList ? <EventsList day={props.day} setEventList={setEventList}/> : null}
            </div>
        </div>
    );


}


export default DateBody