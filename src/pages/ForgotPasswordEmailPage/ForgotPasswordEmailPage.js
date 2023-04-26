import { useState } from "react";
import "./ForgotPasswordEmail.css";
import FormInput from "components/FormInput";
export default function ForgotPasswordEmailPage() {
    const [title, setTitle] = useState("Enter your Email to Reset Password");
    const [message, setMessage] = useState(null);
    return (
        <div id="send-reset-email-page-body">
            <div className="profile-background-round round-background-decoration"></div>
            <div className="profile-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="profile-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="send-reset-email-island">
                <div id="send-reset-email-island-header">
                    <h2>{title}</h2>
                    <p id="send-reset-email-message">{message}</p>
                </div>
                <ForgotPasswordEmail setTitle={setTitle} setMessage={setMessage} />
            </div>
        </div>
    );
}

function ForgotPasswordEmail(props) {
    const { setTitle, setMessage } = props;
    const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive send-reset-email button spam

    const [email, setEmail] = useState("");

    const handleResponse = (res) => {
        if (res.status === 201) {
            setMessage("Reset Link has been Sent! Please check your spam if you do not see the email");
            return res.json();
        }

        // best way to cancel a Promise chain is to throw an error
        if (res.status === 404) {
            setMessage("User does not exist");
            throw new Error(400);
        }

        if (res.status === 500) {
            setTitle("Something went Wrong");
            console.log(res);
            throw new Error(500);
        }
    };

    const sendEmailOnClick = async () => {
        if (isAttemptingFetch) {
            return;
        }
        setIsAttemptingFetch(true);
        const emailcheck = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        if (!emailcheck.test(email)) {
            setMessage("Please Enter a Valid Email");
            setIsAttemptingFetch(false);
        } else {
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/forgotPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email }),
            })
                .then(handleResponse)
                .then((res) => res.json())
                .catch((err) => {
                    console.log(err);
                    setIsAttemptingFetch(false);
                });
        }
    };

    return (
        <div id="send-reset-email-island-form">
            <FormInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendEmailOnClick();
                    }
                }}
            />
            <div id="send-reset-email-page-buttons">
                <button onClick={sendEmailOnClick}>Send Email</button>
            </div>
        </div>
    );
}
