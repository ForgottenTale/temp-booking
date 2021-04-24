import './userView.scss';
import pic from '../../images/pic3.jpg';


export default function User({ user, type }) {

    return (
        <div className="user">

            <div className="user_pic">
                <img src={pic} alt="user_pic" />
                <h6>{user.name}</h6>

            </div>

            <div className="user_details">
                <div className="user_details_con" >
                    <div className="user_details_con_item">
                        <p className="user_details_con_item_title">Name</p>
                        <p className="user_details_con_item_value">{user.name}</p>
                    </div>
                    <div className="user_details_con_item">
                        <p className="user_details_con_item_title">Email</p>
                        <p className="user_details_con_item_value">{user.email}</p>
                    </div>
                </div>
                <div className="user_details_con" >
                    <div className="user_details_con_item">
                        <p className="user_details_con_item_title">Phone</p>
                        <p className="user_details_con_item_value">{user.phone}</p>
                    </div>

                    <div className="user_details_con_item">
                        <p className="user_details_con_item_title">Role</p>
                        <p className="user_details_con_item_value">{user.role.replace('_'," ").toLowerCase()}</p>
                    </div>





                </div>

            </div>
        </div>
    );
}
