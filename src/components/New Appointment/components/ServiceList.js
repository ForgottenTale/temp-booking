import React from "react";
import { Link } from "react-router-dom";
import meetIcon from "../../../images/onlinemeeting.png";
import internIcon from "../../../images/internsupport.png";
import enoticeIcon from "../../../images/enotice.png";
import serviceIcon from "../../../images/select.png";
import publicity from "../../../images/publicity.png";

function ServiceList({ path, setType, setData, data }) {
  const clickHander = (type) => {
    setType(type);
    setData({ ...data, type: type });
  };

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
        <div className="service-box">
          <div className="sub-services">
            <p>2 services</p>
            <Link
              onClick={() => clickHander("online_meeting")}
              to={path + "/services"}
              className="btn btn-outline-primary btn-sm"
            >
              <i class="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="service-name">
            <img src={meetIcon} alt="" />
            <p>Online Meetings/ Webinar</p>
          </div>
        </div>
        <div className="service-box">
          <div className="sub-services">
            <p>2 services</p>
            <Link
              onClick={() => clickHander("intern_support")}
              to={path + "/services"}
              className="btn btn-outline-primary btn-sm"
            >
              <i class="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="service-name">
            <img src={internIcon} alt="" />
            <p>Intern Support</p>
          </div>
        </div>
        <div className="service-box">
          <div className="sub-services">
            <p>1 service</p>
            <Link
              onClick={() => clickHander("e_notice")}
              to={path + "/services"}
              className="btn btn-outline-primary btn-sm"
            >
              <i class="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="service-name">
            <img src={enoticeIcon} alt="" />
            <p>E-Notice</p>
          </div>
        </div>
        <div className="service-box">
          <div className="sub-services">
            <p>2 services</p>
            <Link
              onClick={() => clickHander("publicity")}
              to={path + "/services"}
              className="btn btn-outline-primary btn-sm"
            >
              <i class="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="service-name">
            <img src={publicity} alt="" />
            <p>Publicity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceList;
