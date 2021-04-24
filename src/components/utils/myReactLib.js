
import './myReactLib.scss';

export function Input({ label }) {

    return (<div className="inputTag">
        <input />
        <label><span>{label}</span></label>
    </div>

    )
}

export function Input2({ onChange, placeholder }) {

    return (
        <div className="inputTag2">
            <label>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="feather feather-search"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21L16.65 16.65"></path>
                </svg>
            </label>
            <input className="inputTag2_input" type="text" placeholder ={placeholder} onChange={onChange}/>

        </div>
    )
}

