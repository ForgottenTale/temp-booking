
import './error.scss';



export default function Error({ msg }) {

    return (
        <div className="error">
            <span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-x-circle"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M15 9L9 15"></path>
                    <path d="M9 9L15 15"></path>
                </svg>&nbsp;Error&nbsp;:</span>
            <p>{String(msg)}</p>
        </div>)
}