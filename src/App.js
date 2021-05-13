
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
  const [user, setUser] = useState({ id: null, name: null, ou: null, email: null });
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

        if(userInfo.status===200){
          setAuth(true)
          setUser({
            id: userInfo.data.id,
            name: userInfo.data.name,
            ou:  [
              { name: "College of Engineering, Kidangoor", role: "Admin" },
              { name: "College of Engineering, Permon", role: "user" },
              { name: "Young", role: "user" }
            ],
            email: userInfo.data.email
          })
          setOU({ name: "College of Engineering, Kidangoor", role: "Admin" });
  
        }
        else{
          setAuth(false)
        }
        
      })
      .catch(err => {
        console.log(err)
      });
  }, [])

  useEffect(() => {
    if(ou!==undefined){
      setRole(ou.role)
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
            <HomePage setErr={setErr} isAuth={isAuth}/>
          </Route>
          <Route path="/register" exact>
            <Register />
          </Route>
          <ProtectedLogin path="/login"  setErr={setErr} setAuth={setAuth} isAuth={isAuth} component={Login} />
          <ProtectedRoute path="/*" ou={ou}  setAuth={setAuth} user={user} role={role} setOU={setOU} isAuth={isAuth} setUser={setUser} component={Content} />

        </Switch>
      </Router>
      {/* 
      <Content setErr={setErr} setUser={setUser} user={user} role={role} setOU={setOU} isAuth={isAuth} setAuth={setAuth}/> */}
    </div>
  );
}

export default App;
