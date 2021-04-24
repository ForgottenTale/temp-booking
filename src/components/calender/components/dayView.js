import './dayView.scss';
import Events from './events';
import TimeSeries from './timeSeries';

export default function DayView({day}) {
    console.log(day.events);
    return (
        <div className="timeGrid">
            <TimeSeries />
            {day.events!==undefined?<Events day={day}/>:null}
        </div>
    );
}