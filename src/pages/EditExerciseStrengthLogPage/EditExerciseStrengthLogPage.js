import "./EditExerciseStrengthLogPage.css";
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

export default function EditExerciseStrengthLogPage() {
    // Basically the FoodPage but with blue background and reads from localStorage instead of GET request
    const location = useLocation();
    const navigate = useNavigate();

    const currentDate = getCurrentDate();
    const userIsLoggedIn = IsUserLogged();
    let profile = userIsLoggedIn ? JSON.parse(window.localStorage.profile) : null;

    let logPosition, date, exerciseLog, exerciseResponse, diary;
    let initialNumSets = 0;
    let initialRepsArray = [];
    let initialWeightKgArray = [];
    let initialKcal = 0;

    if (location.state) {
        logPosition = location.state.logPosition;
        date = location.state.date;
        diary = date === currentDate ? JSON.parse(window.localStorage.CurrentDiary) : JSON.parse(window.localStorage.PrevDiary);
        exerciseLog = diary["exercise"].strengthLogs[logPosition];
        exerciseResponse = exerciseLog ? exerciseLog.exerciseObject : null;

        // set initial values
        initialNumSets = exerciseLog ? exerciseLog.sets : initialNumSets;
        initialRepsArray = exerciseLog ? exerciseLog.reps : initialRepsArray;
        initialWeightKgArray = exerciseLog ? exerciseLog.weightKg : initialWeightKgArray;
        initialKcal = exerciseLog ? exerciseLog.kcal : initialKcal;
    }

    const [numSets, setNumSets] = useState(initialNumSets);
    const [repsArray, repsArrayMethods] = useArray(initialRepsArray);
    const [weightKgArray, weightKgArrayMethods] = useArray(initialWeightKgArray);
    const [kcal, setKcal] = useState(initialKcal);

    useEffect(() => {
        if (!location.state || !exerciseLog) {
            navigate(-1, { state: null });
        } else {
            setNumSets(initialNumSets);
            repsArrayMethods.set(initialRepsArray);
            weightKgArrayMethods.set(initialWeightKgArray);
            setKcal(initialKcal);
        }
    }, []);

    if (!location.state || !exerciseLog) {
        return (
            <div id="exercise-strength-page-body">
                <div className="default-background-round round-background-decoration"></div>
                <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
                <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
                <div id="exercise-strength-island"></div>
            </div>
        );
    }

    return (
        <div id="food-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="food-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} alt="back arrow" />
                    Go Back
                </Link>
                <ExerciseInfo
                    profile={profile}
                    exerciseResponse={exerciseResponse}
                    numSets={numSets}
                    setNumSets={setNumSets}
                    repsArray={repsArray}
                    repsArrayMethods={repsArrayMethods}
                    weightKgArray={weightKgArray}
                    weightKgArrayMethods={weightKgArrayMethods}
                />
                {!exerciseResponse ? "Loading..." : null}
                <div id="exercise-strength-page-log-buttons">
                    <CalorieSelector kcal={kcal} setKcal={setKcal} />
                </div>
                <div id="food-log-page-log-buttons">
                    <DeleteStrengthLogButton logPosition={logPosition} date={date} diary={diary} />
                    <SaveStrengthLogButton
                        logPosition={logPosition}
                        date={date}
                        exerciseId={exerciseResponse._id}
                        numSets={numSets}
                        repsArray={repsArray}
                        weightKgArray={weightKgArray}
                        kcal={kcal}
                        diary={diary}
                    />
                </div>
            </div>
        </div>
    );
}

function ExerciseInfo(props) {
    const { profile, exerciseResponse, numSets, setNumSets, repsArray, repsArrayMethods, weightKgArray, weightKgArrayMethods } = props;
    let exerciseName = exerciseResponse.name;
    let MET = exerciseResponse.MET;
    return (
        <div id="exercise-info">
            <h3>{exerciseName}</h3>
            <p>MET Value: {MET}</p>
            <SelectExerciseSRW
                profile={profile}
                numSets={numSets}
                setNumSets={setNumSets}
                repsArray={repsArray}
                repsArrayMethods={repsArrayMethods}
                weightKgArray={weightKgArray}
                weightKgArrayMethods={weightKgArrayMethods}
            />
        </div>
    );
}

function SelectExerciseSRW(props) {
    const { profile, numSets, setNumSets, repsArray, repsArrayMethods, weightKgArray, weightKgArrayMethods } = props;

    let setSections = [];
    for (let i = 0; i < numSets; i++) {
        setSections.push(
            <SetSection
                profile={profile}
                key={`set-section-${i}`}
                numSets={numSets}
                setNumSets={setNumSets}
                setIndex={i}
                repsArray={repsArray}
                repsArrayMethods={repsArrayMethods}
                weightKgArray={weightKgArray}
                weightKgArrayMethods={weightKgArrayMethods}
            />
        );
    }

    const numSetsMax = 10;
    return (
        <div id="exercise-page-sets">
            {setSections}
            {numSets < numSetsMax ? (
                <AddSetButton
                    addSetOnClick={() => {
                        setNumSets(numSets + 1);
                        repsArrayMethods.push(0);
                        weightKgArrayMethods.push(0);
                    }}
                />
            ) : null}
        </div>
    );
}

function SetSection(props) {
    const { profile, setIndex, numSets, setNumSets, repsArray, repsArrayMethods, weightKgArray, weightKgArrayMethods } = props;

    let numRepsInitialValue = Math.round(repsArray[setIndex]);
    let numWeightInitialValue = weightKgArray[setIndex];
    let unitPreference = "metric";
    if (profile) {
        if (profile.preferences.unitPreference === "imperial") {
            unitPreference = "imperial";
        }
    }

    numWeightInitialValue =
        unitPreference === "imperial" ? Math.round(numWeightInitialValue * 2.2 * 10) / 10 : Math.round(numWeightInitialValue * 10) / 10;

    const [numRepsText, setNumRepsText] = useState(numRepsInitialValue);
    const [numWeightText, setNumWeightText] = useState(numWeightInitialValue);

    const repMax = 200;
    const weightMax = 2000;

    const repsInputOnChange = (e) => {
        let n = Number(e.target.value);
        setNumRepsText(e.target.value);
        if (n && n > 0 && n < repMax) {
            repsArrayMethods.update(setIndex, Math.round(n));
        }
    };

    const repsInputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n < 1) {
            setNumRepsText(1);
            repsArrayMethods.update(setIndex, 1);
            return;
        } else if (n > repMax) {
            setNumRepsText(repMax);
            repsArrayMethods.update(setIndex, repMax);
            return;
        }

        setNumRepsText(Math.round(n));
    };

    const weightInputOnChange = (e) => {
        let n = Number(e.target.value);
        setNumWeightText(e.target.value);
        if (n > 0 && n < weightMax) {
            if (unitPreference === "imperial") {
                weightKgArrayMethods.update(setIndex, n / 2.2);
            } else {
                weightKgArrayMethods.update(setIndex, n);
            }
        }
    };

    const weightInputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n < 0) {
            setNumWeightText(0);
            weightKgArrayMethods.update(setIndex, 0);
            return;
        } else if (n > weightMax) {
            setNumWeightText(weightMax);
            if (unitPreference === "imperial") {
                weightKgArrayMethods.update(setIndex, weightMax / 2.2);
            } else {
                weightKgArrayMethods.update(setIndex, weightMax);
            }
            return;
        }
    };

    const removeSetOnClick = () => {
        if (numSets > 0) {
            setNumSets(numSets - 1);
            repsArrayMethods.remove(setIndex);
            weightKgArrayMethods.remove(setIndex);
        }
    };

    return (
        <div className="exercise-set-section">
            <div className="exercise-set-header">
                <h4>Set {setIndex + 1}</h4>
            </div>
            <FormInput
                type="number"
                inputMode="numeric"
                value={numRepsText}
                placeholder="# Reps"
                onClick={(e) => e.target.select()}
                onChange={repsInputOnChange}
                onBlur={repsInputOnBlur}
            />
            <FormInput
                type="number"
                inputMode="decimal"
                value={numWeightText}
                placeholder="# kg"
                onClick={(e) => e.target.select()}
                onChange={weightInputOnChange}
                onBlur={weightInputOnBlur}
            />
            <div className="exercise-remove-set" onClick={removeSetOnClick}>
                <button>
                    <img src={minusSign} />
                </button>
            </div>
        </div>
    );
}

function AddSetButton(props) {
    const { addSetOnClick } = props;
    return (
        <div className="exercise-add-set" onClick={addSetOnClick}>
            <button>
                <img src={addLogPlus} />
            </button>
            <label>Add Set</label>
        </div>
    );
}

function CalorieSelector(props) {
    const { kcal, setKcal } = props;
    const [kcalText, setKcalText] = useState(kcal);

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
        if (!n || kcalText < 0) {
            setKcalText(0);
            setKcal(0);
            return;
        } else if (kcalText > calorieMax) {
            setKcalText(calorieMax);
            setKcal(calorieMax);
            return;
        }
    };

    return (
        <FormInput
            type="number"
            inputMode="decimal"
            placeholder="Calories"
            value={kcalText}
            onClick={(e) => e.target.select()}
            onChange={inputOnChange}
            onBlur={inputOnBlur}
        />
    );
}

function SaveStrengthLogButton(props) {
    const { logPosition, date, exerciseId, numSets, repsArray, weightKgArray, kcal, diary } = props;
    const navigate = useNavigate();

    const currentDate = getCurrentDate();

    const saveExerciseOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "strength",
                action: "updateLog",
                contents: {
                    logPosition: logPosition,
                    exerciseId: exerciseId,
                    sets: numSets,
                    reps: repsArray,
                    weightKg: weightKgArray,
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

function DeleteStrengthLogButton(props) {
    const { logPosition, date, diary } = props;
    const navigate = useNavigate();
    const currentDate = getCurrentDate();

    const deleteExerciseOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "strength",
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
