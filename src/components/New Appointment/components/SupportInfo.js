import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import infoIcon from "../../../images/info.png";

function SupportInfo({ path, type, data, setData }) {
  const history = useHistory();

  const [support, setSupport] = useState({
    description: "",
    deliveryType: "",
    remainder: "",
    comments: "",
    purpose: "",
    dimensions: "",
    wordsCount: "",
    url: "",
    img: "",
  });

  function nextButton(event) {
    event.preventDefault();

    setData({
      ...data,
      description: support.description,
      deliveryType: support.deliveryType,
      remainder: support.remainder,
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
        <p>Call (858) 939-3746 for help.</p>
      </div>
      <div className="info col">
        <h2>Support Details</h2>
        {type === "intern_support" ? (
          <form onSubmit={nextButton}>
            <div className="row">
              <div className="col">
                <div className="mb-4">
                  <label className="form-label">
                    Content/ description for the support
                    </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    name="supportDesc"
                    onChange={(e) => {
                      setSupport({ ...support, description: e.target.value });
                    }}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label">Purpose</label>
                  <input
                    type="text"
                    className="form-control"
                    name="purpose"
                    onChange={(e) => {
                      setSupport({ ...support, purpose: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-5">
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
              <div className="col">
                <div className="mb-4">
                  <label className="form-label">Service name</label>
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
                      <label className="form-label">
                        Poster dimensions (if any)
                        </label>
                      <input
                        type="text"
                        className="form-control"
                        name="posterDimensions"
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
                      <label className="form-label">
                        Writeup words count (if any)
                        </label>
                      <input
                        type="number"
                        className="form-control"
                        name="wordsCount"
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
                    <label className="form-label">URL</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mockup"
                      onChange={(e) => {
                        setSupport({ ...support, url: e.target.value });
                      }}
                    />
                  </div>
                )}
                <div className="mb-5">
                  <label className="form-label">Comments</label>
                  <textarea
                    rows="3"
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
                onClick={() => history.push(path + "/date-time")}
              >
                Prev
              </button>
            <button className="btn btn-primary next-btn">Next</button>
          </form>
        ) : (
          /* ............................................................................................... */
          <form onSubmit={nextButton}>
            <div className="row">
              <div className="col">
                <div className="mb-4">
                  <label className="form-label">Content/ description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    name="enoticeDesc"
                    onChange={(e) => {
                      setSupport({ ...support, description: e.target.value });
                    }}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label">Delivery Type</label>
                  <select
                    className="form-select"
                    name="deliveryType"
                    onChange={(e) => {
                      setSupport({
                        ...support,
                        deliveryType: e.target.value,
                      });
                    }}
                  >
                    <option selected disabled>
                      Select
                      </option>
                    <option>Express</option>
                    <option>Normal</option>
                  </select>
                </div>
                <div className="mb-5">
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
              <div className="col">
                <div className="mb-4">
                  <label className="form-label">Service name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="serviceName"
                    value={data.serviceName}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <p className="remainder-enotice-label">
                    Remainder e-notice:
                    </p>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="remainderEnotice"
                      onChange={() => {
                        setSupport({ ...support, remainder: "yes" });
                      }}
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="remainderEnotice"
                      onChange={(e) => {
                        setSupport({ ...support, remainder: "no" });
                      }}
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="form-label">Comments</label>
                  <textarea
                    rows="3"
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
                onClick={() => history.push(path + "/date-time")}
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
