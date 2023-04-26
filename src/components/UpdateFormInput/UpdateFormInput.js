import "./UpdateFormInput.css";

export default function UpdateFormInput(props) {
    return (
        <div className="form-input">
            <label>{props.label}</label>
            <input {...props} />
        </div>
    );
}
