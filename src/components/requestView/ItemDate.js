import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { useState, useEffect } from 'react';

export default function ItemDate({ title, value, readOnly, setData, name }) {

    const [selectedDate, setSelectedDate] = useState(value);

    const handleChange = (e) => {


        setData(prevState => {

            var d = new Date(e)
            var start = new Date(prevState.startTime);
            var end = new Date(prevState.endTime);
            

            return ({
                ...prevState,
                startTime: new Date(d.setHours(start.getHours(),start.getMinutes(),0,0)).toISOString(),
                endTime: new Date(d.setHours(end.getHours(),end.getMinutes(),0,0)).toISOString(),
                date: e.toLocaleString(),
            })
        })


    }

    useEffect(() => {
        setSelectedDate(value);
    }, [value])

    return (

        <div className="requestView_con_item" key="1">
            <p>{title}</p>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
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
