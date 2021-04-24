import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import infoIcon from "../../../images/info.png";

function EventInfo({ path, type, data, setData }) {
  const history = useHistory();

  const [content, setContent] = useState({
    description: "",
    speakerName: "",
    speakerEmail: "",
    img: "",
    title:""
  });

  function next(event) {
    event.preventDefault();
    setData({
      ...data,
      title: content.title,
      description: content.description,
      speakerName: content.speaker,
      speakerEmail: content.speakerEmail,
      img: content.img,
    });
    history.push(path + "/other-info");
  }

  return (
    <div className="info-container row">
      <div className="enter-info col-4">
        <img src={infoIcon} alt="" />
        <h2>Enter Information</h2>
        <p>Please provide the event/support details for your appointment.</p>
        <h3>Questions?</h3>
        <p>Call (858) 939-3746 for help.</p>
      </div>
      <div className="info col">
        <h2>Event Details</h2>

        <form onSubmit={next}>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">
                Content/ description of the event
                </label>
              <textarea
                rows="3"
                className="form-control"
                name="eventDesc"
                onChange={(e) =>
                  setContent({ ...content, description: e.target.value })
                }
              ></textarea>
            </div>
            <div className="col">
              <label className="form-label">Service name</label>
              <input
                type="text"
                className="form-control"
                name="serviceName"
                value={data.serviceName}
                readOnly
              />
            </div>
          </div>
          {type === "online_meeting" ? (
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Speaker name</label>
                <input
                  type="text"
                  className="form-control"
                  name="speakerName"
                  defaultValue={data.speakerName}
                  onChange={(e) =>
                    setContent({ ...content, speaker: e.target.value })
                  }/
                >
              </div>
              <div className="col">
                <label className="form-label">Speaker email</label>
                <input
                  type="email"
                  className="form-control"
                  name="speakerMail"
                  onChange={(e) =>
                    setContent({ ...content, speakerEmail: e.target.value })
                  }
                />
              </div>
            </div>
          ) : null}
          {type === "online_meeting" ? (
            <div className="row mb-5">
              <div className="col-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  onChange={(e) => {
                    setContent({ ...content, title: e.target.value });
                  }}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Poster (if any)</label>
                <input
                  type="file"
                  className="form-control"
                  name="poster"
                  onChange={(e) => {
                    setContent({ ...content, img: e.target.files[0] });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="row mb-5">
              <div className="col-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  onChange={(e) => {
                    setContent({ ...content, title: e.target.value });
                  }}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Poster</label>
                <input
                  type="file"
                  className="form-control"
                  name="poster"
                  onChange={(e) => {
                    setContent({ ...content, img: e.target.files[0] });
                  }}
                />
              </div>

            </div>


          )}
          <button
            type="button"
            className="back-btn"
            onClick={() => history.push(path + "/date-time")}
          >
            Prev

            </button>
          <button className="btn btn-primary next-btn">Next</button>
        </form>
      </div>
    </div>
  );
}

export default EventInfo;
