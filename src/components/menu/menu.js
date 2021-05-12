import './menu.scss';
import logo from '../../images/logo.png';
import { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';


export default function Menu({ toggle, state, setActiveComponent, role, user, ou, setOU }) {

    const ref = useRef();
    const [open, setOpen] = useState(true);

    const handleOUChange = (e) => {

        var selectedOU = user.ou.filter((ou) =>
            ou.name === e.target.value ? ou : null

        )
        setOU(selectedOU[0])
    }

    return (
        <div className={open ? "menu open" : "menu"} ref={ref}>
            <div className="menu_item">
                <img src={logo} alt="logo" />
            </div>

            <select className="menu_select" defaultValue={ou} onChange={(e) => handleOUChange(e)}>
                {user.ou !== undefined && user.ou !== null && user.ou.length > 1 ? user.ou.map((ou, i) => <option key={i} id={i}>{ou.name}</option>) : null}
            </select>
            <NavLink to="/dashboard" className="menu_item" activeClassName="active" onClick={() => setActiveComponent("Dashboard")} exact >
                <div className="menu_item_deo"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-clipboard"
                    viewBox="0 0 24 24"
                >
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                </svg>
                <p className={open ? "menu_item_name open" : "menu_item_name"}>Dashboard</p>
            </NavLink>

            <NavLink to={"/calendar"} className="menu_item" activeClassName="active" onClick={() => setActiveComponent("Calendar")}>
                <div className="menu_item_deo"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-calendar"
                    viewBox="0 0 24 24"
                >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <path d="M16 2L16 6"></path>
                    <path d="M8 2L8 6"></path>
                    <path d="M3 10L21 10"></path>
                </svg>
                <p className={open ? "menu_item_name open" : "menu_item_name"}>Calendar</p>
            </NavLink>
            {role === "Admin" ? [<NavLink key="1" to="/requests" className="menu_item" activeClassName="active" onClick={() => setActiveComponent("Requests")}>
                <div className="menu_item_deo"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-layers"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2L2 7 12 12 22 7 12 2z"></path>
                    <path d="M2 17L12 22 22 17"></path>
                    <path d="M2 12L12 17 22 12"></path>
                </svg>
                <p className={open ? "menu_item_name open" : "menu_item_name"}>Requests</p>
            </NavLink>,
            <NavLink key="2" to="/users" className="menu_item" activeClassName="active" onClick={() => setActiveComponent("Users")}>
                <div className="menu_item_deo"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-user"
                    viewBox="0 0 24 24"
                >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p className={open ? "menu_item_name open" : "menu_item_name"}>Users</p>
            </NavLink>] : null
            }

            <NavLink to="/settings" className="menu_item" activeClassName="active" onClick={() => setActiveComponent("Settings")}>
                <div className="menu_item_deo"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-settings"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                </svg>
                <p className={open ? "menu_item_name open" : "menu_item_name"}>Settings</p>
            </NavLink>
            <div className="menu_item" onClick={() => {
                toggle(!state)
                setOpen(!state)
            }
            }>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-fast-forward"
                    viewBox="0 0 24 24"
                >
                    <path d="M13 19L22 12 13 5 13 19z"></path>
                    <path d="M2 19L11 12 2 5 2 19z"></path>
                </svg>
                <p className={open ? "menu_item_name open" : "menu_item_name"}>Collapse</p>
            </div>

        </div>
    );

}