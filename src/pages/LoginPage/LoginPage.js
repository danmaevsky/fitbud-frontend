import { useState } from "react";
import "./LoginPage.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authFetch from "helpers/auth/authFetch";
import FormInput from "components/FormInput";
export default function LoginPage() {
    const [title, setTitle] = useState(null);
    const [message, setMessage] = useState("Login or Sign Up to get started!");
    const [loginError, setLoginError] = useState(false);
    return (
        <div id="login-page-body">
            <div id="login-page-round-background-decoration"></div>
            <div id="login-page-bottom-top-banner-background-decoration"></div>
            <div id="login-page-bottom-bot-banner-background-decoration"></div>
            <div id="login-island">
                <div id="login-island-header">
                    <h2>{title ? `${title}` : "Member Login"}</h2>
                    <p id={loginError ? "login-message-error" : "login-message"}>{message}</p>
                </div>
                <Login setTitle={setTitle} setMessage={setMessage} setLoginError={setLoginError} />
            </div>
        </div>
    );
}

function Login(props) {
    const { setTitle, setMessage, setLoginError } = props;
    const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive login button spam

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const handleResponse = (res) => {
        if (res.status === 200) {
            setLoginError(false);
            return res.json();
        }

        // best way to cancel a Promise chain is to throw an error
        if (res.status === 400) {
            setMessage("Enter a valid email and password!");
            throw new Error(400);
        }

        if (res.status === 401) {
            setMessage("Email and/or password is wrong!");
            throw new Error(401);
        }
    };

    const loginOnClick = async () => {
        if (isAttemptingFetch) {
            return;
        }
        setIsAttemptingFetch(true);
        setLoginError(false);
        setMessage("Logging in...");
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
        })
            .then(handleResponse)
            .then((json) => {
                window.localStorage.accessToken = json.accessToken;
                window.localStorage.refreshToken = json.refreshToken;
                return authFetch(
                    `${process.env.REACT_APP_GATEWAY_URI}/profile/users`,
                    {
                        method: "GET",
                        // headers: { Authorization: "Bearer " + json.accessToken },
                    },
                    navigate
                );
            })
            .then((res) => res.json())
            .then((json) => {
                window.localStorage.profile = JSON.stringify(json);
                setTitle(`Hello ${json.firstName}!`);
                setMessage("Logged in successfully!");
                setIsAttemptingFetch(false);
                if (location.state && location.state.from) {
                    navigate(location.state.from.pathname, { replace: true });
                } else {
                    navigate("/dashboard");
                }
            })
            .catch((err) => {
                console.log(err);
                setLoginError(true);
                setIsAttemptingFetch(false);
            });
    };

    return (
        <div id="login-island-form">
            <FormInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        loginOnClick();
                    }
                }}
            />
            <FormInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        loginOnClick();
                    }
                }}
            />
            <p>Forgot Password? Sucks.</p>
            <div id="login-page-buttons">
                <button onClick={loginOnClick}>LOG IN</button>
                <hr />
                <Link to="/signup">SIGN UP</Link>
            </div>
        </div>
    );
}
