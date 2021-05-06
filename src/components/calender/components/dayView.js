import './dayView.scss';
import Events from './events';
import TimeSeries from './timeSeries';

export default function DayView({day}) {

    return (
        <div className="timeGrid">
            <TimeSeries />
            {day.events!==undefined?<Events day={day}/>:null}
        </div>
    );
}