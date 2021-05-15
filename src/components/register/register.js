import './register.scss';
import pic from '../../images/logo2.png';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import { useHistory, useRouteMatch } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
export default function Register({ setErr }) {
    // const{path} = useLocation()
    // console.log(path)
    let initialRender = true;
    const history = useHistory();
    const classes = useStyles();
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPass] = useState("")

    const [equalPass, setEqualPass] = useState(false);
    const [emptyPass1, setEmptyPass1] = useState(false);
    const [emptyPass2, setEmptyPass2] = useState(false);
    const [minLenPass, setMinLenPass] = useState(false);


    useEffect(() => {
//   console.log("Hi")
        if (initialRender) {
            initialRender = false;
        }
        else {

            if(password.length < 8 ){
                setMinLenPass(true)
            }
            else if(password===""){
                setEmptyPass1(true);
            }
            else{
                setMinLenPass(false)
                setEmptyPass1(false)
            }
            // ?  : 
            console.log(password.length)
        }

    }, [password])

    useEffect(() => {
        if (initialRender) {
            initialRender = false;
        }

        else {
            if(password===""){
                setEmptyPass2(true);
            }
            else if(  password !== confirmPassword){
                setEqualPass(true) 
            }
            else{
                setEqualPass(false)
                setEmptyPass2(false);
            }
        }

    }, [confirmPassword])


    const handleSubmit = () => {

        // setErr("done")

        if (password.password === password.confirmPassword && password.password !== "" & password.confirmPassword !== "") {
            setErr("done")
            const url = '';
            const formData = new URLSearchParams();
            formData.append('password', password);

            axios.post(url, formData)
                .then((d) => {
                    if (d.status === 200) {
                        history.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                    setErr(err.response !== undefined ? err.response.data.error : err);

                });
        }

    }
    return (
        <div className="register" >


            <div className="register_con2">
                <h4>Enter a password</h4>
                <div className="register_con2_inputs">
                    <TextField
                        style={{ width: "100%", marginBottom: 30 }}
                        margin="normal"
                        id="filled-basic"
                        name="password"
                        label="Password"
                        type="password"
                        variant="filled"
                        value={password.password}
                        onChange={e => setPassword(e.target.value)}
                        error={equalPass || emptyPass1 || minLenPass}
                        helperText={
                            equalPass ? "Passwords not matching" :
                                emptyPass1 ? "Empty field" :
                                    minLenPass ? "The password length should be atleast 8 character" : ""
                        }

                    />
                    <TextField
                        style={{ width: "100%", marginBottom: 30 }}
                        margin="normal"
                        id="filled-basic"
                        label="Confirm password"
                        type="password"
                        variant="filled"
                        name="confirmPassword"
                        value={password.confirmPassword}
                        onChange={e => setConfirmPass(e.target.value)}
                        error={equalPass || emptyPass1 || emptyPass2 || minLenPass}
                        helperText={
                            equalPass ? "Passwords not matching" :
                                emptyPass1 ? "Empty field" :
                                    minLenPass ? "The password length should be atleast 8 character" : ""
                        }

                    />
                    <Button
                        className={classes.root}
                        style={{ width: "100%", marginBottom: 30 }}
                        onClick={() => { handleSubmit() }}
                    >
                        Submit
                         </Button>
                </div>




            </div>
        </div>
    )
}