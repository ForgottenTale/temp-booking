import { useState, useEffect } from 'react';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';

export default function ItemTime({ title, value, readOnly, setData, name }) {

    const [selectedDate, setSelectedDate] = useState(value);

    const handleChange = (e) => {
        setData(prevState => {
            return ({
                ...prevState,
                [name]: e.toISOString(),
                date: e.toISOString(),
            })
        })
    }

    useEffect(() => {
        setSelectedDate(value)
    }, [value])


    return (
        <div className="requestView_con_item" key="1">

            <p>{title}</p>
    
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardTimePicker
                    margin="normal"
                    id="time-picker"
                    value={selectedDate}
                    onChange={(e) => handleChange(e)}
                    name={name}
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                    }}
                    disabled={readOnly}
                />
            </MuiPickersUtilsProvider>

        </div>
    );

}