import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import ServiceList from "./components/ServiceList";
import Services from "./components/Services";
import DateTime from "./components/DateTime";
import EventInfo from "./components/EventInfo";
import OtherInfo from "./components/OtherInfo";
import SupportInfo from "./components/SupportInfo";
import Verify from "./components/Verify";
import Confirmation from "./components/Confirmation";
import "./ubs.css";
import "./newappo.css";
import "./mv.css";

function App(props) {
  const [data, setData] = useState({
 
    startTime: "",
    ouId:"",
    endTime: "",
    publishTime: "",
    title: "",
    speakerName: "",
    speakerEmail: "",
    coHosts: JSON.stringify([["", ""]]),
    type: "",
    serviceName: "",
    description: "",
    express: "",
    reminder: "",
    remind:false,
    comments: "",
    purpose: "",
    dimensions: "",
    wordsCount: "",
    url: "",
    schedule: "",
    img: "",
  });
  const [type, setType] = useState(null);
  const [id, setId] = useState("Loading...");
  const { path } = useRouteMatch();
  const history = useHistory();


  return (
    <div className="ub">
      <div
        className="overlay"
        onClick={() => {
          history.push("/dashboard");
          props.setPop(!props.pop);
        }}
      ></div>
    
      <Router>
        <Switch>
          <Route path={path} exact>
            <ServiceList
              path={path}
              setType={setType}
              data={data}
              setData={setData}
              setPop={props.setPop}
            />
          </Route>
          <Route path={path + "/services"}>
            <Services path={path} type={type} data={data} setData={setData}  setPop={props.setPop}/>
          </Route>
          <Route path={path + "/date-time"}>
            <DateTime path={path} type={type} data={data} setData={setData} user={props.user}  setPop={props.setPop}/>
          </Route>
          <Route path={path + "/event-info"}>
            <EventInfo path={path} type={type} data={data} setData={setData}  setPop={props.setPop}/>
          </Route>
          <Route path={path + "/other-info"}>
            <OtherInfo path={path} type={type} data={data} setData={setData}  setPop={props.setPop}/>
          </Route>
          <Route path={path + "/support-info"}>
            <SupportInfo
              path={path}
              type={type}
              data={data}
              setPop={props.setPop}
              setData={setData}
            />
          </Route>
          <Route path={path + "/verify"}>
            <Verify
              path={path}
              type={type}
              data={data}
              setPop={props.setPop}
              setId={setId}
              setErr={props.setErr}
            />
          </Route>
          <Route path={path + "/confirmation"}>
            <Confirmation path={path} type={type} data={data} id={id}  setPop={props.setPop} setRefresh={props.setRefresh}/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
