import './weekView.scss';
import Events from './events';
import TimeSeries from './timeSeries';
import WeekNames from './weekNames';


function WeekView({ days }) {

    return (
        <div className="weekView">
            <div style={{ marginLeft: 50 }}>
                {days!==undefined ?< WeekNames  days={days}/>:null}
            </div>

            <div className="weekView_container">
                <div >
                    <TimeSeries />
                </div>
                <div className="weekView_container_events">
                    {days!==undefined ? days.map((day) => <Events day={day} key={day} />) : null}
                </div>
            </div>


        </div>
    );
}

export default WeekView;