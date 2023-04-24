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
            <div id="exercise-page-round-background-decoration"></div>
            <div id="exercise-page-bottom-top-banner-background-decoration"></div>
            <div id="exercise-page-bottom-bot-banner-background-decoration"></div> 
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
    let exerciseName = ProcessExerciseName(exerciseResponse.name);
    return (
        <div id="exercise-info">
            <h3>{exerciseName}</h3>
            <h4>{}</h4>
        </div>
    )
}

function ProcessExerciseName(x) {
    /*
    Actual Function that will strip the extra information from the names of foods as well as call ToTitleCase to
    standardize the way that exercise names are displayed
    */
    let phrases = GetPhrases(x);
    // console.log(phrases);
    let maxKey = "";
    let keys = Object.keys(phrases);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key.length > maxKey.length && phrases[key].length > 1) {
            maxKey = key;
        }
    }
    if (maxKey !== "") {
        // console.log(maxKey);
        phrases[maxKey].sort((a, b) => {
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }
            return 0;
        });
        x = x.substring(0, phrases[maxKey][phrases[maxKey].length - 1][0]) + x.substring(phrases[maxKey][phrases[maxKey].length - 1][1]);
        x = x.replace("  ", " ");
        if (x.substring(x.length - 2) === ", ") {
            x = x.substring(0, x.length - 2);
        }
    }
    // to Title Case
    x = ToTitleCase(x);
    return x;
}

function ToTitleCase(x) {
    /* 
    Very useful function for converting aNy sTriNG into Title Case, where only the first letter of every
    word is capitalized. The API sends back exercise names in uppercase letters, so it's the job of the client
    to figure out how best to display everything
    */
    x = x
        .toLowerCase()
        .split(" ")
        .map((s) => {
            if (s === "dips") {
                return "DIPS";
            }
            return s.charAt(0).toUpperCase() + s.substring(1);
        })
        .join(" ");
    // extra capitalization
    for (let i = 0; i < x.length - 1; i++) {
        if (x[i] === "(" || x[i] === "[" || x[i] === "{" || x[i] === "-") {
            x = x.substring(0, i + 1) + x[i + 1].toUpperCase() + x.substring(i + 2);
        }
    }
    return x;
}

function GetPhrases(s, ans, offset) {
    /*
    Magic T(n) = O(n^3) recursive function. Splits a string into "phrases", which is a combination of consecutive words
    in a string. This function is super useful for trimming off some of the extra repeated information that comes in a food's
    name, like "Salt & Pepper Cashews, Salt & Pepper"
    */
    ans = ans ? ans : {};
    let j = offset ? offset : 0;
    let k = offset ? offset : 0;
    let builder = "";
    for (let i = offset ? offset : 0; i < s.length; i++) {
        // !offset ? console.log(builder) : null;
        if (builder === "") {
            j = i;
            k = i;
        }
        if (s[i] === " ") {
            // console.log("space", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
                GetPhrases(s, ans, i + 1);
            }
            builder = builder === "" ? "" : builder + s[i];
            k++;
        } else if (s[i] === ",") {
            // console.log("comma", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
                GetPhrases(s, ans, i + 1);
            }
            builder = "";
        } else if (i === s.length - 1) {
            builder += s[i];
            k++;
            // console.log("end", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
            }
        } else {
            builder += s[i];
            k++;
        }
    }
    return ans;
}

function MultiDimIncludes(arr, val) {
    // Multidimensional Array version of .includes() that is good enough for my purposes
    for (let i = 0; i < arr.length; i++) {
        let temp = true;
        for (let j = 0; j < arr[i].length; j++) {
            temp = arr[i][j] === val[j];
        }
        if (temp) {
            return temp;
        }
    }
    return false;
}