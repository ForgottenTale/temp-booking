
import './modal.scss';

export default function Modal({ title,setModal,handleSubmit }) {

  return (
    <div className="modal ">
      <div className="modal_overlay" onClick={()=>setModal(false)}>

      </div>
      <div className="modal_con">
        <h4>{title} ?</h4>
        <div className="modal_con_buttons">
            <button onClick={()=>handleSubmit()}>Yes</button>
            <button onClick={()=>setModal(false)}>No</button>
        </div>
      </div>

    </div>
  )
}