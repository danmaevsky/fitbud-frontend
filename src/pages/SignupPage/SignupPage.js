import { useState } from "react";
import "./SignupPage.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authFetch from "helpers/auth/authFetch";
import FormInput from "components/FormInput";

export default function SignupPage() {
    // Component Related States
    const [signupError, setSignupError] = useState(null);
    const [currentSignupForm, setCurrentSignupForm] = useState(0);

    /* Profile Related States */
    // email, password, and confirmPassword (page 1)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // necessary profile parameters (page 2)
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [sex, setSex] = useState("");

    // necessary profile parameters (page 3)
    const [unitPreference, setUnitPreference] = useState("imperial");
    const [heightCm, setHeightCm] = useState("");
    const [startingWeightKg, setStartingWeightKg] = useState("");
    const [startingPercentBodyFat, setStartingPercentBodyFat] = useState("");
    const [activityLevel, setActivityLevel] = useState("");

    // necessary goals (page 4)
    const [goals, setGoals] = useState("");

    const signupForms = [
        <SignupForm1
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
        />,
        <SignupForm2
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            sex={sex}
            setSex={setSex}
        />,
        <SignupForm3
            unitPreference={unitPreference}
            setUnitPreference={setUnitPreference}
            heightCm={heightCm}
            setHeightCm={setHeightCm}
            startingWeightKg={startingWeightKg}
            setStartingWeightKg={setStartingWeightKg}
            startingPercentBodyFat={startingPercentBodyFat}
            setStartingPercentBodyFat={setStartingPercentBodyFat}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
        />,
    ];

    /* Event Handlers */
    const nextOnClick = () => {
        if (currentSignupForm >= signupForms.length - 1) {
            return;
        }

        // Email and Password Page validator
        if (currentSignupForm === 0) {
            if (!ValidateEmail(email)) {
                // don't go to the next page
                setSignupError("Invalid Email Address");
                return;
            }

            if (!ValidatePassword(password)) {
                // don't go to the next page
                setSignupError("Invalid Password");
                return;
            }

            if (password !== confirmPassword) {
                // don't go to the next page
                setSignupError("Passwords do not match");
                return;
            }

            setSignupError(null);
        }

        setCurrentSignupForm(currentSignupForm + 1);
        return;
    };

    const backOnClick = () => {
        if (currentSignupForm <= 0) {
            return;
        }

        setCurrentSignupForm(currentSignupForm - 1);
    };

    return (
        <div id="signup-page-body">
            <div id="signup-page-round-background-decoration"></div>
            <div id="signup-page-bottom-top-banner-background-decoration"></div>
            <div id="signup-page-bottom-bot-banner-background-decoration"></div>
            <div id="signup-island">
                <div id="signup-island-header">
                    <h2>Member Signup</h2>
                    {signupError ? (
                        <p id="signup-message-error">{signupError}</p>
                    ) : currentSignupForm === 0 ? (
                        <p id="signup-now-message">Start tracking your health now!</p>
                    ) : null}
                </div>
                {signupForms[currentSignupForm]}
                <div id="signup-nav-buttons">
                    {currentSignupForm > 0 ? <button onClick={backOnClick}>Back</button> : null}
                    <button onClick={nextOnClick}>Next</button>
                </div>
                <IndicatorDots currentSignupForm={currentSignupForm} numForms={signupForms.length} />
            </div>
        </div>
    );
}

function SignupForm1(props) {
    const { email, setEmail, password, setPassword, confirmPassword, setConfirmPassword } = props;

    return (
        <div id="signup-form-1" className="signup-island-form">
            <FormInput type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormInput
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <FormInput
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
        </div>
    );
}

function SignupForm2(props) {
    return <div>Signup 2</div>;
}

function SignupForm3(props) {}

function IndicatorDots(props) {
    const { currentSignupForm, numForms } = props;
    let circles = [];
    let rNormal = 2;
    let rCurrent = 3;
    let gap = 6;
    for (let i = 0; i < numForms; i++) {
        let cx;
        if (i < currentSignupForm) {
            cx = rNormal + i * gap;
        } else if (i === currentSignupForm) {
            cx = rNormal + i * gap + rCurrent - rNormal;
        } else {
            cx = rNormal + i * gap + 2 * (rCurrent - rNormal);
        }
        let cy = rCurrent;
        let r = i === currentSignupForm ? rCurrent : rNormal;
        let circleClass = i === currentSignupForm ? "signup-indicator-dot-current" : "signup-indicator-dot-default";
        circles.push(<circle key={"indicator-dot" + i} className={circleClass} r={r} cx={cx} cy={cy} />);
    }

    return (
        <svg id="signup-indicator-dots" viewBox={`0 0 ${(numForms - 1) * gap + 2 * rCurrent} ${rCurrent * 2}`}>
            {circles}
        </svg>
    );
}

function ValidatePassword(password) {
    const passcheck = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#$%&*.])[A-Za-z0-9!.@#$%&*.]{8,}$/);
    return passcheck.test(password);
}

function ValidateEmail(email) {
    const emailcheck = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return emailcheck.test(email);
}
