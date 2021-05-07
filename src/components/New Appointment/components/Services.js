import React from "react";
import { useHistory } from "react-router-dom";
import serviceIcon from "../../../images/select.png";

function Services({ path, type, data, setData }) {
  const history = useHistory();

  const next = (item) => {
    // if (timeFrom !== "") {
    setData({ ...data, serviceName: item });
    // }
    history.push(path + "/date-time");
  };

  let items = [];
  if (type === "online_meeting") {
    items = ["Webex", "Zoom"];
  } else if (type === "intern_support") {
    items = ["Content Writing", "Poster Design", "Website Development"];
  } else if (type === "e_notice") {
    items = ["E-Notice Issue"];
  } else if (type === "publicity") {
    items = ["Social Media", "Website Posting"];
  }
  console.log(items);

  return (
    <div className="service-container row">
      <div className="select-service col-5">
        <img src={serviceIcon} alt="" />
        <h2>Select Service</h2>
        <p>
          Please select a service for which you want to schedule an appointment.
        </p>
        <h3>Questions?</h3>
        <p>Call (858) 939-3746 for help.</p>
      </div>
      <div className="service-list col">
        <h2>Service Selection</h2>
        {items.map((item, index) => (
          <div key={index} className="service-box-x" onClick={() => next(item)}>
            <p>{item}</p>
          </div>
        ))}
        <button
          type="button"
          className="mt-5 back-btn"
          onClick={() => {
            setData({
              startTime: "",
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
              comments: "",
              purpose: "",
              dimensions: "",
              wordsCount: "",
              url: "",
              schedule: "",
              img: "",
            });
            history.push(path);
          }}
        >
          Prev
        </button>
      </div>
    </div>
  );
}

export default Services;
