import magnifyingGlass from "assets/magnifying-glass.svg";
import "./ExerciseSearchPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ExerciseSearchPage() {
    const [searchText, setSearchText] = useState("");
    const [exerciseType, setExerciseType] = useState("cardio");
    const [searchResults, setSearchResults] = useState([]);

    const fetchResults = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/${exerciseType}/?search=${searchText}`)
            .then((res) => res.json())
            .then((json) => setSearchResults(json));
    };
    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            fetchResults();
            return;
        }
        return;
    };

    return (
        <div id="exercise-search-page-body">
            <div id="exercise-search-page-round-background-decoration"></div>
            <div id="exercise-search-page-bottom-top-banner-background-decoration"></div>
            <div id="exercise-search-page-bottom-bot-banner-background-decoration"></div>
            <div id="exercise-search-page-searchbox">
                <input
                    id="exercise-search-page-searchbox-input"
                    type="text"
                    placeholder="Search Exercise"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={inputOnKeydown}
                ></input>
                <button id="exercise-search-page-searchbox-button" onClick={fetchResults}>
                    <img src={magnifyingGlass} />
                </button>
            </div>
            <div id="exercise-search-page-choices">
                <button
                    id="exercise-search-page-choice-cardio"
                    className={`exercise-search-page-choice-button${exerciseType === "cardio" ? "-active" : ""}`}
                    onClick={() => setExerciseType("cardio")}
                >
                    Cardio
                </button>
                <button
                    id="exercise-search-page-choice-strength"
                    className={`exercise-search-page-choice-button${exerciseType === "strength" ? "-active" : ""}`}
                    onClick={() => setExerciseType("strength")}
                >
                    Strength
                </button>
            </div>
            <div id="exercise-search-island">
                <ul id="exercise-search-results-list">
                    {searchResults.length > 0 ? searchResults.map((res) => <ExerciseSearchResult response={res} />) : null}
                </ul>
            </div>
        </div>
    );
}

function ExerciseSearchResult(props) {
    let { _id, name, MET } = props.response;

    const resultOnClick = () => {};
    return (
        <li className="exercise-search-result" onClick={resultOnClick}>
            <h4>{name}</h4>
            <p>MET: {MET}</p>
        </li>
    );
}

/* Utility Functions */
