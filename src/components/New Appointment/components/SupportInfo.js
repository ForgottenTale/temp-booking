import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import infoIcon from "../../../images/info.png";
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

function SupportInfo({ path, type, data, setData, setPop }) {
  const history = useHistory();

  const [support, setSupport] = useState({
    title: data.title,
    description: data.description,
    express: data.express,
    remind: data.remind,
    reminder: data.reminder === "" ? new Date(data.publishTime) : data.reminder,
    comments: data.comments,
    purpose: data.purpose,
    dimensions: data.dimensions,
    wordsCount: data.wordsCount,
    url: data.url,
    img: data.img,
  });
  const handleDateChange = (e, name) => {
    setSupport(prevState => {
      return ({
        ...prevState,
        reminder: e.toISOString(),
        date: e.toISOString(),
      })
    })
  }

  function nextButton(event) {
    event.preventDefault();

    setData({
      ...data,
      title: support.title,
      description: support.description,
      express: support.express.toLowerCase(),
      reminder: support.remind ? support.reminder : data.publishTime,
      remind: support.remind,
      comments: support.comments,
      purpose: support.purpose,
      dimensions: support.dimensions,
      wordsCount: support.wordsCount,
      url: support.url,
      img: support.img,
    });

    history.push(path + "/verify");
  }
  function prevButton(event) {
    event.preventDefault();

    setData({
      ...data,
      title: support.title,
      description: support.description,
      express: support.express.toLowerCase(),
      reminder: support.remind ? support.reminder : data.publishTime,
      remind: support.remind,
      comments: support.comments,
      purpose: support.purpose,
      dimensions: support.dimensions,
      wordsCount: support.wordsCount,
      url: support.url,
      img: support.img,
    });

    history.push(path + "/date-time");
  }


  // useEffect(()=>{
  //   setData((prevState)=>{
  //     return{
  //       ...prevState,
  //       reminder:prevState.reminder===""?new Date().toISOString():prevState.reminder
  //     }
  //   })
  //   setSupport(prevState => {
  //     return ({
  //       ...prevState,
  //       reminder: new Date().toISOString()
  //     })
  //   })
  // },[])


  return (
    <div className="info-container row">
      <div className="enter-info col-4">
        <img src={infoIcon} alt="" />
        <h2>Enter Information</h2>
        <p>Please provide the event/support details for your appointment.</p>
        <h3>Questions?</h3>
        <p>Reach us at mintsupport@ieeekerala.org</p>
      </div>
      <div className="info col">
        <h2>Support Details </h2>
        <div className="close" onClick={() => {
          history.push("/dashboard");
          setPop((prevState) => {
            return !prevState
          });
        }}>Close</div>
        {type === "intern_support" ? (
          <form onSubmit={nextButton}>
            <div className="row">
              <div className="col-sm-6 col-12">
                <div className="mb-4">
                  <textarea
                    rows="3"
                    placeholder="Content/ description for the support"
                    defaultValue={data.description}
                    className="form-control"
                    required
                    name="supportDesc"
                    onChange={(e) => {
                      setSupport({ ...support, description: e.target.value });
                    }}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <input
                    placeholder="Title"
                    type="text"
                    required
                    className="form-control"
                    defaultValue={data.title}
                    name="title"
                    onChange={(e) => {
                      setSupport({ ...support, title: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-4">
                  <input
                    placeholder="Purpose"
                    type="text"
                    required
                    className="form-control"
                    defaultValue={data.purpose}
                    name="purpose"
                    onChange={(e) => {
                      setSupport({ ...support, purpose: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    Upload relevant files (if any)
                  </label>
                  <input
                    type="file"
                    multiple
                    className="form-control"
                    name="relevantFiles"
                    onChange={(e) => {
                      setSupport({ ...support, img: e.target.files[0] });
                    }}
                  />
                </div>
              </div>
              <div className="col-sm-6 col-12">
                <div className="mb-4">
                  <input
                    type="text"
                    required
                    className="form-control"
                    name="serviceName"
                    value={data.serviceName}
                    readOnly
                  />
                </div>
                {data.serviceName === "Poster Design" ||
                  data.serviceName === "Content Writing" ? (
                  data.serviceName === "Poster Design" ? (
                    <div className="mb-4">
                      <input
                        placeholder="Poster dimensions (if any)"
                        type="text"
                        className="form-control"
                        required
                        name="posterDimensions"
                        defaultValue={data.dimensions}
                        onChange={(e) => {
                          setSupport({
                            ...support,
                            dimensions: e.target.value,
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <input
                        placeholder="Writeup words count (if any)"
                        type="number"
                        required
                        className="form-control"
                        name="wordsCount"
                        defaultValue={data.wordsCount}
                        onChange={(e) => {
                          setSupport({
                            ...support,
                            wordsCount: e.target.value,
                          });
                        }}
                      />
                    </div>
                  )
                ) : (
                  <div className="mb-4">
                    <input
                      placeholder="URL"
                      type="text"
                      defaultValue={data.url}
                      className="form-control"
                      name="mockup"
                      onChange={(e) => {
                        setSupport({ ...support, url: e.target.value });
                      }}
                    />
                  </div>
                )}
                <div className="mb-5">
                  <textarea
                    placeholder="Comments"
                    rows="3"
                    className="form-control"
                    defaultValue={data.comments}
                    name="comments"
                    onChange={(e) => {
                      setSupport({ ...support, comments: e.target.value });
                    }}
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="back-btn"
              onClick={() => {
                history.push(path + "/date-time");
              }}
            >
              Prev
            </button>
            <button className="btn btn-primary next-btn">Next</button>
          </form>
        ) : (
          /* ............................................................................................... */
          <form onSubmit={nextButton}>
            <div className="row">
              <div className="col-sm-6 col-12">
                <div className="mb-4">
                  <textarea
                    placeholder="Content/ description"
                    rows="3"
                    required
                    className="form-control"
                    name="enoticeDesc"
                    defaultValue={data.description}
                    onChange={(e) => {
                      setSupport({ ...support, description: e.target.value });
                    }}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <input
                    placeholder="Title"
                    type="text"
                    required
                    className="form-control"
                    name="title"
                    defaultValue={data.title}
                    onChange={(e) => {
                      setSupport({ ...support, title: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-4">
                  <select
                    defaultValue={data.express}
                    className="form-select"
                    required
                    name="express"
                    onChange={(e) => {
                      setSupport({
                        ...support,
                        express: e.target.value,
                      });
                    }}
                  >
                    <option value="" disabled>
                      --Delivery Type--
                    </option>
                    <option>Express</option>
                    <option>Normal</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Poster (if any)</label>
                  <input
                    type="file"
                    className="form-control"
                    name="poster"
                    onChange={(e) => {
                      setSupport({ ...support, img: e.target.files[0] });
                    }}
                  />
                </div>
              </div>

              <div className="col-sm-6 col-12">
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    name="serviceName"
                    value={data.serviceName}
                    readOnly
                  />
                </div>
                <div className="mb-4">

                  <label className="form-label">Reminder&nbsp;</label>
                  <input
                    type="radio"
                    checked={support.remind?true:false}
                    value="Yes" 
                    onChange={() => {
                      setSupport({ ...support, remind: true });
                    }} /> Yes&nbsp;&nbsp;
                <input
                    type="radio"
                    value="No" 
                    checked={support.remind?false:true}
                    onChange={() => {
                      setSupport({ ...support, remind: false });
                    }} /> No&nbsp;&nbsp;
                {support.remind ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      margin="normal"
                      required
                      minDate={new Date(data.publishTime)}
                      id="time-picker"
                      value={support.reminder === "" ? new Date(data.publishTime) : new Date(support.reminder)}
                      KeyboardButtonProps={{
                        'aria-label': 'change time',
                      }}
                      onChange={(e) => handleDateChange(e)}
                    />
                  </MuiPickersUtilsProvider> : null}
                </div>
                <div className="mb-5">
                  <textarea
                    placeholder="Comments"
                    rows="3"
                    defaultValue={data.comments}
                    className="form-control"
                    name="comments"
                    onChange={(e) => {
                      setSupport({ ...support, comments: e.target.value });
                    }}
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="back-btn"
              onClick={(e) => {
                prevButton(e);
              }}
            >
              Prev
            </button>
            <button className="btn btn-primary next-btn">Next</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SupportInfo;
