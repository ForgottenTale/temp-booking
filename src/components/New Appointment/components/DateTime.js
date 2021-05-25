import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import dateIcon from "../../../images/date.png";
import Select from 'react-select'
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { KeyboardTimePicker } from '@material-ui/pickers';



function minDay() {
  let newday = new Date();
  newday.setDate(newday.getDate() + 4);
  let year = newday.getFullYear();
  let month = newday.getMonth() + 1;
  let day = newday.getDate();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;

  let min = year + "/" + month + "/" + day;
  min = new Date(min)

  return min;
}

function DateTime({ path, type, setData, data, user, ou, setPop }) {
  let minDate = minDay();
  const [equalTimeError, setequalTimeError] = useState(false);
  const [shortTimeError, setShortTimeError] = useState(false);
  const [ouError, setOuError] = useState(false);
  const [ouId, setOuID] = useState(data.ouId)
  const [ouName, setOuName] = useState(() => {

    var ouName = [];

    ouName = user.ou.filter((ouData) => {
      if (ouData.ouId === data.ouId) {
        return ouData
      }
      else {
        return null
      }

    })

    if (ouName.length > 0) {
      return { value: ouName[0].ouName, label: ouName[0].ouName }
    }
    else {
      return "";
    }
  })
  const [localState, setLocalState] = useState(() => {
    var temp = [];
    if (user.ou !== undefined && user.ou !== null && user.ou.length > 0) {
      temp = user.ou.map((item) => {
        return { "value": item.ouName, "label": item.ouName }
      })
    }
    return {
      options: temp,
      startTime: data.startTime !== "" ? data.startTime : minDate.toISOString(),
      endTime: data.endTime !== "" ? data.endTime : minDate.toISOString(),
      publishTime: data.publishTime !== "" ? data.publishTime : minDate.toISOString()
    }
  });

  const history = useHistory();


  const set = () => {
    setData((prevState) => {
      return {
        ...prevState,
        startTime: localState.startTime,
        endTime: localState.endTime,
        publishTime: localState.publishTime,
        ouId: ouId
      }
    })
  }

  const next = (event) => {
    event.preventDefault();
    setData({
      ...data,
      ouId: ouId
    });
    var start = Date.parse(new Date(localState.startTime).toISOString())
    var end = Date.parse(new Date(localState.endTime).toISOString())

    if (data.ouid === "") {
      setOuError(true);
    }
    else if (start === end) {
      setequalTimeError(true);
    }
    else if (start > end) {
      setShortTimeError(true);
    }

    if (start !== "" && end !== "" && start !== end && start < end && ouId !== "") {
      if (type === "online_meeting" || type === "publicity") {
        set();
        history.push(path + "/event-info");
      } else if (type === "intern_support" || type === "e_notice") {
        set();
        history.push(path + "/support-info");
      }
    }
    if (type === "e_notice" || type === "publicity") {
      if (localState.startTime !== "" && ouId !== "") {
        if (type === "online_meeting" || type === "publicity") {
          set();
          history.push(path + "/event-info");
        } else if (type === "intern_support" || type === "e_notice") {
          set();
          history.push(path + "/support-info");
        }
      }

    }
  };

  const handleChange = (e) => {
    var temp = user.ou.filter((item) => {
      return item.ouName === e.value ? item : null
    })
    setOuID(temp[0].ouId)
    setOuName({ value: temp[0].ouName, label: temp[0].ouName })
  }

  const handleDateChange = (e) => {


    setLocalState(prevState => {

      var d = new Date(e)
      var start = new Date(prevState.startTime === "" ? new Date() : prevState.startTime);
      var end = new Date(prevState.endTime === "" ? new Date() : prevState.endTime);
      var publishTime = new Date(prevState.publishTime === "" ? new Date() : prevState.publishTime);

      return ({
        ...prevState,
        startTime: new Date(d.setHours(start.getHours(), start.getMinutes(), 0, 0)).toISOString(),
        endTime: new Date(d.setHours(end.getHours(), end.getMinutes(), 0, 0)).toISOString(),
        publishTime: new Date(d.setHours(publishTime.getHours(), publishTime.getMinutes(), 0, 0)).toISOString(),
      })
    })


  }
  const handleTimeChange = (e, name) => {

    setLocalState(prevState => {
      return ({
        ...prevState,
        [name]: e.toISOString(),
        // date: e.toISOString(),
      })
    })
  }

  return (
    <div className="service-container row">
      <div className="select-service col-5">
        <img src={dateIcon} alt="" />
        <h2>Select Date & Time</h2>
        <p>Please select the date and time for your appointment.</p>
        <h3>Questions?</h3>
        <p>Reach us at mintsupport@ieeekerala.org</p>
      </div>
      <div className="date col">
        <h2>Select Date & Time</h2>
        <div className="close" onClick={() => {
          history.push("/dashboard");
          setPop((prevState) => {
            return !prevState
          });
        }}>Close</div>
        <form onSubmit={next}>
          <div className="row mb-4">

            <div className="col-sm-5 col-6">
              <label className="form-label">Select OU</label>
              <Select
                value={ouName}
                error={ouError}
                options={localState.options}
                required
                onChange={(e) => {
                  handleChange(e)
                }}
              />
            </div>
            <div className="col-sm-5 col-6">
              <label className="form-label">Date</label>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker

                  margin="normal"
                  id="time-picker"
                  minDate={minDate}
                  value={localState.startTime === "" ? minDate : localState.startTime}
                  KeyboardButtonProps={{
                    'aria-label': 'change time',
                  }}
                  onChange={(e) => handleDateChange(e)}
                />
              </MuiPickersUtilsProvider>
            </div>
          </div>



          {data.type === "online_meeting" || data.type === "intern_support" ? (

            <div className="row mb-5">
              <div className="col-sm-5 col-6">
                <label className="form-label">From</label>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardTimePicker
                    error={shortTimeError || equalTimeError}
                    margin="normal"
                    id="time-picker"
                    value={localState.startTime === "" ? undefined : localState.startTime}
                    onChange={(e) => handleTimeChange(e, "startTime")}
                    required
                    KeyboardButtonProps={{
                      'aria-label': 'change time',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </div>

              <div className="col-sm-5 col-6">
                <label className="form-label">To</label>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardTimePicker
                    error={shortTimeError || equalTimeError}
                    margin="normal"
                    id="time-picker"
                    value={localState.endTime === "" ? undefined : localState.endTime}
                    onChange={(e) => handleTimeChange(e, "endTime")}
                    required
                    KeyboardButtonProps={{
                      'aria-label': 'change time',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </div>

            </div>
          ) : null}
          {data.type === "e_notice" || data.type === "publicity" ? (
            <div className="row mb-5">
              <div className="col-sm-5 col-6">
                <label className="form-label">Time</label>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardTimePicker
                    margin="normal"
                    id="time-picker"
                    value={localState.publishTime === "" ? undefined : localState.publishTime}
                    onChange={(e) => handleTimeChange(e, "publishTime")}
                    required
                    KeyboardButtonProps={{
                      'aria-label': 'change time',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className="mt-5 back-btn"
            onClick={() => {
              set();
              history.push(path + "/services")
            }}
          >
            Prev
          </button>
          <button className="btn btn-primary mt-5 next-btn">Next</button>
        </form>
      </div>
    </div>
  );
}

export default DateTime;
