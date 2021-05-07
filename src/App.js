
import Content from './components/content/content';
import { useEffect } from 'react'
import axios from 'axios';
import './App.scss';
import { useState } from 'react';
import Error from './components/error/error';


function App() {
  const [user, setUser] = useState({ id: null, name: null, ou: null, email: null });
  const [err, setErr] = useState(null);
  const [role,setRole] = useState(null);
  const [ou,setOU] = useState({})

  useEffect(() => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const url = "http://localhost:5000/api/credentials/"
    axios.get(url, { headers: headers, withCredentials: true }).then((data) => {
      console.log(data)
      if (data.status === 200)
        return data.data
    })
      .then(userInfo => {
        setUser({
          id: userInfo.id,
          name: userInfo.name,
          ou:  [
            { name: "College of Engineering, Kidangoor", role: "Admin" },
            { name: "College of Engineering, Permon", role: "user" }
          ],
          email: userInfo.email
        })
        setOU({ name: "College of Engineering, Kidangoor", role: "Admin" })
 
      })
      .catch(err => {
        if (!(/\/login$/).test(window.location))
          window.location.replace('/login')
      });
  }, [])

  useEffect(()=>{
    setRole(ou.role)
  },[ou])

  return (
    <div className="App">
      {err && <Error msg={err} setErr={setErr} />}
      <Content setErr={setErr} setUser={setUser} user={user} role={role} setOU={setOU}/>
    </div>
  );
}

export default App;
