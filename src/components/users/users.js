
import './users.scss';
import Admins from './components/admin';
import User from './components/users';
import { useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import UserView from '../userView/userView';


export default function Users() {

    const [usertype, setUserType] = useState('user');
    const [user, setUser] = useState(null);
    const {path } =useRouteMatch();


    return (
        <Switch>
            <Route exact path={path}>
                <div className="users">
                    <div className="users_header">
                        <h6 className="users_header_title" >All Users</h6>

                    </div>
                    <div className="users_type">
                        <h6 className={usertype === 'user' ? "users_type_title active" : "users_type_title"} onClick={() => setUserType('user')}>Users</h6>
                        <h6 className={usertype === 'admin' ? "users_type_title active" : "users_type_title "} onClick={() => setUserType('admin')}>Admins</h6>

                    </div>

                    {usertype === 'admin' ? <Admins setUser={setUser} /> : <User setUser={setUser} />}


                </div>
            </Route>
            <Route path={path+'/user/:id'}>
                <UserView user={user} type={usertype} />
            </Route>
            <Route path={path+'/admin/:id'}>
                <UserView user={user} type={usertype} />
            </Route>

        </Switch>



    )
}

