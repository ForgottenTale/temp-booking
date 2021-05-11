import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import infoIcon from "../../../images/info.png";

function CohostData(props) {
  return (
    <div className="row">
      <div className="col-sm-6 col-12 mb-3">
        <label className="form-label">Co-host name</label>
        <input
          className="form-control"
          name="cohostName"
          value={props.cohost[props.id][0]}
          onChange={(e) => props.handleChange(props.id, e)}
        />
      </div>
      <div className="col-sm-6 col-12 mb-3">
        <label className="form-label">Co-host email</label>
        <input
          className="form-control"
          name="cohostMail"
          value={props.cohost[props.id][1]}
          onChange={(e) => props.handleChange(props.id, e)}
        />
      </div>
    </div>
  );
}

function OtherInfo({ path, type, data, setData }) {
  const history = useHistory();
  let [count, setCount] = useState(1);
  const [cohost, setCohost] = useState(JSON.parse(data.coHosts));
  const [content, setContent] = useState({
    schedule: data.schedule,
    comments: data.comments,
  });

  function nextButton(event) {
    event.preventDefault();

    setData({
      ...data,
      coHosts: JSON.stringify(cohost),
      schedule: content.schedule,
      comments: content.comments,
    });

    history.push(path + "/verify");
  }

  function addCohost() {
    if (count < 3) {
      setCohost([...cohost, ["", ""]]);
      setCount(count + 1);
    }
  }

  function deleteCohost(i) {
    if (count > 1) {
      setCount(count - 1);
      const values = [...cohost];
      values.splice(i, 1);
      setCohost(values);
    }
  }

  function handleChange(index, e) {
    let values = [...cohost];
    e.preventDefault();
    if (e.target.name === "cohostName") {
      values[index][0] = e.target.value;
    }
    if (e.target.name === "cohostMail") {
      values[index][1] = e.target.value;
    }

    setCohost(values);
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
        <h2>Other Details</h2>
        {type === "publicity" ? (
          <form onSubmit={nextButton}>
            <div className="row mb-3">
              <div className="col-sm-8 col-12">
                <label className="form-label">Program schedule (if any)</label>
                <input
                  type="text"
                  className="form-control"
                  name="schedule"
                  defaultValue={data.schedule}
                  onChange={(e) => {
                    setContent({ ...content, schedule: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="row mb-5">
              <div className="col-sm-8 col-12">
                <label className="form-label">Comments</label>
                <textarea
                  defaultValue={data.comments}
                  rows="3"
                  className="form-control"
                  name="comments"
                  onChange={(e) => {
                    setContent({ ...content, comments: e.target.value });
                  }}
                ></textarea>
              </div>
            </div>
            <button
              type="button"
              className="back-btn"
              onClick={() => history.push(path + "/event-info")}
            >
              Prev
            </button>
            <button className="btn btn-primary next-btn">Next</button>
          </form>
        ) : (
          /* ............................................................................................... */
          <form onSubmit={nextButton}>
            {cohost.map((e, i) => (
              <CohostData
                key={i}
                id={i}
                cohost={cohost}
                handleChange={handleChange}
              />
            ))}
            {count !== 3 && (
              <button
                type="button"
                onClick={addCohost}
                className="btn btn-secondary btn-sm cohost-btn"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
            {count !== 1 && (
              <button
                type="button"
                onClick={deleteCohost}
                className="btn btn-secondary btn-sm cohost-btn"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
            <button
              type="button"
              className="mt-5 back-btn"
              onClick={() => history.push(path + "/event-info")}
            >
              Prev
            </button>
            <button className="btn btn-primary mt-5 next-btn">Next</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OtherInfo;
