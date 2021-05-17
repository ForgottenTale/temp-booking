import './forgotPass.scss';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Button } from '@material-ui/core';
import axios from 'axios';
import mail from '../../images/mail.jpg';
import { useEffect, useState, useRef } from 'react';
import logo from '../../images/logo2.png'

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
        padding: '0 30px',
    },
});
export default function ForgotPass({ setErr }) {

    const classes = useStyles();
    const [email, setEmail] = useState("")
    const [empty, setEmpty] = useState(false);
    const [valEmail,setValEmail] = useState(false);
    const initialRender = useRef(true)
    const [msg, SetMsg] = useState(false)
    const [loading,setLoading] = useState(false);
    
    function ValidateEmail(mail) 
    {
     if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
      {
        return (true)
        
      }
      else{
        return (false)
      }
        
       
    }
   
   
    useEffect(() => {
        setValEmail(false);
        if (initialRender.current === true) {
            initialRender.current = false
        }
        else {
            if (email !== "") {
                setEmpty(false)
            }
        }
    }, [email])

    const handleKeyPress = (event) => {

        event.preventDefault();
        if (event.key === 'Enter') {
            console.log("hi")
        }
    }


    const handleSubmit = () => {
       
        if(ValidateEmail(email)){
            if (email !== "") {
                setLoading(true);

                const url = '/api/forgot-password/';
                const formData = new URLSearchParams();
                formData.append('email', email);
    
                axios.post(url, formData)
                    .then((d) => {
                        if (d.status === 200) {
                            SetMsg(true);
                            setLoading(false)
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        setErr(err.response !== undefined ? err.response.data.error : err);
                        setLoading(false)
                    });
            }
            else {
                setEmpty(true)
            }
        }
        else{
            setValEmail(true)
        }


    }
    return (
        <div className="register">


            <div className="register_con2">

                {msg?<img src={mail} alt="mail"/>:<img src={logo} alt="logo"/>}
                {!msg?<h4>Enter your Email</h4>:<h4>A reset link has been sent to your email if you have an account </h4>}
                {!msg ? <div className="register_con2_inputs">
                    <TextField
                        style={{ width: "100%", marginBottom: 30 }}
                        margin="normal"
                        id="filled-basic"
                        name="email"
                        label="Email"
                        type="email"
                        required
                        variant="filled"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        error={empty||valEmail}
                        helperText={empty ? "Empty field" :valEmail?"Invalid Email" :""}


                    />

                    <Button
                        className={classes.root}
                        style={{ width: "100%", marginBottom: 30 }}
                        onClick={() => { handleSubmit() }}
                        onKeyDown={e => handleKeyPress(e)}
                        disabled={loading}
                    >
                           {loading? <CircularProgress size={14} />:"Submit"}
                         </Button>
                </div>
                    : null}



            </div>

        </div>
    )
}