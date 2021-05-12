import './register.scss';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
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
export default function Register() {
    const history = useHistory();
    const classes = useStyles();
    const [password, setPassword] = useState({
        password: "",
        confirmPassword: ""
    })

    const handleChange = (e) => {

        setPassword(prevState => {
            return {
                ...prevState,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleSubmit = () => {
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
                
            });

        
}
return (
    <div className="register">


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
                    onChange={e => handleChange(e)}
                    error={password.password === ""}
                    helperText={password.password === "" ? 'Empty field!' : ' '}

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
                    onChange={e => handleChange(e)}
                    error={password.confirmPassword  === ""}
                    helperText={password.confirmPassword === "" ? 'Empty field!' : ' '}

                />
                <Button
                    className={classes.root}
                    style={{ width: "100%", marginBottom: 30 }}
                    onClick={()=>{handleSubmit()}}
                >
                    Submit
                         </Button>
            </div>




        </div>
    </div>
)
}