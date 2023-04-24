import { useState, useEffect } from "react";
import "./ForgotPasswordPassword.css";
import FormInput from "components/FormInput";
import { useParams } from "react-router-dom";

export default function ForgotPasswordPasswordPage() {
  const { userId, token } = useParams();
  const [title, setTitle] = useState("Reset Password");
  const [message, setMessage] = useState(null);

  return (
    <div id="reset-password-page-body">
      <div className="profile-background-round round-background-decoration"></div>
      <div className="profile-background-top-banner bottom-top-banner-background-decoration"></div>
      <div className="profile-background-bottom-banner bottom-bot-banner-background-decoration"></div>
      <div id="reset-password-island">
        <div id="reset-password-island-header">
          <h2>{title}</h2>
          <p id="reset-password-message">{message}</p>
        </div>
        <ForgotPasswordVerifyToken
          setTitle={setTitle}
          setMessage={setMessage}
          userId={userId}
          token={token}
        />
      </div>
    </div>
  );
}

function ForgotPasswordVerifyToken(props) {
  const { setTitle, userId, token, setMessage } = props;
  const [isAttemptingVerifyFetch, setIsAttemptingVerifyFetch] = useState(false); // prevent excessive reset-password button spam
  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive reset-password button spam

  const [isTokenVerified, setIsTokenVerified] = useState(false);
  //const [triedVerify, setTriedVerify] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleVerifyResponse = (res) => {
    if (res.status === 200) {
      setIsTokenVerified(true);
      return res.json();
    }

    // best way to cancel a Promise chain is to throw an error
    if (res.status === 401) {
      setTitle("Reset Link is Not Valid");
      setMessage("Send Another Reset Request");
      setIsTokenVerified(false);
      throw new Error(400);
    }

    if (res.status === 500) {
      setTitle("Something went wrong");
      setIsTokenVerified(false);
      throw new Error(500);
    }
  };

  const verifyToken = async () => {
    if (isAttemptingVerifyFetch) {
      return;
    }
    setIsAttemptingVerifyFetch(true);

    fetch(
      `${process.env.REACT_APP_GATEWAY_URI}/account/forgotPassword/${userId}/${token}`,
      {
        method: "GET",
      }
    )
      .then(handleVerifyResponse)
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
        setIsAttemptingVerifyFetch(false);
      });
  };

  const handleUpdatePasswordResponse = (res) => {
    if (res.status === 201) {
      setMessage("Password Successfully Updated");
      return res.json();
    }

    // best way to cancel a Promise chain is to throw an error
    if (res.status === 401) {
      setTitle("Link is no Longer Valid");
      setMessage("Send Another Reset Request");
      setIsAttemptingFetch(true);
      throw new Error(400);
    }
    if (res.status === 400) {
      setTitle("Password is not Valid. Please double check both fields");
      setIsAttemptingFetch(false);
      throw new Error(400);
    }
  };

  const updatePasswordOnClick = async () => {
    if (isAttemptingFetch) {
      return;
    }
    setIsAttemptingFetch(true);
    const passcheck = new RegExp(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#$%&*.])[A-Za-z0-9!.@#$%&*.]{8,}$/
    );
    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords Do Not Match");
      setIsAttemptingFetch(false);
    } else if (!passcheck.test(newPassword)) {
      setMessage(
        "New password must be at least 8 characters long and contain at least one uppercase letter, number, and special character"
      );
      setIsAttemptingFetch(false);
    } else {
      fetch(
        `${process.env.REACT_APP_GATEWAY_URI}/account/forgotPassword/${userId}/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
          }),
        }
      )
        .then(handleUpdatePasswordResponse)
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
          setIsAttemptingFetch(false);
        });
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  if (isTokenVerified) {
    return (
      <div id="reset-password-island-form">
        <FormInput
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updatePasswordOnClick();
            }
          }}
        />
        <FormInput
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updatePasswordOnClick();
            }
          }}
        />
        <div id="reset-password-page-buttons">
          <button onClick={updatePasswordOnClick}>Reset Password</button>
        </div>
      </div>
    );
  } else {
    return;
  }
}
