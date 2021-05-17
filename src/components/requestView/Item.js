import TextField from '@material-ui/core/TextField';

export default function Item({ title, value, readOnly, setData, name }) {
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
            {/* <input name={name} defaultValue={value} disabled={readOnly} onChange={e => handleChange(e)} /> */}
            <TextField
                    margin="normal"
                    id="name"
                    value={value}
                    onChange={(e) => handleChange(e)}
                    name={name}
                    disabled={readOnly}
                />
        </div>
    );
}