
import {useState,useEffect} from 'react';
import './weekNames.scss';

function DayNameBody(props) {

    const [currentDay,setCurrentDay]=useState(false);

    useEffect(()=>{
        
        var d =new Date();
        d.setHours(0,0,0,0);
        if(d.toISOString()===props.day.toISOString()){
            setCurrentDay(true);
        }

    },[props]);
   

    return (
        <div className="dayNameBody">
            <div className={currentDay?"dayNameBody_name_active":"dayNameBody_name"}>{props.week}</div>
        </div>
    );


};
export default function WeekNames({days}) {
    
    return (
        <div style={{display:"flex"}}>
            {days!==undefined ? days.map((day) => <DayNameBody day={day} week={day.format('ddd')} key={day} />):null}
        </div>

    );
}