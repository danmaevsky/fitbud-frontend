import { useState } from "react";
import "./ProfilePage.css";
import { authFetch } from "helpers/authHelpers";
import { useNavigate } from "react-router-dom";
export default function ProfilePage() {
  const [title, setTitle] = useState("Enter your Email to Reset Password");
  return (
    <div id="signup-page-body">
      <div className="profile-background-round round-background-decoration"></div>
      <div className="profile-background-top-banner bottom-top-banner-background-decoration"></div>
      <div className="profile-background-bottom-banner bottom-bot-banner-background-decoration"></div>
      <div id="signup-island">
        <div id="signup-island-header">
          <h2>{title}</h2>
        </div>
        <ProfilePic setTitle={setTitle} />
      </div>
    </div>
  );
}

function ProfilePic(props) {
  const navigate = useNavigate();
  const { setTitle } = props;
  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive login button spam

  const [email, setEmail] = useState("");

  const handleResponse = (res) => {
    if (res.status === 200) {
      setTitle("Reset Link has been Sent!");
      return res.json();
    }

    // best way to cancel a Promise chain is to throw an error
    if (res.status === 400) {
      setTitle("User does not exist");
      throw new Error(400);
    }

    if (res.status === 500) {
      setTitle("Something went Wrong");
      console.log(res);
      throw new Error(500);
    }
  };

  const getProfilePic = async () => {
    if (isAttemptingFetch) {
      return;
    }
    setIsAttemptingFetch(true);

    authFetch(
      `${process.env.REACT_APP_GATEWAY_URI}/profile/profilePicture`,
      {
        method: "GET",
      },
      navigate
    )
      .then(handleResponse)
      .then((imageLink) => imageLink.data)
      .catch((err) => {
        console.log(err);
        setIsAttemptingFetch(false);
      });
  };

  return <div id="signup-island-form"></div>;
}
