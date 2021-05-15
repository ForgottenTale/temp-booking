
import Content from './components/content/content';
import { useEffect } from 'react'
import axios from 'axios';
import './App.scss';
import { useState } from 'react';
import Error from './components/error/error';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import Login from './components/login/login';
import HomePage from './components/Homepage/homepage';
import Register from './components/register/register';
import ProtectedRoute from './components/protectedRoute/protectedRoute';
import ProtectedLogin from './components/protectedLogin/protectedLogin';

function App() {
  const [user, setUser] = useState({ name: null, ou: null, email: null });
  const [isAuth, setAuth] = useState(null);
  const [err, setErr] = useState(null);
  const [role, setRole] = useState(null);
  const [ou, setOU] = useState({})


  useEffect(() => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const url = "/api/credentials/"
    axios.get(url, { headers: headers, withCredentials: true })
      .then(userInfo => {
        console.log(userInfo)

        if (userInfo.status === 200) {
          setAuth(true)
          setUser({
            name: userInfo.data.name,
            ou: userInfo.data.ous,
            email: userInfo.data.email,
            phone:userInfo.phone
          })
          setOU(userInfo.data.ous[0]);

        }
        else {
          setAuth(false)
        }

      })
      .catch(err => {
        console.log(err)
        // setAuth(false)
      });
  }, [])

  useEffect(() => {
    if (ou !== undefined) {
      setRole(ou.ouAdmin)
    }

  }, [ou])

  return (
    <div className="App">
      {err && <Error msg={err} setErr={setErr} />}
      <Router>
        <Switch>
          {/* <Route path='/login'>
                    <Login setErr={setErr} setAuth={setAuth} isAuth={isAuth} />
                </Route> */}
          <Route path="/" exact>
            <HomePage setErr={setErr} isAuth={isAuth} />
          </Route>
          <Route path="/create-account/:id" exact>
            <Register setErr={setErr}/>
          </Route>
          <ProtectedLogin path="/login" setErr={setErr} setAuth={setAuth} isAuth={isAuth} setOU={setOU} component={Login} setUser={setUser} />
          <ProtectedRoute path="/*" ou={ou} setAuth={setAuth} user={user} role={role} setOU={setOU} setErr={setErr} isAuth={isAuth} setUser={setUser} component={Content} />
         

        </Switch>
      </Router>
      {/* 
      <Content setErr={setErr} setUser={setUser} user={user} role={role} setOU={setOU} isAuth={isAuth} setAuth={setAuth}/> */}
    </div>
  );
}

export default App;
