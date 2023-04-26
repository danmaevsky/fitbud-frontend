import "./ExerciseCardioPage.css";
import backArrow from "assets/back-arrow.svg";
import addLogPlus from "assets/add-food-plus.svg";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FormInput from "components/FormInput";
import { getCurrentDate } from "helpers/generalHelpers";
import { IsUserDiaryReady, IsUserLogged, authFetch } from "helpers/authHelpers";
import { CalculateBMR } from "helpers/fitnessHelpers";

export default function ExerciseCardioPage() {
    const { exerciseId } = useParams();
    const location = useLocation();

    const [exerciseResponse, setExerciseResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(200);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [kcal, setKcal] = useState(0);
    const [diaryDate, setDiaryDate] = useState(getCurrentDate());

    const userIsLoggedIn = IsUserLogged();
    let BMR = 2000;
    if (userIsLoggedIn) BMR = CalculateBMR(JSON.parse(window.localStorage.profile));
    console.log("bmr", BMR);

    // fetching exercise object or loading from results
    useEffect(() => {
        let tempResponse = LookForExerciseInLocalStorage(exerciseId);
        if (!tempResponse) {
            let resStatus;
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/cardio/${exerciseId}`, {
                method: "GET",
            })
                .then((res) => {
                    resStatus = res.status;
                    return res.json();
                })
                .then((json) => {
                    setResponseStatus(resStatus);
                    setExerciseResponse(json);
                });
        } else {
            setResponseStatus(200);
            setExerciseResponse(tempResponse);
        }
    }, [exerciseId]);

    // seeing if user came from the diary page
    useEffect(() => {
        if (location.state) {
            if (location.state.date) {
                setDiaryDate(location.state.date);
            }
        }
    }, []);

    let renderExerciseInfo = responseStatus === 200;
    renderExerciseInfo = renderExerciseInfo && exerciseResponse && exerciseId === exerciseResponse._id;

    return (
        <div id="exercise-strength-page-body">
            <div className="exercise-background-round round-background-decoration"></div>
            <div className="exercise-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="exercise-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="exercise-cardio-island">
                <Link to={-1} id="exercise-island-back-arrow">
                    <img src={backArrow} alt="back arrow icon" />
                    Go Back
                </Link>
                {userIsLoggedIn && renderExerciseInfo ? (
                    <ExerciseInfo
                        exerciseResponse={exerciseResponse}
                        BMR={BMR}
                        durationMinutes={durationMinutes}
                        setDurationMinutes={setDurationMinutes}
                        setKcal={setKcal}
                    />
                ) : null}
                {!exerciseResponse ? "Loading..." : null}
                {responseStatus !== 200 ? "404. No Exercises matching this ID!" : null}
                {userIsLoggedIn && renderExerciseInfo ? (
                    <div id="exercise-strength-page-log-buttons">
                        <CalorieSelector kcal={kcal} setKcal={setKcal} />
                        <AddExerciseLogButton exerciseId={exerciseId} durationMinutes={durationMinutes} kcal={kcal} diaryDate={diaryDate} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ExerciseInfo(props) {
    const { exerciseResponse, BMR, durationMinutes, setDurationMinutes, setKcal } = props;
    const MET = exerciseResponse.MET;
    const exerciseName = exerciseResponse.name;

    const [minutesText, setMinutesText] = useState("");

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

function AddExerciseLogButton(props) {
    const { exerciseId, durationMinutes, kcal, diaryDate } = props;
    const navigate = useNavigate();

    const currentDate = getCurrentDate();
    const userDiaryIsReady = IsUserDiaryReady();

    let diary = null;
    if (userDiaryIsReady)
        diary = currentDate === diaryDate ? JSON.parse(window.localStorage.CurrentDiary) : JSON.parse(window.localStorage.PrevDiary);

    const addFoodOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "cardio",
                action: "addLog",
                contents: {
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
                        if (diaryDate === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + diaryDate);
                        }
                    } else {
                        throw Error(res.status);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            let postBody = {
                type: "cardio",
                action: "addLog",
                contents: {
                    exerciseId: exerciseId,
                    durationMinutes: durationMinutes,
                    kcal: kcal,
                },
            };

            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/?date=${diaryDate}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postBody),
            })
                .then((res) => {
                    if (res.status === 201) {
                        if (diaryDate === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + diaryDate);
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
        <div id="exercise-strength-page-add-exercise-log" onClick={addFoodOnClick}>
            <button>
                <img src={addLogPlus} />
            </button>
            <label>Add to Diary</label>
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

function LookForExerciseInLocalStorage(exerciseId) {
    let exerciseResponse = null;
    if (window.sessionStorage.ExerciseSearchPageResults) {
        let results = JSON.parse(window.sessionStorage.ExerciseSearchPageResults);
        results.forEach((result) => {
            if (result._id === exerciseId) exerciseResponse = result;
        });
    }
    return exerciseResponse;
}
