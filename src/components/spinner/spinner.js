import React from 'react';
import './spinner.scss';

function Spinner(){
    return(
        <div className="spinner">
            <div className="spinner__overlay"></div>
            <div className="spinner__dots">
                <div className="spinner__dots__dot"></div>
                <div className="spinner__dots__dot"></div>
                <div className="spinner__dots__dot"></div>
            </div>

        </div>
    )
}

export default Spinner;