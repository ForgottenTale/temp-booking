import Calendar from '../calender/calender';
import TopNav from "../topNav/topNav";

export default function HomePage() {

    return (
        <div className="homepage">
            <TopNav />
            <Calendar />
        </div>
    );
}