import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import infoIcon from "../../../images/info.png";

function SupportInfo({ path, type, data, setData }) {
  const history = useHistory();

  const [support, setSupport] = useState({
    title: data.title,
    description: data.description,
    express: data.express,
    reminder: data.reminder,
    comments: data.comments,
    purpose: data.purpose,
    dimensions: data.dimensions,
    wordsCount: data.wordsCount,
    url: data.url,
    img: data.img,
  });

  function nextButton(event) {
    event.preventDefault();

    setData({
      ...data,
      title: support.title,
      description: support.description,
      express: support.express,
      reminder: support.reminder,
      comments: support.comments,
      purpose: support.purpose,
      dimensions: support.dimensions,
      wordsCount: support.wordsCount,
      url: support.url,
      img: support.img,
    });

    history.push(path + "/verify");
  }

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
        <h2>Support Details</h2>
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
                  <p className="remainder-enotice-label">Remainder e-notice:</p>
                  <div className="form-check form-check-inline">
                    <input
                      defaultValue={data.reminder}
                      className="form-check-input"
                      type="radio"
                      name="remainderEnotice"
                      onChange={() => {
                        setSupport({ ...support, reminder: "yes" });
                      }}
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      defaultValue={data.reminder}
                      className="form-check-input"
                      type="radio"
                      name="remainderEnotice"
                      onChange={(e) => {
                        setSupport({ ...support, reminder: "no" });
                      }}
                    />
                    <label className="form-check-label">No</label>
                  </div>
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
              onClick={() => {
                history.push(path + "/date-time");
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
