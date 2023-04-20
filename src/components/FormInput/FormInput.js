import "./FormInput.css";

export default function FormInput(props) {
    return (
        <div className="form-input" tabIndex="0">
            <label>{props.placeholder}</label>
            <input {...props} />
        </div>
    );
}
