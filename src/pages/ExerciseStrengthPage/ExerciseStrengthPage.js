import "./ExerciseStrengthPage.css";
import backArrow from "assets/back-arrow.svg";
import DropdownMenu from "components/DropdownMenu";
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

export default function ExerciseStrengthPage() {
    const { exerciseId } = useParams();
    const [exerciseResponse, setExerciseResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(200);
    useEffect(() => {
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
                setExerciseResponse(json)
            });    
    }, [exerciseId]);

    let renderExerciseInfo = responseStatus === 200;
    renderExerciseInfo = renderExerciseInfo && exerciseResponse && exerciseId === exerciseResponse._id;

    return (
        <div id="exercise-page-body">
            <div className="exercise-background-round round-background-decoration"></div>
            <div className="exercise-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="exercise-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="exercise-island">
                {renderExerciseInfo ? <ExerciseInfo exerciseResponse={exerciseResponse} /> : null}
                {!exerciseResponse ? "Loading..." : null}
                {responseStatus !== 200 ? "404. No Exercises matching this ID!" : null}
                <Link to={-1} id="exercise-island-back-arrow">
                    <img src={backArrow} alt="back arrow icon"/>
                    Go Back
                </Link>
            </div>
        </div>
    );
}

function ExerciseInfo(props) {
    const { exerciseResponse } = props;
    let exerciseName = exerciseResponse.name;
    let MET = exerciseResponse.MET;
    return (
        <div id="exercise-info">
            <h3>{exerciseName}</h3>
            <p>MET: {MET}</p>
            <SelectExerciseSRW
                exerciseId = {exerciseResponse.exerciseId}
            />
        </div>
         
    )
}

function SelectExerciseSRW(props) {
    const{exerciseId, sets, reps, weight, kcal} = props;

    const [numText, setNumText] = useState();
    const [repsText, setRepsText] = useState();
    const [weightText, setWeightText] = useState();

    const inputOnChangeSets = (e) => {
        let n = Number(e.target.value);
        setNumText(e.target.value);
        if (n > 0 && n < 10001) {
            sets(n);
        }
    };
    const inputOnBlurSets = () => {
        if (numText < 0) {
            setNumText(0);
            sets(1);
            return;
        } else if (numText > 10000) {
            setNumText(10000);
            sets(10000);
            return;
        }
        sets(numText);
        return;
    };


    const inputOnChangeReps = (e) => {
        let n = Number(e.target.value);
        setRepsText(e.target.value);
        if (n > 0 && n < 10001) {
            reps(n);
        }
    };

    const inputOnBlurReps = () => {
        if (repsText < 0) {
            setRepsText(0);
            reps(1);
            return;
        } else if (repsText > 10000) {
            setRepsText(10000);
            reps(10000);
            return;
        }
        reps(repsText);
        return;
    };


    const inputOnChangeWeight = (e) => {
        let n = Number(e.target.value);
        setWeightText(e.target.value);
        if (n > 0 && n < 10001) {
            weight(n);
        }
    };

    const inputOnBlurWeight = () => {
        if (weightText < 0) {
            setWeightText(0);
            weight(1);
            return;
        } else if (weightText > 10000) {
            setWeightText(10000);
            weight(10000);
            return;
        }
        weight(weightText);
        return;
    };

    return (
        <div id="exercise-page-serving-selector">
            <div id="exercise-page-num-selector">
                <p>Number of Sets:</p>
                <input
                    type="number"
                    inputMode="integer"
                    value={numText}
                    onClick={(e) => e.target.select()}
                    onChange={inputOnChangeSets}
                    onBlur={inputOnBlurSets}
                />
            </div>
            <div id="exercise-page-num-selector">
                <p>Number of Reps:</p>
                <input
                    type="number"
                    inputMode="integer"
                    value={repsText}
                    onClick={(e) => e.target.select()}
                    onChange={inputOnChangeReps}
                    onBlur={inputOnBlurReps}
                />
            </div>
            <div id="exercise-page-num-selector">
                <p>Weight in lbs:</p>
                <input
                    type="number"
                    inputMode="integer"
                    value={weightText}
                    onClick={(e) => e.target.select()}
                    onChange={inputOnChangeWeight}
                    onBlur={inputOnBlurWeight}
                />
            </div>
        </div>
    );
    
}
