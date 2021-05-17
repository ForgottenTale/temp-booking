import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import dateIcon from "../../../images/date.png";
import Select from 'react-select'
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { KeyboardTimePicker } from '@material-ui/pickers';



function minDay() {
  let newday = new Date();
  newday.setDate(newday.getDate() + 6);
  let year = newday.getFullYear();
  let month = newday.getMonth() + 1;
  let day = newday.getDate();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;

  let min = year + "/" + month + "/" + day;
  min = new Date(min)

  return min;
}

function DateTime({ path, type, setData, data, user, ou ,setPop}) {
  const [equalTimeError, setequalTimeError] = useState(false);
  const [shortTimeError, setShortTimeError] = useState(false);
  const [ouError, setOuError] = useState(false);
  const [options, setOptions] = useState([])
  const [ouId, setOuID] = useState("")
  const [ouName, setOuName] = useState("")

  const history = useHistory();

  let minDate = minDay();
  console.log(ouName);
  const next = (event) => {
    event.preventDefault();
    setData({
      ...data,
      ouId: ouId
    });

    if (data.ouid === "") {
      setOuError(true);
    }
    else if (data.startTime === data.endTime) {
      setequalTimeError(true);
    }
    else if (data.startTime > data.endTime) {
      setShortTimeError(true);
    }

    if (data.startTime !== "" && data.endTime !== "" && data.startTime !== data.endTime && data.startTime < data.endTime && ouId !== "") {
      if (type === "online_meeting" || type === "publicity") {
        history.push(path + "/event-info");
      } else if (type === "intern_support" || type === "e_notice") {
        history.push(path + "/support-info");
      }
    }
    if (type === "e_notice" || type === "publicity") {
      if (data.startTime !== "" && ouId !== "") {
        if (type === "online_meeting" || type === "publicity") {
          history.push(path + "/event-info");
        } else if (type === "intern_support" || type === "e_notice") {
          history.push(path + "/support-info");
        }
      }

    }
  };



  useEffect(() => {


    if (user.ou !== undefined && user.ou !== null && user.ou.length > 0) {
      var temp = user.ou.map((item) => {
        return { "value": item.ouName, "label": item.ouName }
      })

      setOptions(temp)
    }
    var ouName = [];
    setData(prevState => {

      ouName = user.ou.filter((ouData) => {
        if (ouData.ouId === prevState.ouId) {
          return ouData
        }
        else {
          return null
        }

      })
      console.log(prevState.ouId)


      return ({
        ...prevState,
        
        startTime: prevState.startTime !== "" ? prevState.startTime : minDate.toISOString(),
        endTime: prevState.endTime !== "" ? prevState.endTime : minDate.toISOString(),
        publishTime: prevState.publishTime !== "" ? prevState.publishTime : minDate.toISOString(),
      })
    })
    console.log(ouName)
    if (ouName.length > 0) {
      setOuName({ value: ouName[0].ouName, label: ouName[0].ouName });
    }


  }, []);


  const handleChange = (e) => {
    var temp = user.ou.filter((item) => {
      console.log()

      return item.ouName === e.value ? item : null
    })


    setOuID(temp[0].ouId)
    setOuName({ value: temp[0].ouName, label: temp[0].ouName })
  }

  const handleDateChange = (e) => {


    setData(prevState => {

      var d = new Date(e)
      var start = new Date(prevState.startTime === "" ? new Date() : prevState.startTime);
      var end = new Date(prevState.endTime === "" ? new Date() : prevState.endTime);
      var publishTime = new Date(prevState.publishTime === "" ? new Date() : prevState.publishTime);
      console.log(e);


      return ({
        ...prevState,
        ouId: prevState.ouId,
        startTime: new Date(d.setHours(start.getHours(), start.getMinutes(), 0, 0)).toISOString(),
        endTime: new Date(d.setHours(end.getHours(), end.getMinutes(), 0, 0)).toISOString(),
        publishTime: new Date(d.setHours(publishTime.getHours(), publishTime.getMinutes(), 0, 0)).toISOString(),
      })
    })


  }
  const handleTimeChange = (e, name) => {
    console.log("Hi")
    setData(prevState => {
      return ({
        ...prevState,
        [name]: e.toISOString(),
        date: e.toISOString(),
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
        <div className="close"  onClick={() => {
          history.push("/dashboard");
          setPop((prevState)=>{
            return!prevState
          });
        }}>Close</div>
        <form onSubmit={next}>
          <div className="row mb-4">

            <div className="col-sm-5 col-6">
              <label className="form-label">Select OU</label>
              <Select
                error={ouError}
                options={options}
                required
                onChange={(e) => {
                  console.log(e.value)
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
                  value={data.startTime === "" ? minDate : data.startTime}
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
                    value={data.startTime === "" ? undefined : data.startTime}
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
                    value={data.endTime === "" ? undefined : data.endTime}
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
                    value={data.publishTime === "" ? undefined : data.publishTime}
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
            onClick={() => history.push(path + "/services")}
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
