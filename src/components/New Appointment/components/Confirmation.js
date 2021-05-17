import React from "react";
import { Link, useHistory } from "react-router-dom";
import confirmIcon from "../../../images/info.png";

function Confirmation({ id,setPop }) {
  const history = useHistory();
  return (
    <div className="service-container row">
      <div className="select-service col-5">
        <img src={confirmIcon} alt="" />
        <h2>Confirmation</h2>
        <div className="close"  onClick={() => {
          history.push("/dashboard");
          setPop((prevState)=>{
            return!prevState
          });
        }}>Close</div>
        <p>
          Your appointment has been successfully scheduled. Please retain this
          confirmation for your record.
        </p>
        <h3>Questions?</h3>
        <p>Reach us at mintsupport@ieeekerala.org</p>
      </div>
      <div className="verify col">
        <h2>Appointment Confirmation</h2>
        <div className="mb-5 confirmation-box">
          <p>Confirmation # </p>
          <h4>{id}</h4>
          {/* <button className="btn btn-outline-danger">Add to Calender</button>
          <button className="btn btn-outline-info">Print</button> */}
        </div>
        <Link
          onClick={() =>{ history.push("/dashboard")
          setPop((prevState)=>{
            return!prevState
          });}}
          className="btn btn-success mt-5 submit-btn"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}

export default Confirmation;
