import "./ExerciseStrengthPage.css";
import backArrow from "assets/back-arrow.svg";
import addLogPlus from "assets/add-food-plus.svg";
import minusSign from "assets/minus-sign.svg";
import DropdownMenu from "components/DropdownMenu";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useArray from "hooks/useArray";
import FormInput from "components/FormInput";
import { getCurrentDate } from "helpers/generalHelpers";
import { IsUserLogged, authFetch } from "helpers/authHelpers";

export default function ExerciseStrengthPage() {
    const { exerciseId } = useParams();
    const location = useLocation();

    const [exerciseResponse, setExerciseResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(200);
    const [numSets, setNumSets] = useState(0);
    const [kcal, setKcal] = useState(0);
    const [weightKgArray, weightKgArrayMethods] = useArray([]);
    const [repsArray, repsArrayMethods] = useArray([]);
    const [diaryDate, setDiaryDate] = useState(getCurrentDate());

    const userIsLoggedIn = IsUserLogged();

    // fetching exercise object or loading from results
    useEffect(() => {
        let tempResponse = LookForExerciseInLocalStorage(exerciseId);
        if (!tempResponse) {
            let resStatus;
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/strength/${exerciseId}`, {
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
            if (location.state.mealPosition && location.state.date) {
                setDiaryDate(location.state.date);
            }
        }
    }, []);

    let renderExerciseInfo = responseStatus === 200;
    renderExerciseInfo = renderExerciseInfo && exerciseResponse && exerciseId === exerciseResponse._id;

    // let kcal = 0;
    // if (userIsLoggedIn) {
    //     let profile = JSON.parse(window.localStorage.profile);

    // }
    console.log(kcal);

    return (
        <div id="exercise-strength-page-body">
            <div className="exercise-background-round round-background-decoration"></div>
            <div className="exercise-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="exercise-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="exercise-strength-island">
                <Link to={-1} id="exercise-island-back-arrow">
                    <img src={backArrow} alt="back arrow icon" />
                    Go Back
                </Link>
                {userIsLoggedIn && renderExerciseInfo ? (
                    <ExerciseInfo
                        exerciseResponse={exerciseResponse}
                        numSets={numSets}
                        setNumSets={setNumSets}
                        repsArray={repsArray}
                        repsArrayMethods={repsArrayMethods}
                        weightKgArray={weightKgArray}
                        weightKgArrayMethods={weightKgArrayMethods}
                    />
                ) : null}
                {!exerciseResponse ? "Loading..." : null}
                {responseStatus !== 200 ? "404. No Exercises matching this ID!" : null}
                {userIsLoggedIn && renderExerciseInfo ? (
                    <div id="exercise-strength-page-log-buttons">
                        <CalorieSelector setKcal={setKcal} />
                        <AddExerciseLogButton
                            exerciseId={exerciseId}
                            numSets={numSets}
                            repsArray={repsArray}
                            weightKgArray={weightKgArray}
                            kcal={kcal}
                            diaryDate={diaryDate}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ExerciseInfo(props) {
    const { exerciseResponse, numSets, setNumSets, repsArray, repsArrayMethods, weightKgArray, weightKgArrayMethods } = props;
    let exerciseName = exerciseResponse.name;
    let MET = exerciseResponse.MET;
    return (
        <div id="exercise-info">
            <h3>{exerciseName}</h3>
            <p>MET Value: {MET}</p>
            <SelectExerciseSRW
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
    const { numSets, setNumSets, repsArray, repsArrayMethods, weightKgArray, weightKgArrayMethods } = props;

    let setSections = [];
    for (let i = 0; i < numSets; i++) {
        setSections.push(
            <SetSection
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

    return (
        <div id="exercise-page-sets">
            {setSections}
            <AddSetButton
                addSetOnClick={() => {
                    setNumSets(numSets + 1);
                    repsArrayMethods.push(0);
                    weightKgArrayMethods.push(0);
                }}
            />
        </div>
    );
}

function SetSection(props) {
    const { setIndex, numSets, setNumSets, repsArrayMethods, weightKgArrayMethods } = props;

    const [numRepsText, setNumRepsText] = useState("");
    const [numWeightText, setNumWeightText] = useState("");

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
            weightKgArrayMethods.update(setIndex, n);
        }
    };

    const weightInputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n < 0) {
            setNumWeightText(0);
            weightKgArrayMethods.update(setIndex, n);
            return;
        } else if (n > weightMax) {
            setNumWeightText(weightMax);
            weightKgArrayMethods.update(setIndex, n);
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
                onChange={repsInputOnChange}
                onBlur={repsInputOnBlur}
            />
            <FormInput
                type="number"
                inputMode="decimal"
                value={numWeightText}
                placeholder="# kg"
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

function AddExerciseLogButton(props) {
    const { exerciseId, numSets, repsArray, weightKgArray, kcal, diaryDate } = props;
    const navigate = useNavigate();

    const currentDate = getCurrentDate();
    const diary = currentDate === diaryDate ? JSON.parse(window.localStorage.CurrentDiary) : JSON.parse(window.localStorage.PrevDiary);

    const addFoodOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "strength",
                action: "addLog",
                contents: {
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
                type: "strength",
                action: "addLog",
                contents: {
                    exerciseId: exerciseId,
                    sets: numSets,
                    reps: repsArray,
                    weightKg: weightKgArray,
                    kcal: kcal,
                },
            };
            console.log(postBody);

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
    const { setKcal } = props;
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
