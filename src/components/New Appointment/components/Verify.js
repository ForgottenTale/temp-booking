import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import confirmIcon from "../../../images/info.png";
import { CircularProgress, Button } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({

  underline: {
      "&&&:before": {
          borderBottom: "none"
      },
      "&&:after": {
          borderBottom: "none"
      }
  },
  root: {
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      border: 0,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      height: 48,
      width:60,
      padding: '0 30px',
  },
});

function Verify({ path, type, data, setId, setErr, setPop }) {
  const classes = useStyles();
  const history = useHistory();
  const [proceed, setProceed] = useState(false);
  const [loading,setLoading] = useState(false)

  useEffect(() => {
    if (proceed) history.push(path + "/confirmation");
  });

  const handleSubmit = () => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const formData = new FormData();
    const length = keys.length;

    for (let i = 0; i < length; i++) {
      formData.append(keys[i], values[i]);
    }

    handleUpload(formData);

    console.log(Array.from(formData));
  };

  const handleUpload = async (data) => {
    try {
      setLoading(true);
      const url = "/api/book/";
      const res = await axios.post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setId(res.data.id);
      setProceed(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErr(err.response.data.error);
    }
  };

  return (
    <div className="service-container row">
      <div className="select-service col-5">
        <img src={confirmIcon} alt="" />
        <h2>Verify Order Details</h2>
        <p>
          Double check your reservation details and click submit button if
          everything is correct.
        </p>
        <h3>Questions?</h3>
        <p>Reach us at mintsupport@ieeekerala.org</p>
      </div>
      <div className="verify col">
        <h2>Verify Booking Details</h2>
        <div className="close" onClick={() => {
          history.push("/dashboard");
          setPop((prevState) => {
            return !prevState
          });
        }}>Close</div>
        <h3>Appointment Info</h3>
        <div className="row">
          <div className="col">
            <div className="mb-2">
              <p className="label">Date:</p>
              <p>{new Date(data.startTime).toDateString()}</p>
            </div>
            <div className="mb-4">
              <p className="label">Service:</p>
              <p>{data.type.replace("_", " ")}</p>
            </div>
          </div>
          <div className="col">
            <div className="mb-2">
              <p className="label">Time:</p>
              <p>
                {data.type === "online_meeting" || data.type === "intern_support" ? <>{new Date(data.startTime).toLocaleTimeString()}
                  {data.endTime !== ""
                    ? "-" + new Date(data.endTime).toLocaleTimeString()
                    : null}</> :
                  <>
                    {data.publishTime !== ""
                      ? new Date(data.publishTime).toLocaleTimeString()
                      : null}
                  </>
                }


              </p>
            </div>
          </div>
        </div>

        {type === "online_meeting" || type === "publicity" ? (
          <button
            type="button"
            className="back-btn"
            onClick={() => history.push(path + "/other-info")}
          >
            Prev
          </button>
        ) : null}
        {type === "intern_support" || type === "e_notice" ? (
          <button
            type="button"
            className="back-btn"
            onClick={() => history.push(path + "/support-info")}
          >
            Prev
          </button>
        ) : null}

        <Button
          className={classes.root}
          style={{ width: "100%", marginBottom: 30 }}
          onClick={() => { handleSubmit() }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={14} /> : "Submit"}
        </Button>
      </div>
    </div>
  );
}

export default Verify;
