export default function ItemTextArea({ title, value, readOnly, setData }) {
    const handleChange = (e) =>


        setData(prevState => {
            return ({
                ...prevState,
                [e.target.name]: e.target.value
            })
        })


    return (
        <div className="requestView_con_item" key="1">
            <p>{title}</p>
            <textarea defaultValue={value} disabled={readOnly} onChange={e => handleChange(e)} />
        </div>
    );
}