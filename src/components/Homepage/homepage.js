import Calendar from '../calender/calender';
import TopNav2 from '../topNav2/topNav2';

export default function HomePage({isAuth,setErr}) {

    return (
        <div className="homepage" style={{height:"100%"}}>
            <TopNav2 isAuth={isAuth} />
            <Calendar setErr={setErr} />
        </div>
    );
}