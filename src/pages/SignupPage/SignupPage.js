import { useState } from "react";
import "./SignupPage.css";
import { Form, Link, useLocation, useNavigate } from "react-router-dom";
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
    const [birthdate, setBirthdate] = useState("");
    console.log(birthdate);
    const [sex, setSex] = useState("male");

    // necessary profile parameters (page 3)
    const [unitPreference, setUnitPreference] = useState("imperial");
    const [height, setHeight] = useState("");
    const [startingWeight, setStartingWeight] = useState("");
    const [startingPercentBodyFat, setStartingPercentBodyFat] = useState("");
    const [activityLevel, setActivityLevel] = useState("sedentary");

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
            birthdate={birthdate}
            setBirthdate={setBirthdate}
            sex={sex}
            setSex={setSex}
        />,
        <SignupForm3
            unitPreference={unitPreference}
            setUnitPreference={setUnitPreference}
            height={height}
            setHeight={setHeight}
            startingWeight={startingWeight}
            setStartingWeight={setStartingWeight}
        />,
        <SignupForm4 startingPercentBodyFat={startingPercentBodyFat} setStartingPercentBodyFat={setStartingPercentBodyFat} />,
        <SignupForm5 activityLevel={activityLevel} setActivityLevel={setActivityLevel} />,
        <SignupForm6
            email={email}
            password={password}
            firstName={firstName}
            lastName={lastName}
            birthdate={birthdate}
            sex={sex}
            unitPreference={unitPreference}
            height={height}
            startingWeight={startingWeight}
            startingPercentBodyFat={startingPercentBodyFat}
            activityLevel={activityLevel}
            setSignupError={setSignupError}
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
                setSignupError(
                    "Password must be at least 8 characters long and contain at least one uppercase letter, number, and special character"
                );
                return;
            }

            if (password !== confirmPassword) {
                // don't go to the next page
                setSignupError("Passwords do not match!");
                return;
            }
        }

        // // Name, Birthday, Sex Page validator
        if (currentSignupForm === 1) {
            if (!firstName) {
                setSignupError("Please enter your first name!");
                return;
            }

            if (!lastName) {
                setSignupError("Please enter your last name!");
                return;
            }

            if (!birthdate) {
                setSignupError("Please enter your birth date!");
                return;
            }

            if (new Date(birthdate).getTime() > Date.now()) {
                setSignupError("Please enter a valid birth date, preferrably not one in the future!");
                return;
            }

            if (!sex) {
                setSignupError("For accurate calorie calculations, we need to know your biological sex!");
                return;
            }
        }

        // Unit Preferences, Height, and Weight validator
        if (currentSignupForm === 2) {
            if (!unitPreference) {
                setSignupError("Please select a unit preference!");
                return;
            }

            if (!height) {
                setSignupError("For accurate calorie calculations, we need to know your height!");
                return;
            }

            if (!Number(height)) {
                setSignupError("Please enter a valid height!");
                return;
            }

            if (!startingWeight) {
                setSignupError("For accurate calorie calculations, we need to know your weight!");
                return;
            }

            if (unitPreference === "imperial") {
                if (height > 108 || height < 12) {
                    setSignupError("Please enter a valid height! (12-108 inches)");
                    return;
                }
                if (startingWeight < 20) {
                    setSignupError("Please enter a valid weight!");
                    return;
                }
            }

            if (unitPreference === "metric") {
                if (height > 270 || height < 30) {
                    setSignupError("Please enter a valid height! (30-270 cm)");
                    return;
                }
                if (startingWeight < 10) {
                    setSignupError("Please enter a valid weight!");
                    return;
                }
            }
        }

        if (currentSignupForm === 3) {
            if (startingPercentBodyFat && (startingPercentBodyFat <= 0 || startingPercentBodyFat >= 100)) {
                setSignupError("Please enter a valid percentage! (0-100%)");
                return;
            }
        }

        setSignupError(null);
        setCurrentSignupForm(currentSignupForm + 1);
        return;
    };

    const backOnClick = () => {
        if (currentSignupForm <= 0) {
            return;
        }

        setSignupError(null);
        setCurrentSignupForm(currentSignupForm - 1);
    };

    console.log("%", startingPercentBodyFat);
    console.log("h:", height);
    console.log("w:", startingWeight);

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
                        <p id="signup-now-message">Start tracking your fitness now!</p>
                    ) : null}
                </div>
                {signupForms[currentSignupForm]}
                <div id="signup-nav-buttons">
                    {currentSignupForm > 0 ? (
                        <button id="signup-nav-back" onClick={backOnClick}>
                            Back
                        </button>
                    ) : null}
                    {currentSignupForm < signupForms.length - 1 ? (
                        <button id="signup-nav-next" onClick={nextOnClick}>
                            Next
                        </button>
                    ) : null}
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
    const { firstName, setFirstName, lastName, setLastName, birthdate, setBirthdate, sex, setSex } = props;
    return (
        <div id="signup-form-2" className="signup-island-form">
            <FormInput type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <FormInput type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <FormInput type="date" placeholder="Birthdate" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
            <label id="signup-form-sex-label">Biological Sex</label>
            <div id="signup-form-sex-choices" className="signup-form-choices">
                <button
                    id="signup-form-sex-choice-male"
                    className={`signup-form-choice-left signup-form-choice-button${sex === "male" ? "-active" : ""}`}
                    onClick={() => setSex("male")}
                >
                    Male
                </button>
                <button
                    id="signup-form-sex-choice-female"
                    className={`signup-form-choice-right signup-form-choice-button${sex === "female" ? "-active" : ""}`}
                    onClick={() => setSex("female")}
                >
                    Female
                </button>
            </div>
        </div>
    );
}

function SignupForm3(props) {
    const { unitPreference, setUnitPreference, height, setHeight, startingWeight, setStartingWeight } = props;
    return (
        <div id="signup-form-3" className="signup-island-form">
            <label id="signup-form-sex-label">Unit Preference</label>
            <div className="signup-form-choices">
                <button
                    id="signup-form-unit-choice-imperial"
                    className={`signup-form-choice-left signup-form-choice-button${unitPreference === "imperial" ? "-active" : ""}`}
                    onClick={() => setUnitPreference("imperial")}
                >
                    Imperial
                </button>
                <button
                    id="signup-form-unit-choice-metric"
                    className={`signup-form-choice-right signup-form-choice-button${unitPreference === "metric" ? "-active" : ""}`}
                    onClick={() => setUnitPreference("metric")}
                >
                    Metric
                </button>
            </div>
            <FormInput
                type="number"
                inputMode="decimal"
                placeholder={unitPreference === "imperial" ? "Height (inches)" : "Height (cm)"}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                onClick={(e) => e.target.select()}
            />
            <FormInput
                type="number"
                inputMode="decimal"
                placeholder={unitPreference === "imperial" ? "Weight (lbs)" : "Weight (kg)"}
                value={startingWeight}
                onChange={(e) => setStartingWeight(e.target.value)}
                onClick={(e) => e.target.select()}
            />
        </div>
    );
}

function SignupForm4(props) {
    const { startingPercentBodyFat, setStartingPercentBodyFat } = props;
    return (
        <div id="signup-form-4" className="signup-island-form">
            <p>
                If you know it, giving us your % Body Fat allows us to use a more accurate formula to calculate your{" "}
                <a href="https://en.wikipedia.org/wiki/Basal_metabolic_rate">BMR</a>. If not, we can still provide a pretty good estimate for you!
            </p>
            <p>If you don't know or don't want to provide your % Body Fat, then just leave this field blank.</p>
            <FormInput
                type="number"
                inputMode="decimal"
                placeholder="% Body Fat (Optional)"
                value={startingPercentBodyFat}
                onChange={(e) => setStartingPercentBodyFat(e.target.value)}
                onClick={(e) => e.target.select()}
            />
        </div>
    );
}

function SignupForm5(props) {
    const { activityLevel, setActivityLevel } = props;

    return (
        <div id="signup-form-5" className="signup-island-form">
            <p>
                Your{" "}
                <a href="https://www.fao.org/3/y5686e/y5686e07.htm" target="_blank" rel="noreferrer noopener">
                    Physical Activity Level
                </a>{" "}
                describes the level of activity that you do on a day-to-day basis, particularly at work. Each level takes into account some baseline
                amount of exercise and is used to multiply your BMR by a corresponding factor, yielding your Total Daily Energy Expenditure (TDEE).
                For best accuracy and to avoid "double dipping" on exercise calories, we recommend selecting <b>Sedentary</b> and simply logging any
                meaningful exercises you do manually, since these descriptions tend to get pretty subjective.
            </p>
            <p>With that being said, feel free to select any of the following:</p>
            <ul id="signup-activity-levels-list">
                <li onClick={() => setActivityLevel("sedentary")}>
                    <button className={"signup-activity-button" + (activityLevel === "sedentary" ? " active" : "")}></button>
                    <div className="signup-activity-level">
                        <h5>Sedentary</h5>
                        <p>
                            Little to no exercise, office job or desk work. When computing your TDEE, this translates to multiplying your BMR by 1.3.
                        </p>
                    </div>
                </li>
                <li onClick={() => setActivityLevel("light")}>
                    <button className={"signup-activity-button" + (activityLevel === "light" ? " active" : "")}></button>
                    <div className="signup-activity-level">
                        <h5>Lightly Active</h5>
                        <p>Lightly active work environment and light exercise 1-3 days per week. This translates to multiplying your BMR by 1.5.</p>
                    </div>
                </li>
                <li onClick={() => setActivityLevel("moderate")}>
                    <button className={"signup-activity-button" + (activityLevel === "moderate" ? " active" : "")}></button>
                    <div className="signup-activity-level">
                        <h5>Moderately Active</h5>
                        <p>
                            Moderately active work environment and moderate intensity exercise 3-5 days per week. This translates to a BMR multiplier
                            of 1.7.
                        </p>
                    </div>
                </li>
                <li onClick={() => setActivityLevel("heavy")}>
                    <button className={"signup-activity-button" + (activityLevel === "heavy" ? " active" : "")}></button>
                    <div className="signup-activity-level">
                        <h5>Heavily Active</h5>
                        <p>Heavily active work environment and exercise 6-7 days per week. This maps to a BMR multiplier of 1.9.</p>
                    </div>
                </li>
                <li onClick={() => setActivityLevel("very heavy")}>
                    <button className={"signup-activity-button" + (activityLevel === "very heavy" ? " active" : "")}></button>
                    <div className="signup-activity-level">
                        <h5>Very Heavily Active</h5>
                        <p>
                            Very heavily active work environment, with intense exercise more than once per day on average. Your TDEE will be computed
                            using a multiplier of 2.1.
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    );
}

function SignupForm6(props) {
    const {
        email,
        password,
        firstName,
        lastName,
        birthdate,
        sex,
        unitPreference,
        height,
        startingWeight,
        startingPercentBodyFat,
        activityLevel,
        setSignupError,
    } = props;

    const navigate = useNavigate();

    let displayActivity = "";
    switch (activityLevel) {
        case "sedentary":
            displayActivity = "Sedentary";
            break;
        case "light":
            displayActivity = "Lightly Active";
            break;
        case "moderate":
            displayActivity = "Moderately Active";
            break;
        case "heavy":
            displayActivity = "Heavily Active";
            break;
        case "very heavy":
            displayActivity = "Very Heavily Active";
            break;
        default:
            displayActivity = "Sedentary";
    }

    const createAccountOnClick = () => {
        let heightCm = unitPreference === "imperial" ? height * 2.54 : height;
        let startingWeightKg = unitPreference === "imperial" ? startingWeight / 2.2 : startingWeight;
        let normalizedPercentBodyFat = Number(startingPercentBodyFat) / 100;
        normalizedPercentBodyFat =
            !normalizedPercentBodyFat || normalizedPercentBodyFat <= 0 || normalizedPercentBodyFat >= 1 ? null : normalizedPercentBodyFat;

        let body = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            birthdate: birthdate,
            sex: sex,
            heightCm: heightCm,
            startingWeightKg: startingWeightKg,
            startingPercentBodyFat: normalizedPercentBodyFat,
            activityLevel: activityLevel,
            preferences: {
                unitPreference: unitPreference,
                mealNames: ["Breakfast", "Lunch", "Dinner", "Snack", null, null],
            },
            goals: {
                weightGoal: startingWeightKg,
                weightDelta: 0,
                macroBreakdown: {
                    carbs: 0.34,
                    protein: 0.33,
                    fat: 0.33,
                },
            },
        };

        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/createAccount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
            .then((res) => {
                if (res.status !== 201) {
                    throw new Error(res.status);
                }
            })
            .then(() => {
                // Log the user in automatically
                fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email, password: password }),
                })
                    .then((res) => res.json())
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
                        navigate("/profile/goals");
                    })
                    .catch((err) => {
                        console.log(err);
                        setSignupError(
                            "Something went wrong with automatically signing you in...redirecting to login page. Don't forget to set some goals by going to your Profile page!"
                        );
                        setTimeout(() => navigate("/login"), 3000);
                    });
            })
            .catch((error) => {
                setSignupError(error.message + ": Account creation failed! Sorry about that.");
            });
    };

    return (
        <div id="signup-form-5" className="signup-island-form">
            <p>Almost there! Here's a summary of what you've told us:</p>
            <div id="signup-summary">
                <div id="signup-email-summary" className="signup-value-summary">
                    <p>Email:</p>
                    <p className="signup-summary-value">
                        <b>{email}</b>
                    </p>
                </div>
                <div id="signup-firstName-summary" className="signup-value-summary">
                    <p>First Name:</p>
                    <p className="signup-summary-value">
                        <b>{firstName}</b>
                    </p>
                </div>
                <div id="signup-lastName-summary" className="signup-value-summary">
                    <p>Last Name:</p>
                    <p className="signup-summary-value">
                        <b>{lastName}</b>
                    </p>
                </div>
                <div id="signup-birthDate-summary" className="signup-value-summary">
                    <p>Birth Date:</p>
                    <p className="signup-summary-value">
                        <b>{birthdate}</b>
                    </p>
                </div>
                <div id="signup-sex-summary" className="signup-value-summary">
                    <p>Sex:</p>
                    <p className="signup-summary-value">
                        <b>{sex === "male" ? "Male" : "Female"}</b>
                    </p>
                </div>
                <div id="signup-height-summary" className="signup-value-summary">
                    <p>Height:</p>
                    <p className="signup-summary-value">
                        <b>{height + (unitPreference === "imperial" ? " inches" : " cm")}</b>
                    </p>
                </div>
                <div id="signup-weight-summary" className="signup-value-summary">
                    <p>Weight:</p>
                    <p className="signup-summary-value">
                        <b>{startingWeight + (unitPreference === "imperial" ? " lbs" : " kg")}</b>
                    </p>
                </div>
                <div id="signup-fat-summary" className="signup-value-summary">
                    <p>% Body Fat:</p>
                    <p className="signup-summary-value">
                        <b>{startingPercentBodyFat ? startingPercentBodyFat + "%" : "-"}</b>
                    </p>
                </div>
                <div id="signup-activity-summary" className="signup-value-summary">
                    <p>Activity Level:</p>
                    <p className="signup-summary-value">
                        <b>{displayActivity}</b>
                    </p>
                </div>
                <button id="create-account-button" onClick={createAccountOnClick}>
                    Create Account
                </button>
            </div>
        </div>
    );
}

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
