import { useState } from "react";
import "./LoginPage.css";
export default function LoginPage() {
    const [displayedName, setDisplayedName] = useState(null);
    return (
        <div id="login-page-body">
            <div id="login-page-round-background-decoration"></div>
            <div id="login-page-bottom-top-banner-background-decoration"></div>
            <div id="login-page-bottom-bot-banner-background-decoration"></div>
            <div id="login-island">
                <h2>{displayedName ? `Hello ${displayedName}!` : "Member Login"}</h2>
                <Login setDisplayedName={setDisplayedName} />
                <hr />
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">SIGN UP</a>
            </div>
        </div>
    );
}

function Login(props) {
    const setDisplayedName = props.setDisplayedName;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginOnClick = async () => {
        // fetch
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
        })
            .then((res) => res.json())
            .then((json) => {
                window.localStorage.accessToken = json.accessToken;
                window.localStorage.refreshToken = json.refreshToken;
                return fetch(`${process.env.REACT_APP_GATEWAY_URI}/profile/users`, {
                    method: "GET",
                    headers: { Authorization: "Bearer " + json.accessToken },
                });
            })
            .then((res) => res.json())
            .then((json) => setDisplayedName(json.firstName));
    };

    return (
        <div id="login-island-form">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p>Forgot Password? Sucks.</p>
            <button onClick={loginOnClick}>LOG IN</button>
        </div>
    );
}
