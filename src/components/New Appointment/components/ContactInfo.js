import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import infoIcon from "../../../images/info.png";

function ContactInfo({ type, setData, data }) {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const history = useHistory();
  function nextButton() {
    setData({
      ...data,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      phone: userInfo.phone,
    });

    if (type === "online_meeting" || type === "publicity") {
      history.push("/event-info");
    } else if (type === "intern_support" || type === "e_notice") {
      history.push("/support-info");
    }
  }

  return (
    <div className="info-container row">
      <div className="enter-info col-4">
        <img src={infoIcon} alt="" />
        <h2>Enter Information</h2>
        <p>
          Please provide your contact info and other details so that we can
          send you a confirmation and other info.
          </p>
        <h3>Questions?</h3>
        <p>Call (858) 939-3746 for help.</p>
      </div>
      <div className="info col">
        <h2>Contact Information</h2>
        <div className="row">
          <div className="col-6">
            <div className="mb-3">
              <label className="form-label">First name</label>
              <input
                type="text"
                className="form-control"
                name="fName"
                onChange={(e) => {
                  setUserInfo({ ...userInfo, firstName: e.target.value });
                }}
              />
            </div>
            <div className="mb-5">
              <label className="form-label">Phone number</label>
              <input
                type="text"
                className="form-control"
                name="phoneNumber"
                onChange={(e) => {
                  setUserInfo({ ...userInfo, phone: e.target.value });
                }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="mb-3">
              <label className="form-label">Last name</label>
              <input
                type="text"
                className="form-control"
                name="lName"
                onChange={(e) => {
                  setUserInfo({ ...userInfo, lastName: e.target.value });
                }}
              />
            </div>
            <div className="mb-5">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="mail"
                onChange={(e) => {
                  setUserInfo({ ...userInfo, email: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="back-btn"
          onClick={() => history.push("/date-time/")}
        >
          Prev
          </button>
        <button onClick={nextButton} className="btn btn-primary next-btn">
          Next
          </button>
      </div>
    </div>
  );
}

export default ContactInfo;
