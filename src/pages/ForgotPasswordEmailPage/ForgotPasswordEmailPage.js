import { useState } from "react";
import "./ForgotPasswordEmail.css";
import FormInput from "components/FormInput";
export default function ForgotPasswordEmailPage() {
  const [title, setTitle] = useState("Enter your Email to Reset Password");
  return (
    <div id="signup-page-body">
      <div className="default-background-round round-background-decoration"></div>
      <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
      <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
      <div id="signup-island">
        <div id="signup-island-header">
          <h2>{title}</h2>
        </div>
        <ForgotPasswordEmail setTitle={setTitle} />
      </div>
    </div>
  );
}

function ForgotPasswordEmail(props) {
  const { setTitle } = props;
  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive login button spam

  const [email, setEmail] = useState("");

  const handleResponse = (res) => {
    if (res.status === 201) {
      setTitle("Reset Link has been Sent!");
      return res.json();
    }

    // best way to cancel a Promise chain is to throw an error
    if (res.status === 404) {
      setTitle("User does not exist");
      throw new Error(400);
    }

    if (res.status === 500) {
      setTitle("Something went wrong");
      throw new Error(500);
    }
  };

  const sendEmailOnClick = async () => {
    if (isAttemptingFetch) {
      return;
    }
    setIsAttemptingFetch(true);
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
  };

  return (
    <div id="signup-island-form">
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
    </div>
  );
}
