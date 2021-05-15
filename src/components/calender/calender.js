
import React, { useState, useEffect, useRef } from 'react';
import './calender.scss';
import DayView from './components/dayView';
import WeekView from './components/weekView';
import MonthView from './components/monthView';
import moment from 'moment';
import { pushEvents } from '../utils/date';
import axios from 'axios';



function Calender({ setErr }) {

    const ref = useRef()
    const [monthView, setMonthView] = useState(window.outerWidth <= 786 ? false : true);
    const [weekView, setWeekView] = useState(false);
    const [dayView, setDayView] = useState(window.outerWidth <= 786 ? true : false);
    const [calender, setCalendar] = useState([]);
    const [week, setWeek] = useState([]);
    const [day, setDay] = useState({});
    const [value, setValue] = useState(moment());
    const [mobileView, setMobileView] = useState(window.outerWidth <= 786 ? true : false)
    const [titleWidth, setTitleWidth] = useState({ display: "none" });
    const [dayBodyWidth, setdayBodyWidth] = useState({ display: "none" });
    // const [dayList, setDayList] = useState([]);
    const [data, setData] = useState([
        {

            "id": 1,
            "serviceName": "webex",
            "title": "SpaceX",
            "description": "This is a test",
            "img": "1619278428240ms-homepage-desktop.jpg",
            "comments": null,
            "startTime": "2021-05-14T03:30:00.000Z",
            "endTime": "2021-05-14T04:30:00.000Z",
            "speakerName": "Elon musk",
            "speakerEmail": "elonmusck@ieee.org",
            "coHosts": "[[\"dsf\", \"sdfsd\"]]",
            "type": "online_meeting"


        },
        {

            "id": 2,
            "serviceName": "zoom",
            "title": "A very important job sadasdasdasdasdasdasdasda",
            "description": "This is asking for intern support",
            "img": "1619292671235ms-homepage-desktop.jpg",
            "comments": "nothing to say",
            "startTime": "2021-05-24T18:30:00.000Z",
            "endTime": "2021-05-24T05:30:00.000Z",
            "speakerName": "Arundhathi",
            "speakerEmail": "arundhathi@gmail.com",
            "coHosts": null,
            "type": "online_meeting"


        }
    ]);

    useEffect(() => {
        const url = "/api/calendar?month=" + (value.clone().format('M') - 1) + "&year=" + value.clone().format('Y');
        axios.get(url, { withCredentials: true })
            .then((d) => {
                setData(d.data);
            })
            .catch(err => {
                console.error(err);
                setErr(err.response.data.error||err);
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
        // var temp = [];
        // for (let i = 1; i <= value.clone().daysInMonth(); i++) {
        //     temp.push(i.toString());
        // }
        // setDayList(temp)

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
            console.log(currentDay)
            var tem = data.filter((Obj) => {
                if (new Date(Obj.startTime).toDateString() === currentDay._d.toDateString()) {
                    return Obj
                }
                else {
                    return null
                }

            });

            if (tem.length !== 0) {
                currentDay.events = tem;
            }
            else {
                currentDay.events = null
            }


            setDay(currentDay);
        }


    }, [value, weekView, monthView, dayView, data])


    useEffect(() => {
        var width = ref.current.clientWidth - (7 * 4)
        console.log(window.outerHeight)
        var height = window.outerHeight - 177.2
        setTitleWidth({ maxWidth: width / 7 })
        setdayBodyWidth({ maxWidth: width / 7, height: height / 6 })


        const handleResize = () => {
            width = ref.current.clientWidth - (7 * 4)
            height = window.outerHeight - 177.2
            setTitleWidth({ maxWidth: width / 7 })
            setdayBodyWidth({ maxWidth: width / 7, height: height / 6 })

            if (window.outerWidth <= 786) {
                setDayView(true);
                setMonthView(false);
                setWeekView(false);
                setMobileView(true);
            } else if (window.outerWidth >= 786) {
                setDayView(false);
                setMonthView(true);
                setWeekView(false);
                setMobileView(false);
            }
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])


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

    console.log(calender)


    return (
        <div className="calender" ref={ref}>

            <div className="calender_menu">
                <h2 className="calender_menu_today">
                    {/* 
                    <select value={value.clone().format('D')} onChange={(e) => setValue(value.clone().day(e.target.value))}>
                        {dayList.map((val, key) =>
                            <option value={val} key={key}>{val}</option>
                        )}
                    </select> */}
                    <select value={value.clone().format('MMMM')} onChange={(e) => setValue(value.clone().month(e.target.value))}>
                        {monthList.map((val, key) =>
                            <option value={val} key={key} >{val}</option>
                        )}
                    </select>
                    <select value={value.clone().format('YYYY')} onChange={(e) => setValue(value.clone().year(e.target.value))}>
                        {yearList.map((val, key) =>
                            <option value={val} key={key}>{val}</option>
                        )}
                    </select>
                    {/* {value.format("MMMM")} {value.format("YYYY")} */}
                </h2>
                <div className="calender_menu_buttons">
                    <button className="calender_menu_buttons_button" onClick={() => setValue(prevMonth())}>&#60;</button>
                    <button className="calender_menu_buttons_button" onClick={() => setValue(nextMonth())}>&#62;</button>
                    {mobileView ? null :
                        <>
                            <button className="calender_menu_buttons_button" onClick={toggleDayView}>Day</button>
                            <button className="calender_menu_buttons_button" onClick={toggleWeekView}>Week</button>
                            <button className="calender_menu_buttons_button" onClick={toggleMonthView}>Month</button>
                        </>}
                </div>
            </div>


            {dayView ? <DayView day={day} /> : null}
            {weekView ? <WeekView days={week} /> : null}
            {monthView ? <MonthView days={calender} tileStyle={titleWidth} dayBodyWidth={dayBodyWidth} /> : null}

        </div>
    );


}


export default Calender