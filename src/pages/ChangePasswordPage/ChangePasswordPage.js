import { useState, useEffect } from "react";
import "./ChangePassword.css";
import FormInput from "components/FormInput";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "helpers/authHelpers";

export default function ChangePasswordPage() {
  const { userId, token } = useParams();
  const [title, setTitle] = useState("Change Password");
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
  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive reset-password button spam

  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const navigate = useNavigate();

  const handleUpdatePasswordResponse = (res) => {
    if (res.status === 201) {
      setMessage("Password Successfully Updated");
      return res.json();
    }

    // best way to cancel a Promise chain is to throw an error
    if (res.status === 401) {
      setMessage("Unauthorized");
      setIsAttemptingFetch(false);
      throw new Error(401);
    }
    if (res.status === 400) {
      setMessage("The Current Password is Incorrect");
      setIsAttemptingFetch(false);
      throw new Error(400);
    }
    if (res.status === 500) {
      setMessage("Something went wrong. Try Again Later!");
      setIsAttemptingFetch(false);
      throw new Error(500);
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
      setMessage("New Passwords Do Not Match");
      setIsAttemptingFetch(false);
    } else if (!passcheck.test(newPassword)) {
      setMessage(
        "New password must be at least 8 characters long and contain at least one uppercase letter, number, and special character"
      );
      setIsAttemptingFetch(false);
    } else {
      authFetch(`${process.env.REACT_APP_GATEWAY_URI}/account/changePassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currPassword: currPassword,
          newPassword: newPassword,
          confirmNewPassword: confirmNewPassword,
        }),
        navigate,
      })
        .then(handleUpdatePasswordResponse)
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
          setIsAttemptingFetch(false);
        });
    }
  };

  return (
    <div id="reset-password-island-form">
      <FormInput
        type="password"
        placeholder="Current Password"
        value={currPassword}
        onChange={(e) => setCurrPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updatePasswordOnClick();
          }
        }}
      />
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
        <button onClick={updatePasswordOnClick}>Change Password</button>
      </div>
    </div>
  );
}
