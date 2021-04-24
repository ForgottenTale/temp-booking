
import React, { useState, useEffect } from 'react';
import './calender.scss';
import DayView from './components/dayView';
import WeekView from './components/weekView';
import MonthView from './components/monthView';
import moment from 'moment';
import { pushEvents } from '../utils/date';
import axios from 'axios';


function Calender({setErr}) {

    const [monthView, setMonthView] = useState(true);
    const [weekView, setWeekView] = useState(false);
    const [dayView, setDayView] = useState(false);
    const [calender, setCalendar] = useState([]);
    const [week, setWeek] = useState([]);
    const [day, setDay] = useState({});
    const [value, setValue] = useState(moment());
    const [dayList, setDayList] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        const url = "http://localhost:5000/api/calendar?month=" + (value.clone().format('M') - 1) + "&year=" + value.clone().format('Y');
        axios.get(url, { withCredentials: true })
            .then((d) => {
                console.log(d)
                setData(d.data);
            })
            .catch(err =>{
                console.error(err);
                
                setErr(err.response.data.error);
            });
    // eslint-disable-next-line
    }, [value])

    useEffect(() => {


        const startDay = value.clone().startOf("month").startOf("week");
        const endDay = value.clone().endOf("month").endOf("week");
        const weekStart = value.clone().startOf('isoweek');
        const currentDay = value.clone().startOf("day");
        const day = startDay.clone().subtract(1, "day");
        const a = [];
        const weekDays = [];
        var temp = [];
        for (let i = 1; i <= value.clone().daysInMonth(); i++) {
            temp.push(i.toString());
        }
        setDayList(temp)

        if (monthView) {

            while (day.isBefore(endDay, "day")) {
                a.push(
                    Array(7).fill(0).map(() => {
                        var d = day.add(1, "day").clone();
                        d.events = pushEvents(d, data);
                        return d;
                    })
                );
            }

            setCalendar(a);

        }

        if (weekView) {
            for (var i = 0; i <= 6; i++) {
                var da = moment(weekStart).add(i, 'days').clone();
                weekDays.push(da);
                weekDays[i].events = pushEvents(da, data)

            }
            setWeek(weekDays);
        }


        if (dayView) {

            var tem = data.filter((Obj) => {
                if (Obj.date.toString() === currentDay.toISOString()) {
                    return Obj
                }
                else {
                    return null
                }

            });

            if (tem.length !== 0) {
                currentDay.events = tem[0].events;
            }
            else {
                currentDay.events = null
            }


            setDay(currentDay);
        }


    }, [value, weekView, monthView, dayView, data])


    const nextMonth = () => {


        if (monthView) {
            return value.clone().add(1, "month");
        }
        if (weekView) {
            return value.clone().add(1, "week");
        }
        if (dayView) {
            return value.clone().add(1, "day");
        }


    }

    const prevMonth = () => {


        if (monthView) {
            return value.clone().subtract(1, "month");
        }
        if (weekView) {
            return value.clone().subtract(1, "week");
        }
        if (dayView) {
            return value.clone().subtract(1, "day");
        }


    }

    const toggleDayView = () => {
        setDayView(true);
        setMonthView(false);
        setWeekView(false);
    }
    const toggleMonthView = () => {
        setDayView(false);
        setMonthView(true);
        setWeekView(false);
    }

    const toggleWeekView = () => {
        setDayView(false);
        setMonthView(false);
        setWeekView(true);
    }


    const monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novemeber", "December"];
    const yearList = ["2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031"];
    
    const handleSelectChange =(e)=>{
        console.log(e.target.value)
        console.log(value.clone().set(e.target.value,"MMMM"));
        setValue(value.clone().set(e.target.value,"MMMM"))
    }
    
    return (
        <div className="calender">
            <div className="calender_menu">
                <h2 className="calender_menu_today">
       
                    <select defaultValue={value.clone().format('D')} onChange={(e)=>handleSelectChange(e)}>
                        {dayList.map((val, key) =>
                            <option value={val} key={key}>{val}</option>
                        )}
                    </select>
                    <select defaultValue={value.clone().format('MMMM')} onChange={(e)=>handleSelectChange(e)}>
                        {monthList.map((val, key) =>
                            <option value={val} key={key} >{val}</option>
                        )}
                    </select>
                    <select defaultValue={value.clone().format('YYYY')} onChange={(e)=>handleSelectChange(e)}>
                        {yearList.map((val, key) =>
                            <option value={val} key={key}>{val}</option>
                        )}
                    </select>
                </h2>
                <div className="calender_menu_buttons">
                    <button className="calender_menu_buttons_button" onClick={() => setValue(prevMonth())}>&#60;</button>
                    <button className="calender_menu_buttons_button" onClick={() => setValue(nextMonth())}>&#62;</button>
                    <button className="calender_menu_buttons_button" onClick={toggleDayView}>Day</button>
                    <button className="calender_menu_buttons_button" onClick={toggleWeekView}>Week</button>
                    <button className="calender_menu_buttons_button" onClick={toggleMonthView}>Month</button>
                </div>
            </div>


            {dayView ? <DayView day={day} /> : null}
            {weekView ? <WeekView days={week} /> : null}
            {monthView ? <MonthView days={calender} /> : null}

        </div>
    );


}


export default Calender