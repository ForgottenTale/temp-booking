import Calendar from '../calender/calender';
import TopNav2 from '../topNav2/topNav2';

export default function HomePage({isAuth}) {

    return (
        <div className="homepage" style={{height:"100%"}}>
            <TopNav2 isAuth={isAuth} />
            <Calendar />
        </div>
    );
}