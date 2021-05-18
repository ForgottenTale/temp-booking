import './feedback.scss';
import Select from 'react-select'
import { useState } from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import axios from 'axios';
import support from '../../images/support.jpg'
import send from '../../images/send.jpg'

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
        color: 'white',
        height: 48,
        width: 60,
        padding: '0 30px',
    },
});

export default function Feedback({ setErr }) {
    const classes = useStyles();
    const [type, setType] = useState({ value: "", label: "" })
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [data, setData] = useState({
        type: "",
        message: "",
        file: ""
    })

    const options = [
        { value: "Problems", label: "Problems" },
        { value: "Questions", label: "Questions" },
        { value: "Incident", label:"Incident" },
        { value: "Feature request", label: "Feature request" },
    ]
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: '#fff',
            borderColor: '#9e9e9e',
            minHeight: '30px',
            height: '30px',
            boxShadow: state.isFocused ? null : null,
        }),

        valueContainer: (provided, state) => ({
            ...provided,
            height: '30px',
            padding: '0 6px'
        }),

        input: (provided, state) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: state => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: '30px',
        }),
    };

    const handleSubmit = () => {
        if (data.type !== "" && data.message !== "") {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const formData = new FormData();
            const length = keys.length;

            for (let i = 0; i < length; i++) {
                formData.append(keys[i], values[i]);
            }

            handleUpload(formData);

            console.log(Array.from(formData));
        }

    };

    const handleUpload = async (data) => {
        try {
            setLoading(true);
            const url = "/api/feedback";
            const res = await axios.post(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            if (res.status === 200) {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setErr(err.response.data.error);
        }
    };
    return (
        <div className="feedback">
            {!done ? <div>
                <img src={support} alt="support" />
                <h4>Your opinion matters to us!</h4>
                <p>Type *</p>
                <Select
                    className="select"
                    value={type}
                    options={options}
                    onChange={(e) => {
                        setType(e)
                        setData((prevState) => {
                            return {
                                ...prevState,
                                type: e.value
                            }
                        })
                    }}
                    styles={customStyles} />
                <p>Message *</p>
                <textarea onChange={(e) => {

                    setData((prevState) => {
                        return {
                            ...prevState,
                            message: e.target.value
                        }
                    })
                }}></textarea>
                <p>Upload a screenshot (if any)</p>
                <input type="file" />
                <Button
                    className={classes.root}
                    style={{ width: "100%", marginBottom: 30 }}
                    onClick={() => { handleSubmit() }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={14} /> : "Submit"}
                </Button></div> :
                <>
                    <img src={send} alt="support" />
                    <h4>Feedback recieved.Our team will be looking into it</h4>
                </>
            }

        </div>
    );
}