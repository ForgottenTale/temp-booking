import './content.scss';
import Menu from '../menu/menu';
import TopNav from '../topNav/topNav';
import { useState,useEffect } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import Calender from '../calender/calender';
import Setting from '../settings/settings';
import Request from '../request/request';
import Users from '../users/users';
import AdminDashboard from '../adminDashboard/adminDashboard';
// import Login from '../login/login';
// import HomePage from '../Homepage/homepage';
// import Register from '../register/register';
// import ProtectedRoute from '../protectedRoute/protectedRoute';
// import PageNotFound from '../404/pageNotFound';

export default function All(props) {
    const [open, setOpen] = useState(true);
    const [activeComponent, setActiveComponent] = useState("Dashboard");

    return (
        <div className="content">
            <Menu toggle={setOpen} state={open} setActiveComponent={setActiveComponent} role={props.role} user={props.user} setOU={props.setOU} />
            <div className={open ? "content_container open" : "content_container"} >
                <TopNav activeComponent={activeComponent} setUser={props.setUser} />

                <Switch>
                    <Route path="/dashboard" >

                        <h5 className="content_container_user">Welcome {props.user.name} !</h5>
                        <AdminDashboard setErr={props.setErr} role={props.role} user={props.user} />
                    </Route>
                    <Route path="/calendar" >
                        <Calender setErr={props.setErr} />
                    </Route>
                    <Route path={'/settings'}>
                        <Setting setErr={props.setErr} />
                    </Route>
                    <Route path={'/requests'}>
                        <Request setErr={props.setErr} />
                    </Route>
                    <Route path={'/users'}>
                        <Users setErr={props.setErr} />
                    </Route>
                </Switch>




            </div>
        </div>
    )
}

// export default function Content(props) {


//     return (
//         <Router>
//             <Switch>
//                 <Route path='/login'>
//                     <Login setErr={props.setErr} {...props} />
//                 </Route>
//                 <Route path="/" exact>
//                     <HomePage setErr={props.setErr} />
//                 </Route>
//                 <Route path="/register" exact>
//                     <Register />
//                 </Route>

//                 <ProtectedRoute path="/*" setAuth={props.setAuth}  user={props.user} role={props.role} setOU={props.setOU} isAuth={props.isAuth} setUser={props.setUser} component={All} />



//                 {/* <Route path="/*">
//                     <PageNotFound/>
//                 </Route> */}

//             </Switch>
//         </Router>


//     );
// }