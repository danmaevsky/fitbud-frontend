import "./EditExerciseCardioLogPage.css";
import backArrow from "assets/back-arrow.svg";
import addLogPlus from "assets/add-food-plus.svg";
import minusSign from "assets/minus-sign.svg";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SaveLogButtonIcon from "components/SaveLogButtonIcon";
import DeleteLogButtonIcon from "components/DeleteLogButtonIcon";
import useArray from "hooks/useArray";
import FormInput from "components/FormInput";

import { IsUserLogged, authFetch } from "helpers/authHelpers";
import { getCurrentDate } from "helpers/generalHelpers";
import { CalculateBMR } from "helpers/fitnessHelpers";

export default function EditExerciseCardioLogPage() {
    // Basically the FoodPage but with blue background and reads from localStorage instead of GET request
    const location = useLocation();
    const navigate = useNavigate();

    const currentDate = getCurrentDate();
    const userIsLoggedIn = IsUserLogged();

    let BMR = 2000;
    if (userIsLoggedIn) BMR = CalculateBMR(JSON.parse(window.localStorage.profile));

    let logPosition, date, exerciseLog, exerciseResponse, diary;
    let initialDurationMinutes = 0;
    let initialKcal = 0;

    if (location.state) {
        logPosition = location.state.logPosition;
        date = location.state.date;
        diary = date === currentDate ? JSON.parse(window.localStorage.CurrentDiary) : JSON.parse(window.localStorage.PrevDiary);
        exerciseLog = diary["exercise"].cardioLogs[logPosition];
        exerciseResponse = exerciseLog ? exerciseLog.exerciseObject : null;

        // set initial values
        initialDurationMinutes = exerciseLog ? exerciseLog.durationMinutes : initialDurationMinutes;
        initialKcal = exerciseLog ? exerciseLog.kcal : initialKcal;
    }

    console.log("initialD", initialDurationMinutes);

    const [durationMinutes, setDurationMinutes] = useState(initialDurationMinutes);
    const [kcal, setKcal] = useState(initialKcal);

    useEffect(() => {
        if (!location.state || !exerciseLog) {
            navigate(-1, { state: null });
        } else {
            setDurationMinutes(initialDurationMinutes);
            setKcal(initialKcal);
        }
    }, []);

    if (!location.state || !exerciseLog) {
        return (
            <div id="exercise-strength-page-body">
                <div className="default-background-round round-background-decoration"></div>
                <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
                <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
                <div id="exercise-cardio-island"></div>
            </div>
        );
    }

    return (
        <div id="exercise-strength-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="exercise-cardio-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} alt="back arrow" />
                    Go Back
                </Link>
                <ExerciseInfo
                    exerciseResponse={exerciseResponse}
                    BMR={BMR}
                    durationMinutes={durationMinutes}
                    setDurationMinutes={setDurationMinutes}
                    setKcal={setKcal}
                />
                {!exerciseResponse ? "Loading..." : null}
                <div id="exercise-strength-page-log-buttons">
                    <CalorieSelector kcal={kcal} setKcal={setKcal} />
                </div>
                <div id="food-log-page-log-buttons">
                    <DeleteCardioLogButton logPosition={logPosition} date={date} diary={diary} />
                    <SaveCardioLogButton
                        logPosition={logPosition}
                        date={date}
                        exerciseId={exerciseResponse._id}
                        durationMinutes={durationMinutes}
                        kcal={kcal}
                        diary={diary}
                    />
                </div>
            </div>
        </div>
    );
}

function ExerciseInfo(props) {
    const { exerciseResponse, BMR, durationMinutes, setDurationMinutes, setKcal } = props;
    const MET = exerciseResponse.MET;
    const exerciseName = exerciseResponse.name;

    const [minutesText, setMinutesText] = useState(durationMinutes);

    const MAX_MINUTES = 24 * 60;

    let basalMinuteRate = BMR / 24 / 60;

    const inputOnChange = (e) => {
        let n = Number(e.target.value);
        setMinutesText(e.target.value);
        if (n >= 0 && n <= MAX_MINUTES) {
            console.log("duration in proper domain");
            let extraCaloriesBurned = Math.round((MET - 1) * basalMinuteRate * n);
            console.log("proper domain extra calories", extraCaloriesBurned);
            setDurationMinutes(n);
            setKcal(extraCaloriesBurned);
        }
    };

    const inputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n < 0) {
            let extraCaloriesBurned = Math.round((MET - 1) * basalMinuteRate * 0);
            setMinutesText(0);
            setDurationMinutes(0);
            setKcal(extraCaloriesBurned);
            return;
        } else if (n > MAX_MINUTES) {
            let extraCaloriesBurned = Math.round((MET - 1) * basalMinuteRate * MAX_MINUTES);
            setMinutesText(MAX_MINUTES);
            setDurationMinutes(MAX_MINUTES);
            setKcal(extraCaloriesBurned);
            return;
        }
    };

    console.log("duration", durationMinutes);

    return (
        <div id="exercise-info">
            <h3>{exerciseName}</h3>
            <p>MET Value: {MET}</p>
            <div id="exercise-cardio-page-how-long">
                <h4>How long did you do this exercise for?</h4>
                <FormInput
                    type="number"
                    inputMode="decimal"
                    placeholder="Duration in Minutes"
                    value={minutesText}
                    onClick={(e) => e.target.select()}
                    onChange={inputOnChange}
                    onBlur={inputOnBlur}
                />
            </div>
        </div>
    );
}

function CalorieSelector(props) {
    const { kcal, setKcal } = props;
    const [kcalText, setKcalText] = useState("");

    let calorieMax = 100000;

    const inputOnChange = (e) => {
        let n = Number(e.target.value);
        setKcalText(e.target.value);
        if (n && n > 0 && n <= calorieMax) {
            setKcal(n);
        }
    };

    const inputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n < 0) {
            setKcalText(0);
            setKcal(0);
            return;
        } else if (n > calorieMax) {
            setKcalText(calorieMax);
            setKcal(calorieMax);
            return;
        }

        setKcalText(Math.round(n));
        setKcal(Math.round(n));
    };

    useEffect(() => {
        setKcalText(kcal);
    }, [kcal]);

    console.log(kcal, kcalText);

    return (
        <FormInput
            type="number"
            inputMode="numeric"
            placeholder="Calories"
            value={kcalText}
            onClick={(e) => e.target.select()}
            onChange={inputOnChange}
            onBlur={inputOnBlur}
        />
    );
}

function SaveCardioLogButton(props) {
    const { logPosition, date, exerciseId, durationMinutes, kcal, diary } = props;
    const navigate = useNavigate();

    const currentDate = getCurrentDate();

    const saveExerciseOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "cardio",
                action: "updateLog",
                contents: {
                    logPosition: logPosition,
                    exerciseId: exerciseId,
                    durationMinutes: durationMinutes,
                    kcal: kcal,
                },
            };
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/${diaryId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patchBody),
            })
                .then((res) => {
                    if (res.status === 200) {
                        if (date === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + date);
                        }
                    } else {
                        throw Error(res.status);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    return (
        <div id="food-log-page-save-log" className="food-log-page-log-button" onClick={saveExerciseOnClick}>
            <label>Save Changes</label>
            <button>
                <SaveLogButtonIcon />
            </button>
        </div>
    );
}

function DeleteCardioLogButton(props) {
    const { logPosition, date, diary } = props;
    const navigate = useNavigate();
    const currentDate = getCurrentDate();

    const deleteExerciseOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "cardio",
                action: "deleteLog",
                contents: {
                    logPosition: logPosition,
                },
            };
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/${diaryId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patchBody),
            })
                .then((res) => {
                    if (res.status === 200) {
                        if (date === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + date);
                        }
                    } else {
                        throw Error(res.status);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    return (
        <div id="food-log-page-delete-log" className="food-log-page-log-button" onClick={deleteExerciseOnClick}>
            <button>
                <DeleteLogButtonIcon />
            </button>
            <label>Delete Log</label>
        </div>
    );
}
