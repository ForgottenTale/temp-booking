import './topNav2.scss';
import { useHistory } from 'react-router-dom'

export default function TopNav2({ isAuth }) {
    const history = useHistory()

    return (
        <div className="topNav2">
            <div className="topNav2_left">
                <h3>Calandar</h3>
            </div>
            <div className="topNav2_right">
                {isAuth === "" || isAuth === false ?
                    <button
                        onClick={() => history.push("/dashboard")}
                    >Goto Dasboard</button> :
                    <button
                        onClick={() => history.push("/login")}
                    >Login</button>}

        
            </div>
        </div>
    );
}