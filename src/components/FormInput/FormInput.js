import "./FormInput.css";

export default function FormInput(props) {
    return (
        <div className="form-input">
            <label>{props.placeholder}</label>
            <input {...props} />
        </div>
    );
}
